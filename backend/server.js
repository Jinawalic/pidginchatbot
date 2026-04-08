const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Anthropic (Claude)
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
const corsOptions = {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// ------------------- API ROUTES -------------------

// Claude Chat Route
app.post('/api/chat', async (req, res) => {
    const { question, userId, sessionId } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    try {
        // Call Claude AI
        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: "You be AgricBot, a helpful agricultural assistant for farmers. You must always speak in Nigerian Pidgin English. Keep your answers simple, practical, and helpful for local farmers. If person ask you something wey no concern agriculture, try bring am back to farming or answer am small but focus on being a farm assistant.",
            messages: [
                { role: "user", content: question }
            ],
        });

        const answer = response.content[0].text;

        // Save to database if userId and sessionId are provided
        if (userId && sessionId) {
            try {
                // Ensure user exists
                await prisma.user.upsert({
                    where: { userId },
                    update: {},
                    create: { userId }
                });

                // Ensure session exists
                await prisma.chatSession.upsert({
                    where: { id: sessionId },
                    update: {},
                    create: {
                        id: sessionId,
                        userId,
                        title: question.substring(0, 50) || 'Chat Session'
                    }
                });

                // Save message
                await prisma.chatMessage.create({
                    data: {
                        sessionId,
                        question,
                        answer,
                        role: 'assistant'
                    }
                });
            } catch (dbError) {
                console.warn('Database save warning:', dbError.message);
                // Don't fail the API if database save fails
            }
        }

        res.json({ answer });
    } catch (error) {
        console.error('Claude AI Error:', error.message);
        res.status(500).json({ error: 'AI error: ' + error.message });
    }
});

// Get all chatbot Q&A responses
app.get('/api/responses', async (req, res) => {
    try {
        const responses = await prisma.response.findMany();
        res.status(200).json(responses || []);
    } catch (error) {
        console.error('Error fetching responses:', error);
        // Return 200 with empty array instead of 500 error
        res.status(200).json([]);
    }
});

// Get chat history for a user
app.get('/api/history/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const messages = await prisma.chatMessage.findMany({
            where: {
                session: {
                    userId: userId
                }
            },
            include: {
                session: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        res.status(200).json(messages || []);
    } catch (error) {
        console.error('Error fetching history for user', userId, ':', error.message);
        // Return 200 with empty array instead of 500 error
        res.status(200).json([]);
    }
});

// Save chat history (via Prisma)
app.post('/api/save-chat', async (req, res) => {
    const { userId, question, answer, sessionId, title } = req.body;
    if (!userId || !question || !answer || !sessionId)
        return res.status(400).json({ error: 'Missing required fields' });

    try {
        // Ensure user exists
        await prisma.user.upsert({
            where: { userId },
            update: {},
            create: { userId }
        });

        // Ensure session exists
        await prisma.chatSession.upsert({
            where: { id: sessionId },
            update: { title: title || title },
            create: {
                id: sessionId,
                userId,
                title: title || question.substring(0, 50)
            }
        });

        // Save message
        await prisma.chatMessage.create({
            data: {
                sessionId,
                question,
                answer,
                role: 'assistant'
            }
        });

        res.status(200).json({ message: 'Chat saved successfully' });
    } catch (error) {
        console.error('Error saving chat:', error.message);
        res.status(500).json({ error: 'Error saving chat' });
    }
});

// Get chat history for a user
app.get('/api/history/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { userId },
            include: {
                sessions: {
                    include: {
                        messages: {
                            orderBy: { createdAt: 'asc' }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) {
            return res.json([]);
        }

        // Format response similar to old JSON structure
        const history = [];
        user.sessions.forEach(session => {
            session.messages.forEach(msg => {
                history.push({
                    sessionId: session.id,
                    title: session.title,
                    question: msg.question,
                    answer: msg.answer,
                    timestamp: msg.createdAt.toISOString()
                });
            });
        });

        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error.message);
        res.status(500).json({ error: 'Error fetching history' });
    }
});

// Get specific session
app.get('/api/session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    try {
        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json(session);
    } catch (error) {
        console.error('Error fetching session:', error.message);
        res.status(500).json({ error: 'Error fetching session' });
    }
});

// ------------------- SERVE REACT FRONTEND -------------------
const buildPath = path.join(__dirname, "build");
app.use(express.static(buildPath));

app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
});

// ------------------- START SERVER -------------------
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
