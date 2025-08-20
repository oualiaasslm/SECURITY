    // server/routes/chatbot.routes.js
    const express = require("express");
    const { Configuration, OpenAIApi } = require("openai");
    require("dotenv").config();

    const router = express.Router();

    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

    router.post("/", async (req, res) => {
    const { message } = req.body;
    try {
        const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
        });
        res.json({ reply: response.data.choices[0].message.content });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur avec OpenAI" });
    }
    });

    module.exports = router;
