const API_KEY = ""; 
const API_URL =
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
// START PAGE

const startPage = document.getElementById("start-page");
const quizPage = document.getElementById("quiz-page");
const resultPage = document.getElementById("result-page");

// INPUTS

const userName = document.getElementById("user-name");
const topicName = document.getElementById("topic-name");
const difficulty = document.getElementById("difficulty");
const questionCount = document.getElementById("question-count");


// BUTTON
const generateBtn = document.getElementById("generate-btn");
const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");


// QUIZ AREA

const questionNumber = document.getElementById("question-number");

const timerText = document.getElementById("timer");

const questionBox = document.getElementById("question-box");

const optionsBox = document.getElementById("options-box");

const explanationBox = document.getElementById("explanation-box");


// RESULT AREA

const finalScore = document.getElementById("final-score");

const bestStreakText = document.getElementById("best-streak");

const reviewSection = document.getElementById("review-section");

const statusText = document.getElementById("status-text");


// VARIABLES

let questions = [];

let currentQuestion = 0;

let score = 0;

let streak = 0;

let bestStreak = 0;

let timeLeft = 30;

let timer;


// GENERATE QUIZ

generateBtn.addEventListener("click", async () => {

    statusText.innerText = "Generating quiz...";

    const topic = topicName.value || "General Knowledge";

    const level = difficulty.value;

    const count = questionCount.value;

    questions = await generateQuestions(topic, level, count);

    if (questions.length > 0) {

        statusText.innerText = "Quiz Ready";

        startBtn.disabled = false;

    } else {

        statusText.innerText = "Using Offline Questions";

        questions = sampleQuestions();

        startBtn.disabled = false;
    }

});


// START QUIZ

startBtn.addEventListener("click", () => {

    startPage.style.display = "none";

    quizPage.style.display = "block";

    loadQuestion();

});


// LOAD QUESTION

function loadQuestion() {

    clearInterval(timer);

    timeLeft = 30;

    timerText.innerText = `${timeLeft}s`;

    explanationBox.style.display = "none";

    explanationBox.innerHTML = "";

    optionsBox.innerHTML = "";

    const q = questions[currentQuestion];

    questionNumber.innerText =
        `Question ${currentQuestion + 1}/${questions.length}`;

    questionBox.innerText = q.question;

    q.options.forEach((option, index) => {

        const btn = document.createElement("button");

        btn.innerText = option;

        btn.classList.add("option-btn");

        btn.onclick = () => checkAnswer(index, btn);

        optionsBox.appendChild(btn);

    });

    startTimer();

}


// TIMER

function startTimer() {

    timer = setInterval(() => {

        timeLeft--;

        timerText.innerText = `${timeLeft}s`;

        if (timeLeft <= 0) {

            clearInterval(timer);

            disableButtons();

            showExplanation(false);

        }

    }, 1000);

}


// CHECK ANSWER

function checkAnswer(selectedIndex, button) {

    clearInterval(timer);

    const correctIndex =
        questions[currentQuestion].correct;

    const buttons =
        document.querySelectorAll(".option-btn");

    if (selectedIndex === correctIndex) {

        button.style.background = "#4CAF50";

        score++;

        streak++;

        if (streak > bestStreak) {

            bestStreak = streak;
        }

        showExplanation(true);

    } else {

        button.style.background = "#ff4d4d";

        buttons[correctIndex].style.background =
            "#4CAF50";

        streak = 0;

        showExplanation(false);
    }

    disableButtons();

}


// DISABLE OPTIONS

function disableButtons() {

    const buttons =
        document.querySelectorAll(".option-btn");

    buttons.forEach(btn => {

        btn.disabled = true;

    });

}


// SHOW EXPLANATION

function showExplanation(correct) {

    explanationBox.style.display = "block";

    explanationBox.innerHTML = correct
        ? `Correct Answer <br><br>
           ${questions[currentQuestion].explanation}`
        : `Wrong Answer <br><br>
           ${questions[currentQuestion].explanation}`;

}


// NEXT QUESTION

nextBtn.addEventListener("click", () => {

    currentQuestion++;

    if (currentQuestion < questions.length) {

        loadQuestion();

    } else {

        showResult();
    }

});


// RESULT PAGE

function showResult() {

    quizPage.style.display = "none";

    resultPage.style.display = "block";

    finalScore.innerText =
        `${userName.value || "Student"} scored ${score}
         out of ${questions.length}`;

    bestStreakText.innerText =
        `Best Streak : ${bestStreak}`;

    reviewSection.innerHTML = "";

    questions.forEach((q, index) => {

        const div = document.createElement("div");

        div.classList.add("review-card");

        div.innerHTML = `
            <h3>Q${index + 1}</h3>

            <p>${q.question}</p>

            <p>
            Correct Answer :
            ${q.options[q.correct]}
            </p>

            <p>
            ${q.explanation}
            </p>
        `;

        reviewSection.appendChild(div);

    });

}


// GEMINI API

async function generateQuestions(topic, level, count) {

    try {

        if (API_KEY === "") {

            return [];
        }

        const prompt = `
Generate ${count} MCQ questions on ${topic}.

Difficulty level should be ${level}.

Return only valid JSON array.

Format:

[
 {
  "question":"Question text",
  "options":["A","B","C","D"],
  "correct":0,
  "explanation":"Short explanation"
 }
]
`;

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]

            })

        });

        const data = await response.json();

        const text =
            data.candidates[0].content.parts[0].text;

        return JSON.parse(text);

    } catch (error) {

        console.log(error);

        return [];
    }

}


// SAMPLE QUESTIONS

function sampleQuestions() {

    return [

        {
            question:
                "Which instrument measures current?",

            options:
                ["Voltmeter", "Ammeter",
                 "Wattmeter", "CRO"],

            correct: 1,

            explanation:
                "Ammeter is used to measure electric current."
        },

        {
            question:
                "What is the SI unit of resistance?",

            options:
                ["Volt", "Ampere",
                 "Ohm", "Watt"],

            correct: 2,

            explanation:
                "Resistance is measured in Ohm."
        },

        {
            question:
                "KCL stands for?",

            options:
                [
                    "Kirchhoff Current Law",
                    "Kirchhoff Circuit Law",
                    "Kelvin Current Law",
                    "Current Voltage Law"
                ],

            correct: 0,

            explanation:
                "KCL states sum of currents at node is zero."
        }

    ];

}
