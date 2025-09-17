"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const prisma_1 = require("../generated/prisma");
const users_1 = __importDefault(require("./users"));
const polls_1 = __importDefault(require("./polls"));
const votes_1 = __importDefault(require("./votes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
    },
});
exports.prisma = new prisma_1.PrismaClient();
// Attach io to app locals for route handlers to emit updates
app.locals.io = io;
app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
app.use('/api/users', users_1.default);
app.use('/api/polls', polls_1.default);
app.use('/api/votes', votes_1.default);
io.on('connection', (socket) => {
    socket.on('join_poll', (pollId) => {
        socket.join(`poll:${pollId}`);
    });
    socket.on('leave_poll', (pollId) => {
        socket.leave(`poll:${pollId}`);
    });
});
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${PORT}`);
});
