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
// Configuração segura de CORS (Aceita qualquer origem)
app.use((0, cors_1.default)({
    origin: '*', // Permite qualquer site (incluindo Vercel, localhost, etc)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express_1.default.json());
// ==========================================
// PING / HEALTH CHECK (Evitar sleep no Render)
// ==========================================
app.get('/api/ping', (req, res) => {
    res.status(200).json({ status: 'alive', message: 'Servidor acordado!', time: new Date().toISOString() });
});
// Auto-Ping: O próprio servidor se chama a cada 10 minutos (600000 ms) para não dormir
const SELF_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
setInterval(() => {
    fetch(`${SELF_URL}/api/ping`)
        .then(res => res.json())
        .then(data => console.log(`[Auto-Ping] Servidor mantido acordado: ${data.time}`))
        .catch(err => console.error('[Auto-Ping] Erro ao tentar acordar o servidor:', err.message));
}, 10 * 60 * 1000);
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const path = require('path');
const xlsx = require('xlsx');
const SEED_ENDPOINT_VERSION = '2026-03-27-04';
let seedJobStatus = 'idle';
let seedJobStartedAt = null;
let seedJobFinishedAt = null;
let seedJobResult = null;
let seedJobError = null;
let seedJobPromise = null;
const chunk = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size)
        out.push(arr.slice(i, i + size));
    return out;
};
const normalizeKey = (key) => String(key)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
const getCell = (row, candidates) => {
    if (!row || typeof row !== 'object')
        return undefined;
    for (const candidate of candidates) {
        const directValue = row[candidate];
        if (directValue !== undefined && directValue !== null && String(directValue).trim() !== '') {
            return directValue;
        }
        const target = normalizeKey(candidate);
        const foundKey = Object.keys(row).find((k) => normalizeKey(k) === target);
        if (foundKey) {
            const foundValue = row[foundKey];
            if (foundValue !== undefined && foundValue !== null && String(foundValue).trim() !== '') {
                return foundValue;
            }
        }
    }
    return undefined;
};
const parsePages = (value) => {
    if (value === undefined || value === null)
        return 0;
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.max(0, Math.trunc(value));
    }
    const raw = String(value).trim();
    if (!raw)
        return 0;
    if (/^\d+$/.test(raw))
        return parseInt(raw, 10);
    const normalized = raw
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    const withLabel = normalized.match(/(\d{1,5})\s*(p\.?|pag\.?|pagina|paginas)\b/);
    if (withLabel?.[1])
        return parseInt(withLabel[1], 10);
    const anyNumber = normalized.match(/(\d{1,5})/);
    if (anyNumber?.[1])
        return parseInt(anyNumber[1], 10);
    return 0;
};
const runEmergencySeed = async () => {
    const usersWorkbook = xlsx.readFile(path.resolve(__dirname, '..', 'usuarios_quissama.xlsx'));
    const usersSheet = usersWorkbook.Sheets[usersWorkbook.SheetNames[0]];
    const usersData = xlsx.utils.sheet_to_json(usersSheet, { defval: null });
    const usersByMatricula = new Map();
    let usersSkipped = 0;
    for (const row of usersData) {
        const fullNameRaw = getCell(row, ['Nome completo', 'Nome Completo']);
        const matriculaRaw = getCell(row, ['Matrícula', 'Matricula']);
        if (!fullNameRaw || !matriculaRaw) {
            usersSkipped++;
            continue;
        }
        const fullName = String(fullNameRaw).trim();
        const matriculaStr = String(matriculaRaw).trim();
        if (!fullName || !matriculaStr) {
            usersSkipped++;
            continue;
        }
        const emailRaw = getCell(row, ['E-mail', 'Email']);
        const telefoneRaw = getCell(row, ['Telefone']);
        const enderecoRaw = getCell(row, ['Endereço', 'Endereco']);
        usersByMatricula.set(matriculaStr, {
            name: fullName,
            matricula: matriculaStr,
            email: emailRaw ? String(emailRaw).trim() : null,
            telefone: telefoneRaw ? String(telefoneRaw).trim() : null,
            endereco: enderecoRaw ? String(enderecoRaw).trim() : null,
        });
    }
    const matriculas = Array.from(usersByMatricula.keys());
    const existingMatriculas = new Set();
    for (const part of chunk(matriculas, 1000)) {
        const existing = await prisma.user.findMany({
            where: { matricula: { in: part } },
            select: { matricula: true },
        });
        for (const u of existing) {
            if (u.matricula)
                existingMatriculas.add(u.matricula);
        }
    }
    const usersToCreate = matriculas
        .filter((m) => !existingMatriculas.has(m))
        .map((m) => usersByMatricula.get(m))
        .map((u) => ({
        name: u.name,
        matricula: u.matricula,
        email: u.email,
        telefone: u.telefone,
        endereco: u.endereco,
    }));
    let usersCount = 0;
    if (usersToCreate.length > 0) {
        const created = await prisma.user.createMany({ data: usersToCreate });
        usersCount = created.count;
    }
    const booksWorkbook = xlsx.readFile(path.resolve(__dirname, '..', 'informação_livro.xlsx'));
    const booksSheet = booksWorkbook.Sheets[booksWorkbook.SheetNames[0]];
    const booksData = xlsx.utils.sheet_to_json(booksSheet, { defval: null });
    const booksByTitle = new Map();
    let booksSkipped = 0;
    for (const row of booksData) {
        const titleRaw = getCell(row, ['Título', 'Titulo', 'titulo']);
        const rawPages = getCell(row, ['Descrição Física', 'Descricao Fisica', 'descrição fisica']);
        const rawTombos = getCell(row, ['Número de tombo', 'Numero de tombo', 'numero de tombo']);
        if (!titleRaw || !rawTombos) {
            booksSkipped++;
            continue;
        }
        const title = String(titleRaw).trim();
        if (!title) {
            booksSkipped++;
            continue;
        }
        const pages = parsePages(rawPages);
        const tomboArray = String(rawTombos)
            .split(/[,\n;]+/)
            .map((t) => t.trim())
            .filter(Boolean);
        if (tomboArray.length === 0) {
            booksSkipped++;
            continue;
        }
        const existing = booksByTitle.get(title);
        if (!existing) {
            booksByTitle.set(title, { pages, tombos: new Set(tomboArray) });
        }
        else {
            existing.pages = Math.max(existing.pages, pages);
            for (const t of tomboArray)
                existing.tombos.add(t);
        }
    }
    const titles = Array.from(booksByTitle.keys());
    const booksInDb = new Map();
    for (const part of chunk(titles, 500)) {
        const found = await prisma.book.findMany({
            where: { title: { in: part } },
            select: { id: true, title: true, pages: true },
        });
        for (const b of found) {
            if (!booksInDb.has(b.title))
                booksInDb.set(b.title, { id: b.id, pages: b.pages });
        }
    }
    for (const title of titles) {
        const desiredPages = booksByTitle.get(title).pages;
        const existing = booksInDb.get(title);
        if (!existing) {
            const created = await prisma.book.create({ data: { title, pages: desiredPages } });
            booksInDb.set(title, { id: created.id, pages: created.pages });
        }
        else if (desiredPages > 0 && existing.pages === 0) {
            const updated = await prisma.book.update({ where: { id: existing.id }, data: { pages: desiredPages } });
            booksInDb.set(title, { id: updated.id, pages: updated.pages });
        }
    }
    const allTombos = [];
    for (const { tombos } of booksByTitle.values()) {
        for (const t of tombos)
            allTombos.push(t);
    }
    const existingTombos = new Set();
    for (const part of chunk(allTombos, 1000)) {
        const found = await prisma.bookCopy.findMany({
            where: { tombo: { in: part } },
            select: { tombo: true },
        });
        for (const c of found)
            existingTombos.add(c.tombo);
    }
    const bookCopyByTombo = new Map();
    for (const [title, info] of booksByTitle.entries()) {
        const bookId = booksInDb.get(title).id;
        for (const t of info.tombos) {
            if (existingTombos.has(t))
                continue;
            if (bookCopyByTombo.has(t))
                continue;
            bookCopyByTombo.set(t, bookId);
        }
    }
    let booksCount = 0;
    const bookCopiesToCreate = Array.from(bookCopyByTombo.entries()).map(([tombo, bookId]) => ({ tombo, bookId }));
    for (const part of chunk(bookCopiesToCreate, 1000)) {
        const created = await prisma.bookCopy.createMany({ data: part, skipDuplicates: true });
        booksCount += created.count;
    }
    return {
        versao: SEED_ENDPOINT_VERSION,
        message: '✅ DADOS INJETADOS COM SUCESSO! Admins não foram alterados.',
        usuarios_injetados: usersCount,
        livros_injetados: booksCount,
        usuarios_lidos: usersData.length,
        livros_lidos: booksData.length,
        usuarios_pulados: usersSkipped,
        livros_pulados: booksSkipped,
    };
};
// ==========================================
// ROTA SECRETA DE EMERGÊNCIA (Apenas Injetar Dados)
// ==========================================
app.get('/api/reset-admin-secreto', async (req, res) => {
    try {
        const wait = String(req.query.wait ?? '').toLowerCase();
        const shouldWait = wait === '1' || wait === 'true';
        if (seedJobStatus === 'running' && seedJobPromise) {
            if (!shouldWait) {
                return res.status(202).json({
                    versao: SEED_ENDPOINT_VERSION,
                    status: seedJobStatus,
                    startedAt: seedJobStartedAt,
                    finishedAt: seedJobFinishedAt,
                    statusUrl: '/api/reset-admin-status',
                });
            }
            const result = await seedJobPromise;
            return res.status(200).json(result);
        }
        seedJobStatus = 'running';
        seedJobStartedAt = new Date().toISOString();
        seedJobFinishedAt = null;
        seedJobResult = null;
        seedJobError = null;
        seedJobPromise = runEmergencySeed()
            .then((result) => {
            seedJobStatus = 'done';
            seedJobFinishedAt = new Date().toISOString();
            seedJobResult = result;
            return result;
        })
            .catch((err) => {
            seedJobStatus = 'error';
            seedJobFinishedAt = new Date().toISOString();
            seedJobError = err?.message ? String(err.message) : String(err);
            throw err;
        });
        if (!shouldWait) {
            return res.status(202).json({
                versao: SEED_ENDPOINT_VERSION,
                status: seedJobStatus,
                startedAt: seedJobStartedAt,
                finishedAt: seedJobFinishedAt,
                statusUrl: '/api/reset-admin-status',
            });
        }
        const result = await seedJobPromise;
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('Erro no reset/seed:', error);
        res.status(500).json({ error: 'Erro ao executar rotina de emergência', details: error.message });
    }
});
app.get('/api/reset-admin-status', (req, res) => {
    res.status(200).json({
        versao: SEED_ENDPOINT_VERSION,
        status: seedJobStatus,
        startedAt: seedJobStartedAt,
        finishedAt: seedJobFinishedAt,
        result: seedJobResult,
        error: seedJobError,
    });
});
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
                name: admin.name,
                isFirstLogin: admin.isFirstLogin
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro no servidor durante o login' });
    }
});
// Middleware de Autenticação
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
// Alterar Credenciais (Primeiro Login ou normal)
app.put('/api/admin/update', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, password, name } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const updatedAdmin = await prisma.admin.update({
            where: { id: userId },
            data: {
                username,
                password: hashedPassword,
                name: name || undefined,
                isFirstLogin: false
            }
        });
        res.json({
            id: updatedAdmin.id,
            username: updatedAdmin.username,
            name: updatedAdmin.name,
            isFirstLogin: updatedAdmin.isFirstLogin
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar credenciais' });
    }
});
// Criar novo Admin
app.post('/api/admin', authenticateToken, async (req, res) => {
    try {
        const { username, password, name } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
        }
        const existingAdmin = await prisma.admin.findUnique({ where: { username } });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Este nome de usuário já está em uso' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newAdmin = await prisma.admin.create({
            data: {
                username,
                password: hashedPassword,
                name: name || undefined,
                isFirstLogin: true
            }
        });
        res.status(201).json({
            id: newAdmin.id,
            username: newAdmin.username,
            name: newAdmin.name
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao criar administrador' });
    }
});
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
