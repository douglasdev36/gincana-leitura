export interface Student {
  id: string;
  name: string;
}

export interface ReadingHistory {
  id: string;
  bookId: string;
  bookTitle: string;
  pages: number;
  date: string; // Formato ISO
}

export interface Participant extends Student {
  score: number;
  history: ReadingHistory[];
}

export interface Book {
  id: string; // tombo de 6 dígitos
  title: string;
  pages: number;
}

export interface Admin {
  id: number;
  username: string;
  name: string;
  isFirstLogin: boolean;
}
