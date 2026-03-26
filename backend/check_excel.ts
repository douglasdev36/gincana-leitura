import * as xlsx from 'xlsx';
import * as path from 'path';

const usersFile = path.join(__dirname, '../usuarios_quissama.xlsx');
const booksFile = path.join(__dirname, '../informação_livro.xlsx');

const wbUsers = xlsx.readFile(usersFile);
const wsUsers = wbUsers.Sheets[wbUsers.SheetNames[0]];
console.log('Users columns:', xlsx.utils.sheet_to_json(wsUsers, {header: 1})[0]);

const wbBooks = xlsx.readFile(booksFile);
const wsBooks = wbBooks.Sheets[wbBooks.SheetNames[0]];
console.log('Books columns:', xlsx.utils.sheet_to_json(wsBooks, {header: 1})[0]);