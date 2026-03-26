import { create } from 'zustand';
import { Participant, Student, Book } from '../types';
import { api } from '../services/api';

interface GincanaState {
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
  loadParticipants: () => Promise<void>;
  addParticipant: (student: Student) => Promise<void>;
  removeParticipant: (studentId: string) => Promise<void>;
  addScore: (studentId: string, book: Book) => Promise<void>;
}

export const useStore = create<GincanaState>((set, get) => ({
  participants: [],
  
  setParticipants: (participants) => set({ participants }),

  loadParticipants: async () => {
    const data = await api.getParticipants();
    set({ participants: data });
  },

  addParticipant: async (student: Student) => {
    // Verifica se já está participando localmente
    if (get().participants.some(p => p.id === student.id)) {
      return;
    }
    
    // Atualiza no backend
    await api.addParticipant(student.id);
    
    // Atualiza estado local
    set((state) => ({
      participants: [...state.participants, { ...student, score: 0, history: [] }]
    }));
  },

  removeParticipant: async (studentId: string) => {
    // Atualiza no backend
    await api.removeParticipant(studentId);
    
    // Atualiza estado local
    set((state) => ({
      participants: state.participants.filter(p => p.id !== studentId)
    }));
  },

  addScore: async (studentId: string, book: Book) => {
    // Registra leitura no backend
    await api.registerReading(studentId, book.id);
    
    // Atualiza estado local para refletir imediatamente
    set((state) => ({
      participants: state.participants.map(p => 
        p.id === studentId 
          ? { 
              ...p, 
              score: p.score + book.pages,
              history: [
                {
                  id: crypto.randomUUID(), // Temporário local, o ideal seria recarregar da API
                  bookId: book.id,
                  bookTitle: book.title,
                  pages: book.pages,
                  date: new Date().toISOString()
                },
                ...p.history
              ]
            }
          : p
      )
    }));
  },
}));
