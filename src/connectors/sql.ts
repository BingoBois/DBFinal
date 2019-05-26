import * as mysql from 'mysql'
import { CitiesFromBook } from '../types/types';

const MYSQL_HOST = process.env.MYSQL_HOST ? process.env.MYSQL_HOST : "78.141.213.31";
const MYSQL_USER = process.env.MYSQL_USER ? process.env.MYSQL_USER : "root";
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD ? process.env.MYSQL_PASSWORD : "mingade85";
const MYSQL_DATABASE = process.env.MYSQL_DATABASE ? process.env.MYSQL_DATABASE : "dbbook";

const connection = mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    multipleStatements: true,
    connectTimeout: 200000
});
connection.connect();

export function getAuthorsAndBookFromCity(city: string) {
    return new Promise((resolve, reject) => {
        let str = `SELECT distinct Author.name, Book.title FROM LocationInBook
    INNER JOIN Book ON Book.id=fk_Book
    INNER JOIN BookWrittenBy ON LocationInBook.fk_Book=BookWrittenBy.fk_Book
    INNER JOIN Author ON Author.id=BookWrittenBy.fk_Author
    WHERE fk_Location=?;`;
        connection.query(str, [city], (error, rows) => {
            if (error) {
                return reject(error)
            }
            if(!rows.length){
                reject(`No books found mentioning "${city}"`);
            }else{
                resolve(rows);
            }
        });
    })
}

export function getCitiesFromBookTitle(title: string): Promise<CitiesFromBook[]> {
    return new Promise((resolve, reject) => {
        let str = `SELECT Book.title, Location.\`name\`, latitude, longitude FROM Book
        INNER JOIN LocationInBook ON LocationInBook.fk_Book = Book.id
        INNER JOIN Location on Location.\`name\`=LocationInBook.fk_Location
        WHERE title = ?;`;
        connection.query(str, [title], (error, rows) => {
            if (error) {
                return reject(error)
            }
            if(!rows.length){
                reject(`No cities found in book "${title}"`);
            }else{
                resolve(convertRowPacketToArray(rows) as CitiesFromBook[]);
            }
        });
    })
}

function convertRowPacketToArray(rowPacket: any){
    return JSON.parse(JSON.stringify(Object.values(rowPacket)))
}

function log(sut: any){
    console.log(sut);
}
