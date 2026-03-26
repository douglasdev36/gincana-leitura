# Sistema de Gincana de Leitura - Front-end

Este projeto é um sistema front-end moderno desenvolvido em **React** com **TypeScript** e **Tailwind CSS**, criado para gerenciar uma gincana de leitura em uma biblioteca escolar. O gerenciamento de estado é feito através do **Zustand**.

## 🚀 Tecnologias Utilizadas
- **React (Vite)**
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (Gerenciamento de Estado)
- **Lucide React** (Ícones)

## 📂 Estrutura de Pastas

```
src/
 ├── components/       # Componentes reutilizáveis (Layout, Inputs, Listas)
 ├── hooks/            # Hooks customizados (useDebounce, useStore do Zustand)
 ├── pages/            # Páginas da aplicação (Home)
 ├── services/         # Simulação de chamadas a APIs e mock de dados
 ├── types/            # Definições de interfaces do TypeScript
 ├── App.tsx           # Componente raiz
 └── main.tsx          # Ponto de entrada da aplicação
```

## ⚙️ Como executar o projeto

1. Certifique-se de ter o Node.js instalado.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🔌 Como conectar com um Backend Real no Futuro

Atualmente, o sistema utiliza o arquivo `src/services/api.ts` e `src/services/mockData.ts` para simular requisições ao banco de dados usando `setTimeout`.

Para conectar a uma API real (ex: Node.js com Express, Supabase, Firebase, etc.):

1. **Atualize o arquivo `api.ts`**:
   Substitua as funções simuladas por requisições HTTP reais usando `fetch` ou `axios`.

   *Exemplo de como ficaria a busca de alunos:*
   ```typescript
   // Antes (Simulado):
   searchStudents: async (query: string) => { ... }

   // Depois (Real):
   searchStudents: async (query: string): Promise<Student[]> => {
     const response = await fetch(`https://sua-api.com/alunos?nome=${query}`);
     const data = await response.json();
     return data;
   }
   ```

2. **Atualize o Registro de Leitura**:
   Quando um aluno registrar um livro, a pontuação deve ser salva no banco de dados para não ser perdida quando a página for recarregada.
   Você deverá criar um endpoint do tipo `POST /leitura` e chamá-lo dentro do `handleRegister` no componente `BookSearch`.

3. **Carregamento Inicial**:
   O estado global (Zustand) precisará de uma ação `fetchParticipants()` para buscar os participantes e suas pontuações diretamente do backend assim que a página carregar (usando `useEffect` no componente principal).
