# Guia Completo de Deploy - Gincana de Leitura

Este guia ensina como colocar o seu projeto no ar, dividindo-o em 3 partes:
1. Salvar no GitHub
2. Colocar o Banco de Dados e a API no Render (Backend)
3. Colocar o Site na Vercel (Frontend)

---

## Passo 1: Salvar o Código no GitHub

O GitHub é onde o código vai ficar salvo para que os servidores possam ler e colocar no ar.

1. Crie uma conta no [GitHub](https://github.com/).
2. Clique no botão **"New"** para criar um novo repositório.
3. Dê o nome de `gincana-leitura` (deixe como Private se preferir). Não marque a opção de adicionar README.
4. No seu computador, abra o terminal na pasta raiz do projeto (`c:\Users\dodo_\Desktop\Projeto para gincana`).
5. Digite os seguintes comandos (substituindo o link do seu repositório no último comando):
   ```bash
   git init
   git add .
   git commit -m "Versão inicial"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/gincana-leitura.git
   git push -u origin main
   ```
Pronto! Seu código está na nuvem.

---

## Passo 2: O Banco de Dados e API (Backend no Render)

O [Render](https://render.com/) vai hospedar sua inteligência (API) e o banco de dados (PostgreSQL) de graça.

### Criando o Banco de Dados
1. Crie uma conta no Render usando seu GitHub.
2. Clique em **"New +"** e depois em **"PostgreSQL"**.
3. Dê o nome de `gincana-db`, escolha a região mais próxima (ex: Ohio ou Frankfurt) e selecione o plano Free.
4. Clique em **"Create Database"**.
5. Quando terminar de criar, desça a tela e copie o texto que está em **"Internal Database URL"** (se a API também ficar no Render) ou **"External Database URL"**. Salve isso num bloco de notas.

### Criando a API
1. Volte ao painel do Render, clique em **"New +"** e depois em **"Web Service"**.
2. Conecte com o seu repositório do GitHub (`gincana-leitura`).
3. Preencha as configurações exatas abaixo:
   - **Name**: `gincana-api`
   - **Root Directory**: `backend` *(MUITO IMPORTANTE! Escreva exatamente assim)*
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx prisma db push && npm start`
4. Role para baixo até **"Environment Variables"** (Variáveis de Ambiente) e adicione 3 variáveis:
   - `DATABASE_URL` = Coloque o link do banco que você copiou antes.
   - `JWT_SECRET` = Escreva uma senha super difícil (ex: `Gincana@Lib2026_SecretKey`).
   - `FRONTEND_URL` = Por enquanto, deixe como `*` (asterisco). Depois que criarmos o site na Vercel, voltaremos aqui para colocar o link certo.
5. Selecione o plano Free e clique em **"Create Web Service"**.
6. Aguarde alguns minutos. Quando aparecer "Live", copie o link gerado (ex: `https://gincana-api.onrender.com`). Salve no bloco de notas.
7. Vá novamente em **Environment Variables** e adicione mais uma:
   - `BACKEND_URL` = Cole o link que você acabou de copiar (isso faz o anti-soneca funcionar).

### Importando as Planilhas (Seed)
1. No painel do seu Web Service `gincana-api` no Render, clique na aba **"Shell"** (no menu superior).
2. Digite o seguinte comando e dê Enter:
   ```bash
   npm run seed
   ```
Isso vai injetar todos os alunos e livros do Excel para o banco de dados na nuvem!

---

## Passo 3: O Site (Frontend na Vercel)

A [Vercel](https://vercel.com/) é a melhor e mais rápida plataforma para hospedar o visual do site de graça.

1. Crie uma conta na Vercel usando seu GitHub.
2. Clique em **"Add New..."** > **"Project"**.
3. Importe o repositório `gincana-leitura`.
4. Configure assim:
   - **Framework Preset**: `Vite` (ele deve detectar automático).
   - **Root Directory**: Deixe como está (`./`).
5. Abra a aba **"Environment Variables"** e adicione:
   - Name: `VITE_API_URL`
   - Value: O link do seu Render com `/api` no final (ex: `https://gincana-api.onrender.com/api`).
6. Clique em **"Deploy"**.
7. Aguarde um minuto. Ele vai te dar um link bonitinho (ex: `https://gincana-leitura.vercel.app`).

### Fechando o Cadeado de Segurança
1. Pegue esse link da Vercel (sem a barra `/` no final).
2. Volte lá no Render, no seu `gincana-api`, vá em **Environment Variables**.
3. Altere a variável `FRONTEND_URL` que estava com `*` para o link da Vercel.
4. Salve e deixe o Render reiniciar.

---

🎉 **PRONTO!** Seu sistema está completo, online, com banco de dados em nuvem e seguro.

Para acessar o sistema pela primeira vez, entre no link da Vercel, use o login **admin** e senha **123**. Ele vai te forçar a criar sua nova senha segura!