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

@app.route('/process_assignment_pdfs', methods=['POST'])
def process_assignment_pdfs():
    global retriever, rag_chain, quiz_cache

    data = request.get_json()
    file_paths = data.get("file_paths", [])

    if not file_paths:
        return jsonify({"error": "No file paths provided."}), 400

    # Clear previous RAG data and quiz cache
    # Note: If you want to maintain RAG across multiple calls, you might need a different approach
    # For this implementation, each call processes a new set of PDFs.
    retriever = None
    rag_chain = None
    quiz_cache.clear()

    all_documents = []
    for file_path in file_paths:
        try:
            loader = PyPDFLoader(file_path)
            all_documents.extend(loader.load())
        except Exception as e:
            print(f"Error loading PDF {file_path}: {e}")
            # Optionally, you might want to return an error or skip this file
            continue # Skip to the next file if one fails to load

    if not all_documents:
        return jsonify({"error": "No documents could be loaded from the provided paths."}), 400

    # PDF Processing (using combined documents)
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000)
    docs = splitter.split_documents(all_documents)

    # Assuming you still want to use Chroma for vector storage
    # Consider clearing previous Chroma data if necessary, depending on your needs
    # For this implementation, we create a new vector store each time
    try:
        vectorstore = Chroma.from_documents(
            docs,
            embedding=GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        )
        retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 10})
    except Exception as e:
        print(f"Error creating vectorstore or retriever: {e}")
        return jsonify({"error": "Failed to create RAG components."}), 500

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0)

    system_prompt = (
        "You are an assistant for question-answering tasks. "
        "Use the following pieces of retrieved context to answer "
        "the question. If you don't know the answer, say that you "
        "don't know. Use three sentences maximum and keep the answer concise."
        "{context}"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return jsonify({"message": "PDFs processed and RAG built successfully."})


@app.route('/ask', methods=['POST'])
def ask_question():
    global rag_chain
    if rag_chain is None:
        return jsonify({"error": "RAG not built yet from PDFs."}), 400

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
        return jsonify({"error": "RAG not built yet from PDFs."}), 400

    if "quiz" in quiz_cache:
        return jsonify({"quiz": quiz_cache["quiz"]})

    # Fetch more documents for better quiz generation context
    context_docs = retriever.get_relevant_documents("generate a quiz about the document content")
    context_text = "".join([doc.page_content for doc in context_docs])

    prompt = (
        "You are an expert teacher. Based on the following context from the provided documents, "
        "generate a JSON quiz with 10 multiple-choice questions. "
        "Each question must have:"
        "- a 'question' field,"
        "- an 'options' list (exactly 4 options), and"
        "- a 'correct_answer' field that matches one of the options."
        "The output format must be a valid JSON list of objects."
        f"Context:{context_text}"
        "Generate the quiz now:"
    )

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0)

    try:
        response = llm.invoke(prompt)
        # Attempt to parse and re-serialize to ensure valid JSON output
        quiz_data = json.loads(response.content)
        quiz_cache["quiz"] = json.dumps(quiz_data)
        return jsonify({"quiz": quiz_cache["quiz"]})
    except json.JSONDecodeError as e:
         print(f"Error decoding JSON from LLM response: {e}")
         return jsonify({"error": "Failed to generate valid JSON quiz."}), 500
    except Exception as e:
        print(f"Error generating quiz: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Consider changing the port if needed
    app.run(debug=True, port=5001)
