"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const server_1 = require("./server");
const router = (0, express_1.Router)();
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
router.post('/', async (req, res) => {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { name, email, password } = parsed.data;
    const existing = await server_1.prisma.user.findUnique({ where: { email } });
    if (existing)
        return res.status(409).json({ error: 'Email already in use' });
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const user = await server_1.prisma.user.create({ data: { name, email, passwordHash } });
    return res.status(201).json({ id: user.id, name: user.name, email: user.email });
});
router.get('/', async (_req, res) => {
    const users = await server_1.prisma.user.findMany({ select: { id: true, name: true, email: true } });
    res.json(users);
});
exports.default = router;
