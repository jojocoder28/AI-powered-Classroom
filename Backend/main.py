from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import json

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Change if your frontend URL differs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
retriever = None
rag_chain = None
quiz_cache = {}

class QuestionRequest(BaseModel):
    question: str

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global retriever, rag_chain, quiz_cache

    # Clear previous uploads and quiz cache
    if os.path.exists("uploaded_docs"):
        shutil.rmtree("uploaded_docs")
    quiz_cache.clear()

    # Save new file
    os.makedirs("uploaded_docs", exist_ok=True)
    file_path = f"uploaded_docs/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Process PDF
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000)
    docs = text_splitter.split_documents(documents)

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
        "don't know. Use seven sentences maximum and keep the "
        "answer concise.\n\n"
        "{context}"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return {"message": "PDF uploaded and processed successfully."}

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    if rag_chain is None:
        return {"error": "PDF not uploaded yet."}
    
    response = rag_chain.invoke({"input": request.question})
    return {"answer": response["answer"]}

@app.get("/quiz-generate")
async def generate_quiz():
    global quiz_cache, retriever

    if retriever is None:
        return {"error": "PDF not uploaded yet."}
    
    if "quiz" in quiz_cache:
        return {"quiz": quiz_cache["quiz"]}

    context_docs = retriever.get_relevant_documents("generate a quiz")
    context_text = "\n\n".join([doc.page_content for doc in context_docs])

    prompt = (
        "You are an expert teacher. Based on the following context from a course PDF, "
        "generate a JSON quiz with 10 questions. Each question must have:\n"
        "- a 'question' field,\n"
        "- an 'options' list (4 options), and\n"
        "- a 'correct_answer' field.\n"
        "The output format should be a valid JSON list of objects.\n\n"
        "Context:\n"
        f"{context_text}\n\n"
        "Generate the quiz now:"
    )

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0)

    try:
        response = llm.invoke(prompt)
        quiz_cache["quiz"] = response.content  # Cache new quiz
        return {"quiz": response.content}
    except Exception as e:
        return {"error": str(e)}
