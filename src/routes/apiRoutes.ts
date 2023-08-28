import {Router} from 'express';
import { generateApiKey } from '../controllers/generateKey';
import { chatCompletion } from '../controllers/OpenAI/chatCompletion';
import { deleteApiKey } from '../controllers/deleteKey';
import { chatCompletionConversation } from '../controllers/OpenAI/chatCompletionConversation';
import { getModels } from '../controllers/OpenAI/getModels';
import { getModelById } from '../controllers/OpenAI/getModelById';
import { imageGeneration } from '../controllers/OpenAI/imageGeneration';

const router = Router();

// Generate API key route
router.post('/getkey', generateApiKey);
router.delete('/deletekey', deleteApiKey);

// OpenAI Model Routes
router.get('/models', getModels)
router.get('/models/:id', getModelById)

// OpenAI Chat Routes
router.post('/chat/completions', chatCompletion)
router.post('/chat/conversation', chatCompletionConversation)

// OpenAI Image Routes
router.post('/images/generations', imageGeneration)

export default router;
