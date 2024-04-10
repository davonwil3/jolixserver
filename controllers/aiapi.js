const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY)
const User = require('../models/schemas').User;
const Project = require('../models/schemas').Project;

const generateText = async (req, res) => {
   
    try {
        const { prompt } = req.body;
        const { size } = req.body;
        let promptString = 'generate content for the following prompt : ' + prompt;
        let maxTokens = 150;
        if (size === 'Short') {
            maxTokens = 700;
            promptString = 'generate short form essay for the following prompt : ' + prompt;


        } else if (size === 'Medium') {
            maxTokens = 1200;
            promptString = 'generate medium form essay for the following prompt : ' + prompt;

        }
        else if (size === 'Long') {
            maxTokens = 3000;
            promptString = 'generate long form essay for the following prompt : ' + prompt;

        }

        console.log(maxTokens);
        
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    role: "user",
                    content: promptString
                }
            ],
            max_tokens: maxTokens,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.data.choices && response.data.choices.length > 0) {
            const lastMessage = response.data.choices[0].message.content;
            res.json({ result: lastMessage });
        } else {
            res.status(500).send('Failed to generate text: Empty response from OpenAI');
        }
    } catch (error) {
        console.error('OpenAI API request failed:', error);
        res.status(500).send('Failed to generate text');
    }
};


const rephraseText = async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 450,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.data.choices && response.data.choices.length > 0) {
            const lastMessage = response.data.choices[0].message.content;
            console.log(lastMessage);
            res.json({ result: lastMessage });
        } else {
            res.status(500).send('Failed to generate text: Empty response from OpenAI');
        }
    } catch (error) {
        console.error('OpenAI API request failed:', error);
        res.status(500).send('Failed to generate text');
    }
};


const summarize = async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    console.log(url);
    try {
        const articleContent = await fetchArticleContent(url);
        if (!articleContent) {
            console.log('Failed to fetch article content');
            return res.status(404).json({ error: 'Failed to fetch article content.' });
        }

        const summary = await summarizeText(articleContent);

        console.log(summary);

        res.json({ summary: summary.summary });
    } catch (error) {
        console.error('Error summarizing article:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

async function fetchArticleContent(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const articleText = $('p').text();
        return articleText;
    } catch (error) {
        console.error('Error fetching article:', error);
        return null;
    }
}

async function summarizeText(text) {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    role: "user",
                    content: 'summarize the following passage' + text
                }
            ],
            max_tokens: 500,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.data.choices && response.data.choices.length > 0) {
            const summary = response.data.choices[0].message.content;
            return { summary };
        } else {
            throw new Error('Failed to generate text: Empty response from OpenAI');
        }
    } catch (error) {
        console.error('OpenAI API request failed:', error);
        throw new Error('Failed to generate text');
    }
}

async function generateCitation(req, res) {
    try {
        const { citationType } = req.body;
        const { citationObject } = req.body;
        const { format } = req.body;
        let citationString = '';

        if (citationType === 'Book') {
            const { author, title, publisher, yearOfPublication } = citationObject;
            citationString = `Please create a citation in ${format} format for a book with the following details: 
            Author: ${author}, 
            Title: ${title}, 
            Publisher: ${publisher}, 
            Year of Publication: ${yearOfPublication}`;
        } else if (citationType === 'Web') {
            const { author, title, websiteTitle, url, publicationDate } = citationObject;
            citationString = `Please create a citation in ${format} format for a web source with the following details: 
            Author: ${author}, 
            Title: ${title}, 
            Website Title: ${websiteTitle}, 
            URL: ${url}, 
            Publication Date: ${publicationDate}`;
        }

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    role: "user",
                    content: citationString
                }
            ],
            max_tokens: 150,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.data.choices && response.data.choices.length > 0) {
            const citation = response.data.choices[0].message.content;
            console.log(citation);
            res.json({ citation });
        } else {
            res.status(500).send('Failed to generate citation: Empty response from OpenAI');
        }
    } catch (error) {
        console.error('OpenAI API request failed:', error);
        res.status(500).send('Failed to generate citation');
    }
}

async function loadMessages(req, res) {
    const {firebaseUid} = req.body;
    const {projectId} = req.body;

    try {
        let user = await User.findOne({ firebaseUid: firebaseUid});

        let project = user.projects.find(project => project.projectId === Number(projectId));
        let threadId = project.chat;

        if (!threadId) {
            console.log('Creating new thread...');
            const thread = await openai.beta.threads.create();

            // Find the project to update
            let projectToUpdate = user.projects.find(p => p.projectId === project.projectId);
            if (projectToUpdate) {
                // Update the project and save the user
                console.log('Updating project with chat ID...');
                projectToUpdate.chat = thread.id;
                await user.save();
            } else {
                console.log(`Project with id ${project.projectId} not found.`);
            }

            threadId = thread.id;
        }

        const messages = await openai.beta.threads.messages.list(threadId);

        console.log(messages.data);

        res.json(messages.data);

    } catch (err) {
        console.error('Error finding user:', err);
        return res.status(500).send('Failed to find user');
    }
}

async function chatbot(req, res) {
    const {firebaseUid} = req.body;
    const {message} = req.body;
    const {projectId} = req.body;

    try {
        let user = await User.findOne({ firebaseUid: firebaseUid });

        let project = user.projects.find(project => project.projectId === Number(projectId));
        let threadId = project.chat;

        if (!threadId) {
            console.log('Creating new thread...');
            const thread = await openai.beta.threads.create();

            // Find the project to update
            let projectToUpdate = user.projects.find(p => p.projectId === project.projectId);
            if (projectToUpdate) {
                // Update the project and save the user
                console.log('Updating project with chat ID...');
                projectToUpdate.chat = thread.id;
                await user.save();
            } else {
                console.log(`Project with id ${project.projectId} not found.`);
            }

            threadId = thread.id;
        }

          
        const threadMessages = await openai.beta.threads.messages.create(
            threadId,
            { role: "user", content: message }
        );

        const run = await openai.beta.threads.runs.create(
            threadId,
            { assistant_id: "asst_CAW4Dp3Tu88eLh5RqlInzRNv" }
        );

        console.log(threadId);
        while (true) {
            console.log('Checking thread status...' + threadId);
            const runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
            console.log(JSON.stringify(runStatus.model_dump_json, null, 4));
            if (runStatus.status === 'completed') {
                const messages = await openai.beta.threads.messages.list(threadId);
                res.json(messages.data[0]);
                break;
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    } catch (err) {
        console.error('Error finding user:', err);
        return res.status(500).send('Failed to find user');
    }
}


module.exports = {
    generateText,
    rephraseText,
    summarize,
    generateCitation,
    chatbot,
    loadMessages
};