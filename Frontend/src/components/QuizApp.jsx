import React, { useState } from 'react';
import axios from 'axios';

function QuizPage() {
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!pdfFile) return;

    setUploading(true);
    setResult(null);
    setQuiz([]);
    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      await axios.post('http://localhost:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      fetchQuiz(); // Trigger quiz generation after upload
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/quiz-generate');
      let quizText = res.data.quiz;

      // Clean up Markdown-style code block
      quizText = quizText.replace(/```json|```/g, '').trim();

      const parsedQuiz = JSON.parse(quizText);
      setQuiz(parsedQuiz);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionIndex, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    let score = 0;
    const detailedResults = quiz.map((q, index) => {
      const correct = q.correct_answer === answers[index];
      if (correct) score++;
      return {
        question: q.question,
        selected: answers[index] || 'Not attempted',
        correct: q.correct_answer,
        isCorrect: correct,
      };
    });
    setResult({ score, detailedResults });
    setSubmitting(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Generate Quiz from Pdf</h1>

      {/* PDF Upload Section */}
      <div style={{ marginBottom: '20px' }}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!pdfFile || uploading}>
          {uploading ? 'Uploading...' : 'Upload PDF & Generate Quiz'}
        </button>
      </div>

      {/* Quiz Loading */}
      {loading && <p> Loading quiz, please wait...</p>}

      {/* Quiz Display */}
      {!loading && quiz.length > 0 && (
        <>
          {quiz.map((q, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <p><strong>{index + 1}. {q.question}</strong></p>
              {q.options.map((option, optIdx) => (
                <label key={optIdx} style={{ display: 'block', marginLeft: '20px' }}>
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={answers[index] === option}
                    onChange={() => handleOptionChange(index, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </>
      )}

      {/* Results */}
      {result && (
        <div style={{ marginTop: '30px' }}>
          <h2>Your Score: {result.score} / {quiz.length}</h2>
          <h3>Detailed Feedback:</h3>
          {result.detailedResults.map((res, i) => (
            <div key={i} style={{ color: res.isCorrect ? 'green' : 'red', marginBottom: '10px' }}>
              <strong>Q:</strong> {res.question} <br />
              <strong>Your Answer:</strong> {res.selected} <br />
              {!res.isCorrect && (
                <>
                  <strong>Correct Answer:</strong> {res.correct} <br />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizPage;
