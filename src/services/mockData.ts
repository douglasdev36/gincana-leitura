import { Student, Book } from '../types';

// Simulando um banco de dados de alunos
export const studentsMock: Student[] = [
  { id: '1', name: 'Ana Beatriz Souza' },
  { id: '2', name: 'Ana Carolina Lima' },
  { id: '3', name: 'Bruno Henrique Alves' },
  { id: '4', name: 'Carlos Eduardo Santos' },
  { id: '5', name: 'Daniela Ferreira' },
  { id: '6', name: 'Eduardo Gomes' },
  { id: '7', name: 'Fernanda Rocha' },
  { id: '8', name: 'Gabriel Martins' },
  { id: '9', name: 'Hugo Silva' },
  { id: '10', name: 'Isabela Costa' },
  { id: '11', name: 'João Paulo Mendes' },
  { id: '12', name: 'Paulo Roberto' },
  { id: '13', name: 'Paulo Henrique' },
  { id: '14', name: 'Paula Fernandez' },
];

// Simulando um banco de dados de livros (tombo de 6 dígitos)
export const booksMock: Book[] = [
  { id: '123456', title: 'Dom Casmurro', pages: 256 },
  { id: '111222', title: 'O Pequeno Príncipe', pages: 96 },
  { id: '333444', title: 'Harry Potter e a Pedra Filosofal', pages: 309 },
  { id: '555666', title: 'Senhor dos Anéis: A Sociedade do Anel', pages: 423 },
  { id: '777888', title: '1984', pages: 328 },
  { id: '999000', title: 'A Revolução dos Bichos', pages: 112 },
  { id: '121212', title: 'O Hobbit', pages: 310 },
  { id: '343434', title: 'A Menina que Roubava Livros', pages: 480 },
  { id: '000000', title: 'Livro Sem Páginas (Teste)', pages: 0 }, // Para testar livro sem páginas
];
