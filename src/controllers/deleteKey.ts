import { Request, Response } from 'express';
import { ApiKey } from '../models/APIKey';

export async function deleteApiKey(req: Request, res: Response) {
  const providedMasterKey = req.body.masterKey;

  if (providedMasterKey === process.env.MASTER_KEY) {
    try {

      if (!req.body.discordID) {
        return res.status(400).json({ message: 'No Discord ID provided', code: 0 });
      }
      const findDiscordID = await ApiKey.findOne({ discordID: req.body.discordID });

      if (findDiscordID) {
        await ApiKey.deleteOne({ discordID: req.body.discordID });
        return res.status(200).json({ message: `Account Deleted.` });
      } else {
        return res.status(400).json({ message: 'Discord ID does not exist', code: 0 });
      }
    } catch (error) {
      console.error('Failed to delete API key:', error);
      res.status(500).json({ message: 'Failed to delete API key', code: 0 });
    }
  } else {
    res.status(401).json({ message: 'Invalid master key', code: 0 });
  }
}