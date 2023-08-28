import { Request, Response } from 'express';
import { ApiKey } from '../models/APIKey';
import * as crypto from "crypto";

export async function generateApiKey(req: Request, res: Response) {
  const providedMasterKey = req.body.masterKey;

  if (providedMasterKey === process.env.MASTER_KEY) {
    try {

      if (!req.body.discordID) {
        return res.status(400).json({ message: 'No Discord ID provided', code: 0 });
      }
      const findDiscordID = await ApiKey.findOne({ discordID: req.body.discordID });

      if (findDiscordID) {
        return res.status(400).json({ message: 'Discord ID already exists', code: 0 });
      } else {
        const apiKey = generateBearerToken(26, 'sk-');
        const newApiKey = new ApiKey({ apiKey, discordID: req.body.discordID });
        await newApiKey.save();
        res.status(201).json({ apiKey, discordID: req.body.discordID, message: `API key generated and linked to ${req.body.discordID}. Please do not share this key with anyone.` });
      }
    } catch (error) {
      console.error('Failed to generate API key:', error);
      res.status(500).json({ message: 'Failed to generate API key', code: 0 });
    }
  } else {
    res.status(401).json({ message: 'Invalid master key', code: 0 });
  }
}

function generateBearerToken(length: number, prefix: string): string {
  const buffer = crypto.randomBytes(length);
  const token = prefix + buffer.toString('hex');
  return token;
}
