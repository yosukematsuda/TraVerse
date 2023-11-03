const { Configuration, OpenAIApi } = require("openai");
const API_KEY = 'your API key'

const configuration = new Configuration({
    apiKey: API_KEY
});
const openai = new OpenAIApi(configuration);

async function Summary(value) {
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Please summarize the following conversation" },
                { role: "user", content: value }
            ],
        });
        return completion.data.choices[0].message;
    } catch (error) {
        console.error("API request error:", error.message);
    }
};

module.exports = { Summary };