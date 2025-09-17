"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const server_1 = require("./server");
const router = (0, express_1.Router)();
const createPollSchema = zod_1.z.object({
    question: zod_1.z.string().min(1),
    isPublished: zod_1.z.boolean().optional().default(false),
    creatorId: zod_1.z.string().cuid(),
    options: zod_1.z.array(zod_1.z.string().min(1)).min(2),
});
router.post('/', async (req, res) => {
    const parsed = createPollSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { question, isPublished, creatorId, options } = parsed.data;
    const poll = await server_1.prisma.poll.create({
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
    const polls = await server_1.prisma.poll.findMany({ include: { options: true } });
    res.json(polls);
});
router.get('/:id', async (req, res) => {
    const poll = await server_1.prisma.poll.findUnique({ where: { id: req.params.id }, include: { options: true } });
    if (!poll)
        return res.status(404).json({ error: 'Poll not found' });
    res.json(poll);
});
exports.default = router;
