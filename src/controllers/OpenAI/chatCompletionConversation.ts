import axios from "axios";
import { Request, Response } from "express";
import { ApiKey } from "../../models/APIKey";
import { Conversations } from "../../models/Conversations";
import OpenAI from 'openai';

function generateSessionId(length: any) {
    // const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let sessionId = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        sessionId += characters.charAt(randomIndex);
    }
    return sessionId;
}

export async function chatCompletionConversation(req: Request, res: Response) {

    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'No authorization header provided' });
        }

        if (req.headers.authorization.split(' ')[0] !== 'Bearer') {
            return res.status(401).json({ error: 'Invalid authorization header' });
        }

        if(!req.body.messages) return res.status(400).json({ message: 'No messages provided', code: 0 });
        if(!req.body.model) return res.status(400).json({ message: 'No model provided', code: 0 });
        if(!req.body.discordID) return res.status(400).json({ message: 'No discordID provided', code: 0 });

        const providedApiKey = req.headers.authorization.split(' ')[1];

        const foundKey = await ApiKey.findOne({ apiKey: providedApiKey });

        if (!foundKey) {
            return res.status(401).json({ error: 'Invalid API key' });
        } else {

            const sessionID = req.body.sessionID;
            const userID = req.body.discordID;

            if (sessionID) {

                const conversation = await Conversations.findOne({ id: sessionID });

                if(conversation) {
                    const userMessages = req.body.messages
                        .filter((message: any) => message.role === 'user')
                        .map((message: any) => message.content);

                        userMessages.forEach((content: any) => {
                            //@ts-ignore
                            conversation.messages.push({ role: 'user', content });
                        });
                    
                    // Generate AI response based on the last user message
                    const lastUserMessage = userMessages[userMessages.length - 1];

                    if (lastUserMessage) {
                        // const response = await axios.post('https://gpt.daku.tech/v1/chat/completions', { 
                        //     model: req.body.model,
                        //     messages: req.body.messages,
                        //  }, {
                        //     headers: {
                        //         'Authorization': `Bearer sk-xxxx`,
                        //         'Content-Type': 'application/json'
                        //     }
                        // });
    
                        // res.status(200).json({ 
                        //     id: response.data.id,
                        //     object: response.data.object,
                        //     created: response.data.created,
                        //     model: response.data.model,
                        //     choices: response.data.choices,
                        //     usage: response.data.usage,
                        //  });
                        
                        // Construct the conversation history for OpenAI API
                        const conversationHistory = conversation.messages.map((message: any) => ({
                            role: message.role,
                            content: message.content,
                        }));

                        conversationHistory.push({ role: 'user', content: lastUserMessage });

                        // res.status(200).json({message: "working."})

                        const openai = new OpenAI({
                            apiKey: "sk-xxxx",
                            baseURL: 'https://api.daku.tech/v1',
                        });
    
                        const openaiResponse = await openai.chat.completions.create({
                            model: req.body.model,
                            messages: conversationHistory,
                        })
    
                        //@ts-ignore
                        conversation.messages.push({ role: 'assistant', content: openaiResponse.choices[0].message.content });
                        conversation.lastActivity = new Date();
                        conversation.openai_data.id = openaiResponse.id;
                        conversation.openai_data.object = openaiResponse.object;
                        conversation.openai_data.created = openaiResponse.created;
                        conversation.openai_data.model = openaiResponse.model;
                        //@ts-ignore
                        conversation.openai_data.usage.prompt_tokens = openaiResponse.usage.prompt_tokens;
                        //@ts-ignore
                        conversation.openai_data.usage.completion_tokens = openaiResponse.usage.completion_tokens;
                        //@ts-ignore
                        conversation.openai_data.usage.total_tokens = openaiResponse.usage.total_tokens;
    
                        await conversation.save();
    
                        res.status(200).json({
                            id: conversation.id,
                            choices: openaiResponse.choices,
                            lastActivity: conversation.lastActivity,
                            openai_data: conversation.openai_data,
                        });
                    } else {
                        return res.status(400).json({ message: 'No user messages provided', code: 0 });
                    }
                } else {
                    return res.status(400).json({ message: 'No conversation found', code: 0 });
                }

            } else {

                const newConversation = new Conversations({
                    id: generateSessionId(32), // Generate a unique ID
                    discordID: userID,
                    messages: [],
                    lastActivity: new Date(),
                });

                const systemMessages = req.body.messages
                    .filter((message: any) => message.role === 'system')
                    .map((message: any) => message.content);

                // Add system messages to the conversation
                systemMessages.forEach((content: any) => {
                    //@ts-ignore
                    newConversation.messages.push({ role: 'system', content });
                });

                const userMessages = req.body.messages
                    .filter((message: any) => message.role === 'user')
                    .map((message: any) => message.content);

                userMessages.forEach((content: any) => {
                    //@ts-ignore
                    newConversation.messages.push({ role: 'user', content });
                });

                // Generate AI response based on the last user message
                const lastUserMessage = userMessages[userMessages.length - 1];

                if (lastUserMessage) {
                    // const response = await axios.post('https://gpt.daku.tech/v1/chat/completions', { 
                    //     model: req.body.model,
                    //     messages: req.body.messages,
                    //  }, {
                    //     headers: {
                    //         'Authorization': `Bearer sk-xxxx`,
                    //         'Content-Type': 'application/json'
                    //     }
                    // });

                    // res.status(200).json({ 
                    //     id: response.data.id,
                    //     object: response.data.object,
                    //     created: response.data.created,
                    //     model: response.data.model,
                    //     choices: response.data.choices,
                    //     usage: response.data.usage,
                    //  });

                    const openai = new OpenAI({
                        apiKey: "sk-xxxx",
                        baseURL: 'https://api.daku.tech/v1',
                    });

                    const openaiResponse = await openai.chat.completions.create({
                        model: req.body.model,
                        messages: req.body.messages,
                    })

                    //@ts-ignore
                    newConversation.messages.push({ role: 'assistant', content: openaiResponse.choices[0].message.content });
                    newConversation.openai_data.id = openaiResponse.id;
                    newConversation.openai_data.object = openaiResponse.object;
                    newConversation.openai_data.created = openaiResponse.created;
                    newConversation.openai_data.model = openaiResponse.model;
                    //@ts-ignore
                    newConversation.openai_data.usage.prompt_tokens = openaiResponse.usage.prompt_tokens;
                    //@ts-ignore
                    newConversation.openai_data.usage.completion_tokens = openaiResponse.usage.completion_tokens;
                    //@ts-ignore
                    newConversation.openai_data.usage.total_tokens = openaiResponse.usage.total_tokens;

                    await newConversation.save();

                    res.status(200).json({
                        id: newConversation.id,
                        choices: openaiResponse.choices,
                        lastActivity: newConversation.lastActivity,
                        openai_data: newConversation.openai_data,
                    });
                }
            }
        }

    } catch (error) {
        console.error('OpenAI Error.', error);
        res.status(500).json({ message: '502: Bad Gateway', code: 0, error_message: "OPENAI_SERVICE_OFF" });
    }
}