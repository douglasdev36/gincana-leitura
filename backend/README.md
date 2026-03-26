# Gincana de Leitura - Backend

Este é o servidor Node.js/Express responsável pela lógica e banco de dados (PostgreSQL) da Gincana.

## Deploy no Render (Plano Free)

Para fazer o deploy corretamente e **migrar seus dados das planilhas para a nuvem**, siga estes passos exatos:

### 1. Criar o Banco de Dados
1. No painel do [Render](https://render.com), crie um novo **PostgreSQL**.
2. Copie a `Internal Database URL` (se o backend também for ficar no Render) ou a `External Database URL`.

### 2. Criar o Web Service (Sua API)
1. Crie um novo **Web Service** no Render e conecte o seu repositório (Github, etc).
2. Configure as seguintes opções:
   - **Root Directory**: `backend` (importante!)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx prisma db push && npm run start`
3. Adicione as Variáveis de Ambiente (Environment Variables):
   - `DATABASE_URL`: A URL do banco que você copiou no passo 1.
   - `JWT_SECRET`: Uma senha forte e segura para o login.
   - `FRONTEND_URL`: A URL do seu site no Vercel (ex: `https://minha-gincana.vercel.app`).
   - `BACKEND_URL`: A URL que o próprio Render vai gerar para essa API (para o auto-ping funcionar).

### 3. Migrar os Dados das Planilhas (O Pulo do Gato)
Quando o servidor estiver no ar, o banco de dados estará vazio. Como as planilhas do Excel vão subir junto com o código para o Render, você pode rodar o script de Seed lá dentro da nuvem!

1. No painel do seu Web Service no Render, vá na aba **"Shell"** (Terminal).
2. Digite o seguinte comando e aperte Enter:
   ```bash
   npm run seed
   ```
3. Aguarde alguns segundos. O terminal vai mostrar que está lendo os Excel e salvando os +800 alunos e os +4000 livros, além de criar o usuário administrador (`admin` / `123`).

Pronto! Seu banco de dados na nuvem estará populado exatamente como estava no seu computador local.