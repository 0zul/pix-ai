import mongoose, { Schema, Document } from 'mongoose';

interface IConversationsOpenAIDataUsage extends Document {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

interface IConversationsOpenAIData extends Document {
    id: string;
    object: string;
    created: number;
    model: string;
    usage: IConversationsOpenAIDataUsage;
}

interface IConversations extends Document {
  id: string;
  discordID: string;
  messages: Array<string>;
  lastActivity: Date;
  openai_data: IConversationsOpenAIData;
}

const conversationsSchema = new Schema({
  id: { type: String, required: true, unique: true },
  discordID: { type: String, required: true, unique: true},
  messages: { type: Array, required: true },
  lastActivity: { type: Date, required: true },
  openai_data: { 
    id: { type: String },
    object: { type: String },
    created: { type: Number },
    model: { type: String },
    usage: { 
        prompt_tokens: { type: Number },
        completion_tokens: { type: Number },
        total_tokens: { type: Number },
    },
   },
});

export const Conversations = mongoose.model<IConversations>('Conversations', conversationsSchema);
