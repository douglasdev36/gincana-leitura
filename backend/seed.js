const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const path = require('path');

const prisma = new PrismaClient({});

async function main() {
  console.log('Seeding database...');

  // 1. Seed Users
  const usersFile = path.join(__dirname, '../usuarios_quissama.xlsx');
  const wbUsers = xlsx.readFile(usersFile);
  const wsUsers = wbUsers.Sheets[wbUsers.SheetNames[0]];
  const usersData = xlsx.utils.sheet_to_json(wsUsers);

  console.log(`Found ${usersData.length} users in Excel.`);
  for (const row of usersData) {
    const nome = row['Nome completo'];
    if (!nome) continue;

    const matricula = row['Matrícula'] ? String(row['Matrícula']) : null;
    const email = row['E-mail'] ? String(row['E-mail']) : null;
    const telefone = row['Telefone'] ? String(row['Telefone']) : null;

    await prisma.user.create({
      data: {
        name: nome,
        matricula,
        email,
        telefone
      }
    });
  }
  console.log('Users seeded.');

  // 2. Seed Books
  const booksFile = path.join(__dirname, '../informação_livro.xlsx');
  const wbBooks = xlsx.readFile(booksFile);
  const wsBooks = wbBooks.Sheets[wbBooks.SheetNames[0]];
  const booksData = xlsx.utils.sheet_to_json(wsBooks);

  console.log(`Found ${booksData.length} books in Excel.`);
  for (const row of booksData) {
    const titulo = row['Título'];
    if (!titulo) continue;

    const descFisica = row['Descrição Física'] ? String(row['Descrição Física']) : '';
    // Extrai o primeiro número encontrado na descrição física (ex: '384 p.' -> 384)
    const match = descFisica.match(/\d+/);
    const pages = match ? parseInt(match[0], 10) : 0;

    const bookRecord = await prisma.book.create({
      data: {
        title: titulo,
        pages: pages
      }
    });

    const tomboStr = row['Número de tombo'] ? String(row['Número de tombo']) : '';
    const tombos = tomboStr.split(',').map(t => t.trim()).filter(t => t);

    for (const tombo of tombos) {
      // Ignora se o tombo já existir no banco para não dar erro
      const existingCopy = await prisma.bookCopy.findUnique({ where: { tombo } });
      if (!existingCopy) {
        await prisma.bookCopy.create({
          data: {
            tombo: tombo,
            bookId: bookRecord.id
          }
        });
      }
    }
  }
  console.log('Books seeded.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
