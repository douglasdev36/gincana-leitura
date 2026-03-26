"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// Configuração segura de CORS (Aceita Várias Portas Locais e o .env)
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Permitir requisições sem origin (como postman) ou que estejam na lista
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(express_1.default.json());
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
// ==========================================
// AUTH (Login)
// ==========================================
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
        }
        const admin = await prisma.admin.findUnique({
            where: { username }
        });
        if (!admin) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        const isValid = await bcryptjs_1.default.compare(password, admin.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        const token = jsonwebtoken_1.default.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '12h' });
        res.json({
            token,
            user: {
                id: admin.id,
                username: admin.username,
                name: admin.name
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro no servidor durante o login' });
    }
});
// Middleware de Autenticação (Opcional para proteger rotas no backend futuramente)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token)
        return res.sendStatus(401);
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403);
        req.user = user;
        next();
    });
};
// ==========================================
// USERS & PARTICIPANTS
// ==========================================
// Buscar usuários pelo nome (Autocomplete)
app.get('/api/users/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            return res.json([]);
        }
        const users = await prisma.user.findMany({
            where: {
                name: {
                    contains: q,
                    mode: 'insensitive',
                },
            },
            take: 10,
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});
// Cadastrar um novo usuário manualmente
app.post('/api/users', async (req, res) => {
    try {
        const { name, matricula, email, telefone, endereco } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'O nome é obrigatório' });
        }
        const newUser = await prisma.user.create({
            data: {
                name,
                matricula: matricula || null,
                email: email || null,
                telefone: telefone || null,
                endereco: endereco || null,
            }
        });
        res.status(201).json(newUser);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar novo usuário' });
    }
});
// Listar participantes da gincana
app.get('/api/participants', async (req, res) => {
    try {
        const participants = await prisma.user.findMany({
            where: { isParticipant: true },
            include: {
                ReadingHistory: {
                    include: {
                        bookCopy: {
                            include: { book: true }
                        }
                    }
                }
            },
            orderBy: { score: 'desc' }
        });
        res.json(participants);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao listar participantes' });
    }
});
// Adicionar usuário à gincana
app.post('/api/participants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { isParticipant: true },
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar participante' });
    }
});
// Remover usuário da gincana
app.delete('/api/participants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { isParticipant: false },
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao remover participante' });
    }
});
// ==========================================
// BOOKS
// ==========================================
// Buscar livro pelo tombo
app.get('/api/books/:tombo', async (req, res) => {
    try {
        const { tombo } = req.params;
        const bookCopy = await prisma.bookCopy.findUnique({
            where: { tombo },
            include: { book: true },
        });
        if (!bookCopy) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }
        // Retorna no formato esperado pelo frontend
        res.json({
            id: bookCopy.tombo,
            title: bookCopy.book.title,
            pages: bookCopy.book.pages,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar livro' });
    }
});
// Cadastrar novo livro (e sua cópia/tombo)
app.post('/api/books', async (req, res) => {
    try {
        const { id: tombo, title, pages } = req.body;
        if (!tombo || !title) {
            return res.status(400).json({ error: 'Tombo e título são obrigatórios' });
        }
        // Cria o livro e a cópia (tombo) na mesma transação
        const bookRecord = await prisma.book.create({
            data: {
                title,
                pages: pages || 0,
                BookCopy: {
                    create: { tombo }
                }
            },
        });
        res.status(201).json({
            id: tombo,
            title: bookRecord.title,
            pages: bookRecord.pages,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar livro' });
    }
});
// Atualizar páginas de um livro existente
app.put('/api/books/:tombo/pages', async (req, res) => {
    try {
        const { tombo } = req.params;
        const { pages } = req.body;
        const bookCopy = await prisma.bookCopy.findUnique({
            where: { tombo },
        });
        if (!bookCopy) {
            return res.status(404).json({ error: 'Tombo não encontrado' });
        }
        const updatedBook = await prisma.book.update({
            where: { id: bookCopy.bookId },
            data: { pages },
        });
        res.json({
            id: tombo,
            title: updatedBook.title,
            pages: updatedBook.pages,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar páginas' });
    }
});
// ==========================================
// READINGS (Histórico e Pontuação)
// ==========================================
// Registrar leitura (pontuar)
app.post('/api/readings', async (req, res) => {
    try {
        const { userId, tombo } = req.body;
        if (!userId || !tombo) {
            return res.status(400).json({ error: 'ID do usuário e tombo são obrigatórios' });
        }
        // Busca o livro para saber quantas páginas tem
        const bookCopy = await prisma.bookCopy.findUnique({
            where: { tombo },
            include: { book: true }
        });
        if (!bookCopy) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }
        // Usa transação para adicionar histórico e somar pontos ao usuário
        const transaction = await prisma.$transaction([
            prisma.readingHistory.create({
                data: {
                    userId: Number(userId),
                    bookTombo: tombo,
                }
            }),
            prisma.user.update({
                where: { id: Number(userId) },
                data: { score: { increment: bookCopy.book.pages } }
            })
        ]);
        res.json(transaction[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao registrar leitura' });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
