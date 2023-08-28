import mongoose, { MongooseOptions } from 'mongoose';

export async function connectDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
    }
}
