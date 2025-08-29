const questions = [
    {
        question: "What is the capital of India?",
        answers: [
            { text: "Mumbai", correct: false },
            { text: "New Delhi", correct: true },
            { text: "Kolkata", correct: false },
            { text: "Chennai", correct: false }
        ]
    },
    {
        question: "Who is known as the Father of the Nation in India?",
        answers: [
            { text: "Subhas Chandra Bose", correct: false },
            { text: "Jawaharlal Nehru", correct: false },
            { text: "Mahatma Gandhi", correct: true },
            { text: "B. R. Ambedkar", correct: false }
        ]
    },
    {
        question: "Which Indian festival is known as the Festival of Lights?",
        answers: [
            { text: "Holi", correct: false },
            { text: "Diwali", correct: true },
            { text: "Eid", correct: false },
            { text: "Pongal", correct: false }
        ]
    },
    {
        question: "Which is the national animal of India?",
        answers: [
            { text: "Lion", correct: false },
            { text: "Elephant", correct: false },
            { text: "Tiger", correct: true },
            { text: "Peacock", correct: false }
        ]
    },
    {
        question: "In which year did India gain independence from British rule?",
        answers: [
            { text: "1950", correct: false },
            { text: "1947", correct: true },
            { text: "1930", correct: false },
            { text: "1942", correct: false }
        ]
    }
];

  
  const questionContainer = document.getElementById("question-container");
  const questionElement = document.getElementById("question");
  const answerButtons = document.getElementById("answer-buttons");
  const nextButton = document.getElementById("next-btn");
  const scoreContainer = document.getElementById("score-container");
  
  let currentQuestionIndex = 0;
  let score = 0;
  
  function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerText = "Next";
    scoreContainer.innerHTML = "";
    showQuestion();
  }
  
  function showQuestion() {
    resetState();
    const currentQuestion = questions[currentQuestionIndex];
    questionElement.innerText = currentQuestion.question;
  
    currentQuestion.answers.forEach(answer => {
      const button = document.createElement("button");
      button.innerText = answer.text;
      button.classList.add("btn");
      if (answer.correct) {
        button.dataset.correct = answer.correct;
      }
      button.addEventListener("click", selectAnswer);
      answerButtons.appendChild(button);
    });
  }
  
  function resetState() {
    nextButton.style.display = "none";
    answerButtons.innerHTML = "";
  }
  
  function selectAnswer(e) {
    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct === "true";
  
    Array.from(answerButtons.children).forEach(button => {
      setStatusClass(button, button.dataset.correct === "true");
      button.disabled = true;
    });
  
    if (correct) {
      score++;
    }
  
    nextButton.style.display = "inline-block";
  }
  
  function setStatusClass(element, correct) {
    clearStatusClass(element);
    if (correct) {
      element.classList.add("correct");
    } else {
      element.classList.add("wrong");
    }
  }
  
  function clearStatusClass(element) {
    element.classList.remove("correct");
    element.classList.remove("wrong");
  }
  
  nextButton.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      showScore();
    }
  });
  
  function showScore() {
    resetState();
    questionElement.innerText = `You scored ${score} out of ${questions.length}!`;
    nextButton.innerText = "Try Again";
    nextButton.style.display = "inline-block";
    nextButton.onclick = startQuiz;
  }
  
  startQuiz();