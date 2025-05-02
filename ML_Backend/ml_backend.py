from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import numpy as np
from PIL import Image
import os
import shutil
from dotenv import load_dotenv
import io
import json

# LangChain & Gemini
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

app = Flask(__name__)
CORS(app)

# ------------------ YOLO Detection Setup ------------------ #
model = YOLO("./Models/best.pt")  # Your trained YOLO model

@app.route('/detect', methods=['POST'])
def detect():
    if 'frame' not in request.files:
        return jsonify({"error": "No frame received"}), 400

    file = request.files['frame']
    image = Image.open(file.stream).convert("RGB")
    image_np = np.array(image)

    results = model(image_np)
    class_names = model.names
    detections = []

    for result in results:
        boxes = result.boxes
        for box in boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            detections.append({
                "class_id": cls_id,
                "class_name": class_names[cls_id],
                "confidence": round(conf, 3)
            })

    return jsonify({"detections": detections})


# ------------------ PDF RAG + Gemini Setup ------------------ #
retriever = None
rag_chain = None
quiz_cache = {}

@app.route('/upload', methods=['POST'])
def upload_pdf():
    global retriever, rag_chain, quiz_cache

    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    # Clear previous uploads
    if os.path.exists("uploaded_docs"):
        shutil.rmtree("uploaded_docs")
    os.makedirs("uploaded_docs", exist_ok=True)
    quiz_cache.clear()

    file_path = f"uploaded_docs/{file.filename}"
    file.save(file_path)

    # PDF Processing
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000)
    docs = splitter.split_documents(documents)

    vectorstore = Chroma.from_documents(
        docs,
        embedding=GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    )
    retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 10})

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0)

    system_prompt = (
        "You are an assistant for question-answering tasks. "
        "Use the following pieces of retrieved context to answer "
        "the question. If you don't know the answer, say that you "
        "don't know. Use three sentences maximum and keep the answer concise.\n\n"
        "{context}"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return jsonify({"message": "PDF uploaded and processed successfully."})


@app.route('/ask', methods=['POST'])
def ask_question():
    global rag_chain
    if rag_chain is None:
        return jsonify({"error": "PDF not uploaded yet."}), 400

    data = request.get_json()
    question = data.get("question")
    if not question:
        return jsonify({"error": "No question provided"}), 400

    response = rag_chain.invoke({"input": question})
    return jsonify({"answer": response["answer"]})


@app.route('/quiz-generate', methods=['GET'])
def generate_quiz():
    global quiz_cache, retriever

    if retriever is None:
        return jsonify({"error": "PDF not uploaded yet."}), 400

    if "quiz" in quiz_cache:
        return jsonify({"quiz": quiz_cache["quiz"]})

    context_docs = retriever.get_relevant_documents("generate a quiz")
    context_text = "\n\n".join([doc.page_content for doc in context_docs])

    prompt = (
        "You are an expert teacher. Based on the following context from a course PDF, "
        "generate a JSON quiz with 10 questions. Each question must have:\n"
        "- a 'question' field,\n"
        "- an 'options' list (4 options), and\n"
        "- a 'correct_answer' field.\n"
        "The output format should be a valid JSON list of objects.\n\n"
        f"Context:\n{context_text}\n\n"
        "Generate the quiz now:"
    )

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0)

    try:
        response = llm.invoke(prompt)
        quiz_cache["quiz"] = response.content
        return jsonify({"quiz": response.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
