import { Router } from 'express';
import { z } from 'zod';
import { prisma } from './server';

const router = Router();

const createPollSchema = z.object({
  question: z.string().min(1),
  isPublished: z.boolean().optional().default(false),
  creatorId: z.string().cuid(),
  options: z.array(z.string().min(1)).min(2),
});

router.post('/', async (req, res) => {
  const parsed = createPollSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { question, isPublished, creatorId, options } = parsed.data;
  const poll = await prisma.poll.create({
    data: {
      question,
      isPublished: Boolean(isPublished),
      creatorId,
      options: { create: options.map((text) => ({ text })) },
    },
    include: { options: true },
  });
  res.status(201).json(poll);
});

router.get('/', async (_req, res) => {
  const polls = await prisma.poll.findMany({ include: { options: true } });
  res.json(polls);
});

router.get('/:id', async (req, res) => {
  const poll = await prisma.poll.findUnique({ where: { id: req.params.id }, include: { options: true } });
  if (!poll) return res.status(404).json({ error: 'Poll not found' });
  res.json(poll);
});

export default router;


