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
        let str = `SELECT Location.\`name\`, latitude, longitude FROM Book
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

export function getBooksAndPlotCitiesFromAuthor(author: string){
    return new Promise((resolve, reject) => {
        let str = `SELECT Book.title, Location.\`name\`, latitude, longitude FROM Book
        INNER JOIN LocationInBook ON LocationInBook.fk_Book = Book.id
        INNER JOIN Location on Location.\`name\`=LocationInBook.fk_Location
        INNER JOIN BookWrittenBy on BookWrittenBy.fk_Book = Book.id
        INNER JOIN Author on Author.id = BookWrittenBy.fk_Author
        WHERE Author.\`name\`=  ?;`;
        connection.query(str, [author], (error, rows) => {
            if (error) {
                return reject(error)
            }
            if(!rows.length){
                reject(`No cities found from author "${author}"`);
            }else{
                let normalized = convertRowPacketToArray(rows);
                console.log(normalized)
                const titles: string[] = [];
                let temp: any = {};
                for (let index = 0; index < normalized.length; index++) {
                    const element = normalized[index];
                    temp[element.title] = true;
                }
                let removalArr = [];
                for (let index = 0; index < normalized.length; index++) {
                    const element = normalized[index];
                    
                    if(!element.latitude || !element.longitude){
                        removalArr.push(element.title);
                    }else{
                        delete normalized[index].title;
                    }
                }
                normalized = normalized.filter((element) => { 
                    if(!element.title){
                        return true;
                    }else if(removalArr.includes(element.title)){
                        return false;
                    }
                    return false;
                 })
                resolve([normalized as CitiesFromBook[], Object.keys(temp)]);
            }
        });
    })
}

export function getTitlesInVicinity(latitude: number, longitude: number){
    /*
    SELECT Book.title FROM Location 
INNER JOIN LocationInBook ON LocationInBook.fk_Location = Location.`name`
INNER JOIN Book ON Book.id = LocationInBook.fk_Book
WHERE longitude <= 20+10 AND longitude >= 20-10 AND latitude <= 20+10 AND latitude >= 20-10;
    */
   return new Promise((resolve, reject) => {
    let str = `SELECT Book.title FROM Location 
    INNER JOIN LocationInBook ON LocationInBook.fk_Location = Location.\`name\`
    INNER JOIN Book ON Book.id = LocationInBook.fk_Book
    WHERE longitude <= ?+10 AND longitude >= ?-10 AND latitude <= ?+10 AND latitude >= ?-10;`;
    connection.query(str, [longitude, longitude, latitude, latitude], (error, rows) => {
        if (error) {
            return reject(error)
        }
        if(!rows.length){
            reject(`No books in the vicinity POINT(${latitude}, ${longitude})`);
        }else{
            const normalized = convertRowPacketToArray(rows) as {title: string}[];
            let hashMap = {};
            for (let index = 0; index < normalized.length; index++) {
                const element = normalized[index];
                hashMap[element.title] = true;
            }
            resolve(Object.keys(hashMap));
        }
    });
})
}

getTitlesInVicinity(10, 10);

/*
SELECT Book.title, Location.`name`, latitude, longitude FROM Book
INNER JOIN LocationInBook ON LocationInBook.fk_Book = Book.id
INNER JOIN Location on Location.`name`=LocationInBook.fk_Location
INNER JOIN BookWrittenBy on BookWrittenBy.fk_Book = Book.id
INNER JOIN Author on Author.id = BookWrittenBy.fk_Author
WHERE Author.`name`=  ?;
*/

function convertRowPacketToArray(rowPacket: any){
    return JSON.parse(JSON.stringify(Object.values(rowPacket)))
}

function log(sut: any){
    console.log(sut);
}
