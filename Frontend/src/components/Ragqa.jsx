import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";

const RAGQA = () => {
  const [pdf, setPdf] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);

  // Whenever the user selects a new PDF, clear old state
  useEffect(() => {
    setUploaded(false);
    setAnswer("");
    setQuiz([]);
  }, [pdf]);

  const handleFileChange = (e) => {
    setPdf(e.target.files[0]);
  };

  const uploadPDF = async () => {
    if (!pdf) return alert("Please select a PDF file.");

    const formData = new FormData();
    formData.append("file", pdf);

    try {
      setLoading(true);
      await axios.post("http://localhost:8000/upload", formData);
      alert("PDF uploaded and processed successfully.");
      setUploaded(true);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload PDF.");
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return alert("Please enter a question.");

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/ask", { question });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error("Failed to get answer:", err);
      alert("Error fetching answer.");
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/quiz-generate");

      // Clean out the ```json markers and parse
      const raw = res.data.quiz.replace(/```json\s*|\s*```/g, "");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Quiz is not an array");
      setQuiz(parsed);
    } catch (err) {
      console.error("Error generating quiz:", err);
      alert("Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  const downloadQuiz = () => {
    const blob = new Blob([JSON.stringify(quiz, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "quiz.json";
    link.click();
  };

  return (
    <div className="app">
      <h1>📄 RAG PDF Q&A (Gemini)</h1>

      {/* PDF Upload */}
      <section>
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        <button onClick={uploadPDF} disabled={loading || !pdf}>
          {uploaded ? "Re-upload PDF" : "Upload PDF"}
        </button>
      </section>

      {/* Q&A */}
      <section>
        <input
          type="text"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={!uploaded}
        />
        <button onClick={askQuestion} disabled={loading || !uploaded}>
          Ask
        </button>
      </section>

      {/* Quiz Generation */}
      <section>
        <button onClick={generateQuiz} disabled={loading || !uploaded}>
          Generate Quiz
        </button>
      </section>

      {loading && <p>Loading…</p>}

      {/* Display Answer */}
      {answer && (
        <section className="answer">
          <h3>Answer:</h3>
          <p>{answer}</p>
        </section>
      )}

      {/* Display Quiz */}
      {quiz.length > 0 && (
        <section className="quiz">
          <h3>Generated Quiz</h3>
          {quiz.map((item, i) => (
            <div key={i} className="quiz-item">
              <p><strong>Q{i + 1}:</strong> {item.question}</p>
              <ul>
                {item.options.map((opt, j) => (
                  <li key={j}>{opt}</li>
                ))}
              </ul>
              <p><strong>Correct:</strong> {item.correct_answer}</p>
            </div>
          ))}
          <button onClick={downloadQuiz}>Download as JSON</button>
        </section>
      )}
    </div>
  );
};

export default RAGQA;
