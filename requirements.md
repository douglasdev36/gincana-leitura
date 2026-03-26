# Gincana de Leitura - Sistema Front-end

## Tecnologias
- React com TypeScript (usando Vite)
- Tailwind CSS
- Gerenciamento de estado: Zustand ou Context API
- Lucide React (para ícones, opcional)

## Funcionalidades Principais

1. **Cadastro e busca de alunos**:
   - Campo de input para digitar o nome do aluno.
   - Autocomplete: enquanto o usuário digita, deve aparecer uma lista de sugestões (usar debounce no campo de busca).
   - Dados de alunos simulados (array/JSON).
   - Ao selecionar um aluno, opção para marcar se ele participa da gincana.

2. **Lista de participantes**:
   - Apenas alunos marcados como participantes devem aparecer nessa lista.
   - Essa lista será menor e usada para controle da pontuação.

3. **Registro de empréstimo de livro**:
   - Campo para digitar o número de tombo (exatamente 6 dígitos).
   - Ao digitar o tombo, o sistema deve buscar automaticamente:
     - Nome do livro
     - Número de páginas
   - Dados de livros simulados em um banco local.

4. **Sistema de pontuação**:
   - A pontuação do aluno é baseada no número de páginas do livro lido.
   - Exemplo: livro com 600 páginas = 600 pontos.
   - Os pontos devem ser acumulativos por aluno participante.

5. **Interface**:
   - Layout simples, limpo e responsivo.
   - Separar bem as áreas:
     - Seleção de aluno
     - Participação na gincana
     - Registro de leitura (tombo)
     - Ranking/pontuação

6. **Ranking**:
   - Mostrar lista de participantes ordenada por pontuação (do maior para o menor).
   - Exibir nome e total de pontos.

7. **Estrutura do projeto (Obrigatório)**:
   - `src/components`
   - `src/pages`
   - `src/services` (simulação de banco de dados e APIs)
   - `src/types` (interfaces do TypeScript)
   - `src/hooks`

8. **Componentes sugeridos**:
   - `InputAutocomplete` (busca de alunos)
   - `BookSearch` (busca por tombo)
   - `ParticipantList`
   - `ScoreBoard`
   - `Layout`

9. **Extras importantes**:
   - Código limpo e comentado.
   - Simular banco de dados com arrays locais (alunos e livros).
   - Adicionar um README.md explicando a estrutura e como depois conectar com um backend real.
