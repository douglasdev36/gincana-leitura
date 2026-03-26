const xlsx = require('xlsx');
const path = require('path');

const booksFile = path.join(__dirname, '../informação_livro.xlsx');
const wbBooks = xlsx.readFile(booksFile);
const wsBooks = wbBooks.Sheets[wbBooks.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(wsBooks);
console.log('Sample book data:');
console.log(data.slice(0, 3));
