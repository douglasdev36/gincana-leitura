import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Configuração segura de CORS (Aceita qualquer origem)
app.use(cors({
  origin: '*', // Permite qualquer site (incluindo Vercel, localhost, etc)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

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

// ==========================================
// ROTA SECRETA DE EMERGÊNCIA (Resetar Admin)
// ==========================================
app.get('/api/reset-admin-secreto', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('123', 10);
    
    // Tenta atualizar. Se não existir, cria.
    const admin = await prisma.admin.upsert({
      where: { username: 'admin' },
      update: {
        password: hashedPassword,
        isFirstLogin: true
      },
      create: {
        username: 'admin',
        password: hashedPassword,
        name: 'Administrador da Biblioteca',
        isFirstLogin: true
      }
    });

    res.status(200).json({ 
      message: '✅ Senha resetada com sucesso para "123". Você já pode fazer login!',
      admin: admin.username
    });
  } catch (error: any) {
    console.error('Erro no reset:', error);
    res.status(500).json({ error: 'Erro ao resetar admin', details: error.message });
  }
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

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      token,
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        isFirstLogin: admin.isFirstLogin
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor durante o login' });
  }
});

// Middleware de Autenticação
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
};

// Alterar Credenciais (Primeiro Login ou normal)
app.put('/api/admin/update', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { username, password, name } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
  } catch (error) {
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

    const hashedPassword = await bcrypt.hash(password, 10);

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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar leitura' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
