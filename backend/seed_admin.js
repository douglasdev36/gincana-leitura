const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Criando administrador padrão...');

  const username = 'admin';
  const password = '123'; // Senha padrão (deve ser alterada em produção)

  const existingAdmin = await prisma.admin.findUnique({
    where: { username }
  });

  if (existingAdmin) {
    console.log('Admin já existe.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.admin.create({
    data: {
      username,
      password: hashedPassword,
      name: 'Administrador da Biblioteca'
    }
  });

  console.log('✅ Admin criado com sucesso! (Usuário: admin / Senha: 123)');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });