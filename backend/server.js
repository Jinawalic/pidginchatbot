const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Paths to JSON files
const RESPONSES_FILE = path.join(__dirname, 'responses.json');
const HISTORY_FILE = path.join(__dirname, 'history.json');

// ------------------- API ROUTES -------------------

// Get all chatbot Q&A
app.get('/api/responses', (req, res) => {
    fs.readFile(RESPONSES_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error reading responses file' });
        res.json(JSON.parse(data));
    });
});

// Save chat history
app.post('/api/save-chat', (req, res) => {
    const { userId, question, answer, sessionId, title } = req.body;
    if (!userId || !question || !answer || !sessionId)
        return res.status(400).json({ error: 'Missing required fields' });

    fs.readFile(HISTORY_FILE, 'utf8', (err, data) => {
        let history = {};
        if (!err && data) history = JSON.parse(data);

        if (!history[userId]) history[userId] = [];

        history[userId].push({
            sessionId,
            title,
            question,
            answer,
            timestamp: new Date().toISOString()
        });

        fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Error saving chat history' });
            res.status(200).json({ message: 'Chat saved successfully' });
        });
    });
});

// Get chat history for a user
app.get('/api/history/:userId', (req, res) => {
    const { userId } = req.params;
    fs.readFile(HISTORY_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error reading history file' });

        const history = JSON.parse(data);
        const userHistory = history[userId] || [];
        res.json(userHistory);
    });
});

// ------------------- SERVE REACT FRONTEND -------------------
const buildPath = path.join(__dirname, "build"); // <-- update this
app.use(express.static(buildPath));

app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
});

// ------------------- START SERVER -------------------
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});