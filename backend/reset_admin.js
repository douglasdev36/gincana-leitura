const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('123', 10);
    
    await prisma.admin.update({
      where: { username: 'admin' },
      data: {
        password: hashedPassword,
        isFirstLogin: true // Força a pedir uma senha nova de novo
      }
    });
    
    console.log('✅ Senha do admin resetada com sucesso para "123"!');
  } catch (error) {
    console.error('❌ Erro ao resetar admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();