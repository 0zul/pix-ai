import cron from 'node-cron';
import { Conversations } from '../models/Conversations';

cron.schedule('0 0 * * *', async () => {
    console.log(`Running a job at 00:00 at Asia/Kolkata timezone`);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    await Conversations.deleteMany({ lastActivity: { $lt: twoDaysAgo } });
});