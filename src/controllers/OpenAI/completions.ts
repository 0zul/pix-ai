import axios from "axios";
import { Request, Response } from "express";
import { ApiKey } from "../../models/APIKey";
import OpenAI from 'openai';
// import { User } from "../../models/User";
// import { ChatGPTClient } from '@waylaidwanderer/chatgpt-api';
// import keyv from "keyv";

export async function completions(req: Request, res: Response) {

    try {
        // const keyvStore = new keyv(process.env.CHAT_MONGO_LOGS as string);

        if(!req.headers.authorization) {
            return res.status(401).json({ error: 'No authorization header provided' });
        }

        if(req.headers.authorization.split(' ')[0] !== 'Bearer') {
            return res.status(401).json({ error: 'Invalid authorization header' });
        }

        if(!req.body.model) return res.status(400).json({ error: 'No model ID provided' });
        if(!req.body.prompt) return res.status(400).json({ error: 'No prompt provided' });

        const providedApiKey = req.headers.authorization.split(' ')[1];

        const foundKey = await ApiKey.findOne({ apiKey: providedApiKey });

        if(!foundKey) {
            return res.status(401).json({ error: 'Invalid API key' });
        } else {

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

            const response = await openai.completions.create({
                model: req.body.model,
                prompt: req.body.prompt,
                max_tokens: 7,
                temperature: 0,
            })

            res.status(200).json({
                id: response.id,
                object: response.object,
                created: response.created,
                model: response.model,
                choices: response.choices,
                usage: response.usage,
            });
        }

    } catch (error) {
        console.error('OpenAI Error.', error);
        res.status(500).json({ message: '502: Bad Gateway', code: 0, error_message: "OPENAI_SERVICE_OFF" });
    }
}