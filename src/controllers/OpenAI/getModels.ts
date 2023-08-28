import axios from "axios";
import { Request, Response } from "express";
import { ApiKey } from "../../models/APIKey";
import OpenAI from 'openai';
// import { User } from "../../models/User";
// import { ChatGPTClient } from '@waylaidwanderer/chatgpt-api';
// import keyv from "keyv";

export async function getModels(req: Request, res: Response) {

    try {
        // const keyvStore = new keyv(process.env.CHAT_MONGO_LOGS as string);

        if(!req.headers.authorization) {
            return res.status(401).json({ error: 'No authorization header provided' });
        }

        if(req.headers.authorization.split(' ')[0] !== 'Bearer') {
            return res.status(401).json({ error: 'Invalid authorization header' });
        }

        const providedApiKey = req.headers.authorization.split(' ')[1];

        const foundKey = await ApiKey.findOne({ apiKey: providedApiKey });

        if(!foundKey) {
            return res.status(401).json({ error: 'Invalid API key' });
        } else {

            const response = await axios.get('https://api.daku.tech/v1/models', {
                headers: {
                    'Authorization': `Bearer sk-xxxx`,
                    'Content-Type': 'application/json'
                }
            });

            res.status(200).json(response.data.data);
        }

    } catch (error) {
        console.error('OpenAI Error.', error);
        res.status(500).json({ message: '502: Bad Gateway', code: 0, error_message: "MODELS_FETCH_FAIL" });
    }
}