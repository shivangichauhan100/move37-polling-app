import { Router } from 'express';
import { z } from 'zod';
import { prisma } from './server';

const router = Router();

const voteSchema = z.object({
  userId: z.string().cuid(),
  pollOptionId: z.string().cuid(),
});

async function broadcastPollUpdate(pollId: string, io: any) {
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      options: {
        include: {
          _count: { select: { votes: true } },
        },
      },
    },
  });
  if (!poll) return;
  const payload = {
    pollId: poll.id,
    options: poll.options.map((opt) => ({ id: opt.id, text: opt.text, votes: (opt as any)._count.votes })),
  };
  io.to(`poll:${pollId}`).emit('poll_updated', payload);
}

router.post('/', async (req, res) => {
  const parsed = voteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { userId, pollOptionId } = parsed.data;

  const option = await prisma.pollOption.findUnique({ where: { id: pollOptionId } });
  if (!option) return res.status(404).json({ error: 'Poll option not found' });

  try {
    const vote = await prisma.vote.create({ data: { userId, pollOptionId } });
    res.status(201).json(vote);
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'User already voted for this option' });
    throw e;
  }

  const io = req.app.locals.io;
  await broadcastPollUpdate(option.pollId, io);
});

export default router;


