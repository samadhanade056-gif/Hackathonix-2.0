# InternAI – Smart Internship Portal with AI Skill Matching

InternAI is an AI-powered internship recommendation platform that analyzes student resumes, extracts skills using Natural Language Processing (NLP), and recommends the most suitable internships based on skill matching.

---

## 🚀 Features

* Student Registration and Login
* Resume Upload
* AI Skill Extraction from Resume
* Internship Database
* Match Score Calculation
* Skill Gap Analysis
* Personalized Internship Recommendations

---

## 🧠 How It Works

1. Student uploads their resume
2. AI extracts skills using NLP
3. System compares extracted skills with internship requirements
4. Match score is calculated
5. Best internships are recommended to the student

---

## 🏗 System Architecture

Student
↓
Frontend (HTML / CSS / JavaScript / React)
↓
Backend API (Node.js / Express)
↓
AI Skill Extraction (Python / NLP)
↓
Database (MySQL / MongoDB)
↓
Internship Recommendation System

---

## 💻 Technology Stack

Frontend

* HTML
* CSS
* JavaScript
* React

Backend

* Node.js
* Express.js

AI / Machine Learning

* Python
* spaCy (Natural Language Processing)

Database

* MySQL / MongoDB

Tools

* GitHub
* VS Code
* Figma

---

## 📂 Project Structure

```
smart-internship-portal
│
├── frontend
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── backend
│   ├── server.js
│   └── routes
│
├── ai_model
│   ├── resume_parser.py
│   └── skill_extractor.py
│
├── database
│   └── schema.sql
│
└── README.md
```

---

## 🗄 Database Tables

### Students

* id
* name
* email
* skills

### Internships

* id
* company
* role
* required_skills

### Applications

* id
* student_id
* internship_id
* match_score

---

## ⚙️ Installation

Clone the repository:

```
git clone https://github.com/your-username/smart-internship-portal.git
```

Go to the project folder:

```
cd smart-internship-portal
```

Install backend dependencies:

```
npm install
```

Start the server:

```
npm start
```

---

## 📈 Future Improvements

* AI Resume Improvement Suggestions
* Recruiter Dashboard
* Real-Time Internship Scraping
* AI Interview Preparation Assistant
* Mobile Application

---

## 🎯 Impact

### For Students

* Faster internship discovery
* Better understanding of skill gaps
* Higher application success rate

### For Companies

* Better candidate matching
* Reduced resume screening time

---

## 👨‍💻 Contributors

* Team Member 1
* Team Member 2
* Team Member 3
* Team Member 4

---

## 📜 License

This project is developed for educational and hackathon purposes.
