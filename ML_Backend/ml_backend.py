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
import requests
import tempfile


# LangChain & Gemini
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
# from langchain_cohere import CohereEmbeddings

load_dotenv()
COHERE_API_KEY = os.getenv('COHERE_API_KEY')

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

# ------------------ YOLO Detection Setup ------------------ #
model = YOLO("./Models/best.pt")  # Your trained YOLO model

@app.route('/detect', methods=['POST'])
def detect():
    if 'frame' not in request.files:
        return jsonify({"error": "No frame received"}), 400

    file = request.files['frame']
    image = Image.open(file.stream).convert("RGB")
    image=image.resize((96, 96))  # Resize to model input size
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
    file_urls = data.get("file_paths", [])

    if not file_urls:
        return jsonify({"error": "No file URLs provided."}), 400

    retriever = None
    rag_chain = None
    quiz_cache.clear()
    all_documents = []

    for url in file_urls:
        try:
            response = requests.get(url)
            if response.status_code != 200:
                print(f"Failed to fetch PDF from {url}")
                continue
            
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                tmp.write(response.content)
                tmp_path = tmp.name

            loader = PyPDFLoader(tmp_path)
            all_documents.extend(loader.load())

            # Delete temp file after use
            os.remove(tmp_path)

        except Exception as e:
            print(f"Error loading PDF from {url}: {e}")
            continue

    if not all_documents:
        return jsonify({"error": "No documents could be loaded from the provided URLs."}), 400

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000)
    docs = splitter.split_documents(all_documents)

    try:
        vectorstore = Chroma.from_documents(
            docs,
            embedding=GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        )
        retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 10})
    except Exception as e:
        print(f"Error creating vectorstore or retriever: {e}")
        return jsonify({"error": "Failed to create RAG components."}), 500

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)

    system_prompt = (
        "You are an assistant for question-answering tasks. "
        "Use the following pieces of retrieved context to answer the question. "
        "If you don't know the answer, say that you don't know. "
        "Use three sentences maximum and keep the answer concise.\n\n{context}"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return jsonify({"message": "Hi learner, I'am Vidyana your own learning AI."})

def strip_backticks(text):
    if text.startswith("```") and text.endswith("```"):
        return text[3:-3].strip()
    return text

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

    # if "quiz" in quiz_cache:
    #     return jsonify({"quiz": quiz_cache["quiz"]})

    # Fetch more documents for better quiz generation context
    context_docs = retriever.get_relevant_documents("generate a quiz")
    context_text = "\n\n".join([doc.page_content for doc in context_docs])

    prompt = (
        "You are an expert teacher. Based on the following context from a course PDF, "
        "generate a JSON quiz with 10 questions. Each question must have:\n"
        "- a 'question' field,\n"
        "- an 'options' list (4 options), and\n"
        "- a 'correct_answer' field.\n"
        "The output format must be a valid JSON list of objects.\n\n"
        "Context:\n"
        f"{context_text}\n\n"
        "Generate the quiz now:"
    )

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)

    try:
        response = llm.invoke(prompt)
        # print(response.content)
        
        # Attempt to parse and re-serialize to ensure valid JSON output
        response = llm.invoke(prompt)
        quiz_cache["quiz"] = response.content  # Cache new quiz
        return {"quiz": response.content}
    except json.JSONDecodeError as e:
         print(f"Error decoding JSON from LLM response: {e}")
         return jsonify({"error": "Failed to generate valid JSON quiz."}), 500
    except Exception as e:
        print(f"Error generating quiz: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Consider changing the port if needed
    app.run(debug=True, port=5001)
