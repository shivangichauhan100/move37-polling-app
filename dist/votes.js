"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const server_1 = require("./server");
const router = (0, express_1.Router)();
const voteSchema = zod_1.z.object({
    userId: zod_1.z.string().cuid(),
    pollOptionId: zod_1.z.string().cuid(),
});
async function broadcastPollUpdate(pollId, io) {
    const poll = await server_1.prisma.poll.findUnique({
        where: { id: pollId },
        include: {
            options: {
                include: {
                    _count: { select: { votes: true } },
                },
            },
        },
    });
    if (!poll)
        return;
    const payload = {
        pollId: poll.id,
        options: poll.options.map((opt) => ({ id: opt.id, text: opt.text, votes: opt._count.votes })),
    };
    io.to(`poll:${pollId}`).emit('poll_updated', payload);
}
router.post('/', async (req, res) => {
    const parsed = voteSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { userId, pollOptionId } = parsed.data;
    const option = await server_1.prisma.pollOption.findUnique({ where: { id: pollOptionId } });
    if (!option)
        return res.status(404).json({ error: 'Poll option not found' });
    try {
        const vote = await server_1.prisma.vote.create({ data: { userId, pollOptionId } });
        res.status(201).json(vote);
    }
    catch (e) {
        if (e.code === 'P2002')
            return res.status(409).json({ error: 'User already voted for this option' });
        throw e;
    }
    const io = req.app.locals.io;
    await broadcastPollUpdate(option.pollId, io);
});
exports.default = router;
