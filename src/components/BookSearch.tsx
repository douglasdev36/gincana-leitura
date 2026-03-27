import { useState, useEffect, useRef } from 'react';
import { BookOpen, PlusCircle, Edit3, UserPlus, CheckCircle } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { api } from '../services/api';
import { Book } from '../types';
import { InputAutocomplete } from './InputAutocomplete';
import { NewUserModal } from './NewUserModal';

export function BookSearch() {
  const [tombo, setTombo] = useState('');
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const tomboInputRef = useRef<HTMLInputElement>(null);

  // Estados para cadastro/atualização de livro
  const [isRegisteringBook, setIsRegisteringBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookPages, setNewBookPages] = useState('');
  const [isUpdatingPages, setIsUpdatingPages] = useState(false);

  const participants = useStore(state => state.participants);
  const addScore = useStore(state => state.addScore);
  const addParticipant = useStore(state => state.addParticipant);
  const activeStudent = useStore(state => state.activeStudent);
  const setActiveStudent = useStore(state => state.setActiveStudent);

  useEffect(() => {
    if (!activeStudent) return;
    tomboInputRef.current?.focus();
  }, [activeStudent]);

  useEffect(() => {
    async function fetchBook() {
      if (tombo.length === 6) {
        setIsLoading(true);
        setError('');
        setIsRegisteringBook(false);
        setIsUpdatingPages(false);
        
        const foundBook = await api.getBookByTombo(tombo);
        if (foundBook) {
          setBook(foundBook);
          if (foundBook.pages === 0 || !foundBook.pages) {
            setIsUpdatingPages(true);
            setNewBookPages('');
          }
        } else {
          setBook(null);
          // Em vez de só dar erro, habilitamos o modo de registro
          setIsRegisteringBook(true);
          setNewBookTitle('');
          setNewBookPages('');
        }
        setIsLoading(false);
      } else {
        setBook(null);
        setError('');
        setIsRegisteringBook(false);
        setIsUpdatingPages(false);
      }
    }
    fetchBook();
  }, [tombo]);

  const handleRegisterBook = async () => {
    if (!newBookTitle || !newBookPages) {
      alert("Preencha o título e o número de páginas.");
      return;
    }

    setIsLoading(true);
    const newBook: Book = {
      id: tombo,
      title: newBookTitle,
      pages: parseInt(newBookPages, 10)
    };

    const addedBook = await api.addBook(newBook);
    setBook(addedBook);
    setIsRegisteringBook(false);
    setIsLoading(false);
    alert("Livro cadastrado com sucesso!");
  };

  const handleUpdatePages = async () => {
    if (!newBookPages) {
      alert("Preencha o número de páginas.");
      return;
    }

    setIsLoading(true);
    const updatedBook = await api.updateBookPages(tombo, parseInt(newBookPages, 10));
    if (updatedBook) {
      setBook(updatedBook);
      setIsUpdatingPages(false);
      alert("Páginas atualizadas com sucesso!");
    }
    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (!book || !activeStudent) return;
    
    // Verifica se o aluno já é um participante
    const isAlreadyParticipant = participants.some(p => p.id === activeStudent.id);
    
    try {
      if (!isAlreadyParticipant) {
        // Se não for, pergunta se deseja adicioná-lo à gincana
        const wantsToParticipate = window.confirm(
          `${activeStudent.name} ainda não está na gincana. Deseja adicioná-lo e registrar esta leitura?`
        );
        
        if (!wantsToParticipate) {
          return; // Cancela a operação se o usuário disser "Não"
        }
        
        // Adiciona o aluno à gincana
        await addParticipant(activeStudent);
      }
      
      // Adiciona a pontuação e o histórico
      await addScore(activeStudent.id, book);
      alert(`Empréstimo registrado com sucesso! ${book.pages} pontos adicionados para ${activeStudent.name}.`);
      
      // Reseta o formulário
      setTombo('');
      setBook(null);
      setActiveStudent(null);
    } catch {
      alert("Erro ao registrar leitura. Tente novamente.");
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-emerald-600" />
            Registro de Leitura
          </h3>
          <button
            onClick={() => setIsNewUserModalOpen(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded transition-colors"
            title="Cadastrar Novo Aluno"
          >
            <UserPlus size={16} />
            Novo Aluno
          </button>
        </div>

        <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Número de Tombo (6 dígitos)
        </label>
        <input
          type="text"
          maxLength={6}
          className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          placeholder="Ex: 123456"
          value={tombo}
          onChange={(e) => setTombo(e.target.value.replace(/\D/g, ''))}
          disabled={isRegisteringBook || isUpdatingPages}
          ref={tomboInputRef}
        />
        {isLoading && <p className="text-sm text-slate-500 mt-2">Buscando/Processando...</p>}
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {isRegisteringBook && (
        <div className="mb-6 p-4 bg-orange-50 rounded-md border border-orange-200 animate-in fade-in">
          <p className="text-orange-800 font-medium mb-3 flex items-center gap-2">
            <PlusCircle size={18} />
            Livro não encontrado. Deseja registrar?
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-orange-900 mb-1">Título do Livro</label>
              <input
                type="text"
                className="block w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-orange-900 mb-1">Número de Páginas</label>
              <input
                type="number"
                min="1"
                className="block w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                value={newBookPages}
                onChange={(e) => setNewBookPages(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleRegisterBook}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
              >
                Cadastrar Livro
              </button>
              <button
                onClick={() => {
                  setIsRegisteringBook(false);
                  setTombo('');
                }}
                className="flex-1 bg-white border border-orange-300 hover:bg-orange-100 text-orange-800 py-2 px-4 rounded-md text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isUpdatingPages && book && (
        <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-200 animate-in fade-in">
          <p className="text-blue-800 font-medium mb-1 flex items-center gap-2">
            <Edit3 size={18} />
            {book.title}
          </p>
          <p className="text-sm text-blue-700 mb-3">Este livro não possui o número de páginas cadastrado.</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-blue-900 mb-1">Número de Páginas</label>
              <input
                type="number"
                min="1"
                className="block w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={newBookPages}
                onChange={(e) => setNewBookPages(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleUpdatePages}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
              >
                Salvar Páginas
              </button>
            </div>
          </div>
        </div>
      )}

      {book && !isUpdatingPages && !isRegisteringBook && (
        <div className="mb-6 p-4 bg-emerald-50 rounded-md border border-emerald-100">
          <p className="font-semibold text-emerald-900">{book.title}</p>
          <p className="text-sm text-emerald-700 mt-1">{book.pages} páginas ({book.pages} pontos)</p>
        </div>
      )}

      <div className="mb-4">
        <InputAutocomplete onSelect={(student) => setActiveStudent(student)} presetValue={activeStudent?.name ?? ''} />
        {activeStudent && (
          <p className="text-sm text-emerald-600 mt-2 font-medium">
            Aluno selecionado: {activeStudent.name}
          </p>
        )}
      </div>

      <button
        onClick={handleRegister}
        disabled={!book || !activeStudent}
        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
      >
        <CheckCircle size={18} />
        Registrar e Pontuar
      </button>
    </div>

      <NewUserModal 
        isOpen={isNewUserModalOpen} 
        onClose={() => setIsNewUserModalOpen(false)}
        onUserCreated={(user) => setActiveStudent(user)}
      />
    </>
  );
}
