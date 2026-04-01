import { Student, Book, Participant } from '../types';

// Usa a variável de ambiente se existir, caso contrário, usa localhost como fallback seguro
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('@gincana:token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth - Login
  login: async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro no login');
      }
      
      return data; // { token, user }
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Auth - Update Credentials (First Login)
  updateAdminCredentials: async (username: string, password: string, name: string) => {
    try {
      const token = localStorage.getItem('@gincana:token');
      const response = await fetch(`${API_URL}/admin/update`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, password, name }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao atualizar credenciais');
      return data; // updated user
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Auth - Create New Admin
  createAdmin: async (username: string, password: string, name: string) => {
    try {
      const token = localStorage.getItem('@gincana:token');
      const response = await fetch(`${API_URL}/admin`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, password, name }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao criar admin');
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Busca alunos pelo nome (autocomplete)
  searchStudents: async (query: string): Promise<Student[]> => {
    if (!query) return [];
    try {
      const response = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Erro na busca');
      const data = await response.json();
      return data.map((u: any) => ({
        id: String(u.id),
        name: u.name,
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // Cadastra um novo aluno manualmente
  createUser: async (userData: { name: string; matricula?: string; email?: string; telefone?: string; endereco?: string }) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Erro ao criar usuário');
      const data = await response.json();
      return {
        id: String(data.id),
        name: data.name
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Busca lista de participantes da gincana
  getParticipants: async (): Promise<Participant[]> => {
    try {
      const response = await fetch(`${API_URL}/participants`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Erro ao buscar participantes');
      const data = await response.json();
      
      // Formata os dados para o padrão do frontend
      return data.map((u: any) => ({
        id: String(u.id),
        name: u.name,
        score: u.score,
        history: u.ReadingHistory.map((h: any) => ({
          id: String(h.id),
          bookId: h.bookTombo,
          bookTitle: h.bookCopy.book.title,
          pages: h.bookCopy.book.pages,
          date: h.date,
        }))
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // Adiciona um participante
  addParticipant: async (studentId: string): Promise<void> => {
    try {
      await fetch(`${API_URL}/participants/${studentId}`, { 
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Erro ao adicionar participante:', error);
      throw error;
    }
  },

  // Remove um participante
  removeParticipant: async (studentId: string): Promise<void> => {
    try {
      await fetch(`${API_URL}/participants/${studentId}`, { 
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Erro ao remover participante:', error);
      throw error;
    }
  },

  // Busca um livro pelo tombo (id)
  getBookByTombo: async (tombo: string): Promise<Book | null> => {
    try {
      const response = await fetch(`${API_URL}/books/${tombo}`, {
        headers: getAuthHeaders(),
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Erro ao buscar livro');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  // Adiciona um novo livro
  addBook: async (book: Book): Promise<Book> => {
    try {
      const response = await fetch(`${API_URL}/books`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: book.id,
          title: book.title,
          pages: book.pages,
        }),
      });
      if (!response.ok) throw new Error('Erro ao adicionar livro');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Atualiza as páginas de um livro existente
  updateBookPages: async (tombo: string, pages: number): Promise<Book | null> => {
    try {
      const response = await fetch(`${API_URL}/books/${tombo}/pages`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ pages }),
      });
      if (!response.ok) throw new Error('Erro ao atualizar páginas');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  // Registra uma leitura
  registerReading: async (userId: string, tombo: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/readings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, tombo }),
      });
      if (!response.ok) throw new Error('Erro ao registrar leitura');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
