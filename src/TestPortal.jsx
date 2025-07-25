import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./TestPortal.css";

const questions = [
  { question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4" },
  { question: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Lisbon"], answer: "Paris" },
  { question: "What is the largest planet?", options: ["Earth", "Mars", "Jupiter", "Saturn"], answer: "Jupiter" },
];

const TestPortal = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedOptions, setSelectedOptions] = useState(Array(questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    let timer;
    if (isTestStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [isTestStarted, timeLeft]);

  const handleStartTest = () => {
    if (name.trim() === "") {
      alert("Please enter your name to start the test.");
      return;
    }
    setIsTestStarted(true);
  };

  const handleOptionChange = (index, option) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[index] = option;
    setSelectedOptions(newSelectedOptions);
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    selectedOptions.forEach((option, index) => {
      if (option === questions[index].answer) {
        correctAnswers++;
      }
    });
    setScore((correctAnswers / questions.length) * 100);
    setIsTestSubmitted(true);
    setIsTestStarted(false);
  };

  const handleDownloadCertificate = () => {
    const input = document.getElementById("certificate");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "px", [canvas.width, canvas.height]);
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${name}_certificate.pdf`);
    });
  };

  return (
    <div className="test-portal">
      <header className="nav-header">
        <img
          src="https://github.com/Krishnapal-rajput/Classroom24x7-index/blob/main/logo/App%20icon%20Log%20512x512.jpg?raw=true"
          alt="Classroom 24x7 Logo"
          className="logo-image"
        />
        <button className="go-home-btn" onClick={() => navigate("/")}>Go to Home</button>
      </header>

      <main className="test-content">
        {!isTestStarted && !isTestSubmitted && (
          <div className="start-test">
            <h2>Enter Your Name to Start the Test</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
            />
            <button onClick={handleStartTest}>Start Test</button>
          </div>
        )}

        {isTestStarted && (
          <div className="test-questions">
            <h2>Test Questions</h2>
            <p>Time Left: {Math.floor(timeLeft / 60)}:{("0" + (timeLeft % 60)).slice(-2)}</p>
            {questions.map((q, index) => (
              <div key={index} className="question">
                <h3>{q.question}</h3>
                {q.options.map((option) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={selectedOptions[index] === option}
                      onChange={() => handleOptionChange(index, option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            ))}
            <button onClick={handleSubmit}>Submit</button>
          </div>
        )}

        {isTestSubmitted && (
          <div className="test-results">
            <h2>Test Completed!</h2>
            <p>Your Score: {score.toFixed(2)}%</p>
            {score > 75 ? (
              <div>
                <p>Congratulations! You are eligible to claim a certificate.</p>
                {!showCertificate ? (
                  <button onClick={() => setShowCertificate(true)}>Claim Certificate</button>
                ) : (
                  <>
                    <div id="certificate" className="certificate" style={{ display: "block" }}>
                      <div
                      >
                        <img
                          src="https://github.com/Krishnapal-rajput/Classroom24x7-index/blob/main/logo/App%20icon%20Log%20512x512.jpg?raw=true"
                          alt="Classroom 24x7 Logo"
                          style={{ height: "80px", marginBottom: "20px" }}
                        />
                        <h1 style={{ fontSize: "40px", marginBottom: "20px" }}>Certificate of Achievement</h1>
                        <p style={{ fontSize: "20px" }}>This is to certify that</p>
                        <h2 style={{ fontSize: "30px", margin: "10px 0" }}>{name}</h2>
                        <p style={{ fontSize: "20px" }}>has successfully completed the online test with a score of</p>
                        <h2 style={{ fontSize: "26px" }}>{score.toFixed(2)}%</h2>
                        <p style={{ fontSize: "18px", marginTop: "30px" }}>Presented by Classroom 24x7</p>
                        <p style={{ marginTop: "40px" }}>Date: {new Date().toLocaleDateString()}</p>
                        <div
                        >
                          Digitally Signed by <strong>Jitendra Kumar Makwana</strong>
                        </div>
                      </div>
                    </div>
                    <button onClick={handleDownloadCertificate} style={{ marginTop: "20px" }}>
                      Download Certificate
                    </button>
                  </>
                )}
              </div>
            ) : (
              <p>Sorry, you need to score more than 75% to receive a certificate.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TestPortal;
