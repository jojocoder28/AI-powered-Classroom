// src/components/CourseQA.jsx
import { useState } from "react";

function CourseQA() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF file!");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8000/upload/", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    alert(data.message || data.error);
  };

  const handleAsk = async () => {
    const formData = new FormData();
    formData.append("question", question);

    const res = await fetch("http://localhost:8000/ask/", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setAnswer(data.answer);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>📘 Upload PDF & Ask Questions (RAG + Gemini)</h2>

      <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} style={{ marginLeft: "1rem" }}>
        Upload
      </button>

      <div style={{ marginTop: "2rem" }}>
        <input
          type="text"
          placeholder="Ask something..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ width: "300px" }}
        />
        <button onClick={handleAsk} style={{ marginLeft: "1rem" }}>
          Ask
        </button>
      </div>

      {answer && (
        <div style={{ marginTop: "2rem", background: "#eee", padding: "1rem", borderRadius: "10px" }}>
          <strong>Answer:</strong>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default CourseQA;
