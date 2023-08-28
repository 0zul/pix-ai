import mongoose, { Schema, Document } from 'mongoose';

interface IApiKey extends Document {
  apiKey: string;
}

const apiKeySchema = new Schema({
  apiKey: { type: String, required: true, unique: true },
  discordID: { type: String, required: true, unique: true}
});

export const ApiKey = mongoose.model<IApiKey>('ApiKey', apiKeySchema);
