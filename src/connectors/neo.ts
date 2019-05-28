import neo4j from 'neo4j-driver'
import { IHashAuthors, CitiesFromBook } from '../types/types';

const NEO4J_URL = process.env.NEO4J_URL ? `bolt://${process.env.NEO4J_URL}:7687` : "bolt://78.141.213.31:7687";
const NEO4J_USER = process.env.NEO4J_USER ? process.env.NEO4J_USER : "neo4j";
const NEO4J_PASS = process.env.NEO4J_PASS ? process.env.NEO4J_PASS : "test";

export function getAuthorsAndBookFromCity(city: string): Promise<IHashAuthors>{
    const driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS));
    const session = driver.session();
    const resultPromise = session.run(
        `match(b: Book)-[m:Mentions]->(l:Location {name: $name})
        match(a:Author)-[w: Wrote]->(b)
        return b, a;`,
        {name: city}
    );
    let hashMap: IHashAuthors = {};
    return new Promise((resolve, reject) => {
        resultPromise.then(result => {
            //Book
            //Location
            //Author
            for (let index = 0; index < result.records.length; index++) {
                const record = result.records[index]
                const book = record.get(0).properties.title;
                const author = record.get(1).properties.name;
                if(!hashMap[book]){
                    hashMap[book] = [];
                }
                hashMap[book].push(author);
            }
            driver.close();
            session.close();
            resolve(hashMap);
          });
    })
}

export function getCitiesFromBookTitle(title: string): Promise<CitiesFromBook[]>{
    const driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS));
    const session = driver.session();
    const resultPromise = session.run(
        `match(b:Book {title: $title})-[m:Mentions]->(l:Location)
        return l`,
        {title: title}
    );
    return new Promise((resolve, reject) => {
        resultPromise.then(result => {
            //Book
            //Location
            //Author
            let arr: CitiesFromBook[] = [];
            for (let index = 0; index < result.records.length; index++) {
                const record: CitiesFromBook = result.records[index].get(0).properties
                arr.push(record);
            }
            driver.close();
            session.close();
            resolve(arr);
          });
    })
}

export function getBooksAndPlotCitiesFromAuthor(author: string){
    const driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS));
    const session = driver.session();
    const resultPromise = session.run(
        `match(a:Author {name: $author})-[m:Wrote]->(b: Book)
        match(b)-[m1:Mentions]->(l:Location)
        return b, l;`,
        {author: author}
    );
    return new Promise((resolve, reject) => {
        let temp = {};
        resultPromise.then(result => {
            //Book
            //Location
            //Author
            let arr = [[], []];
            for (let index = 0; index < result.records.length; index++) {
                const city: CitiesFromBook = result.records[index].get(1).properties
                const book = result.records[index].get(0).properties
                arr[0].push(city);
            }
            for (let index = 0; index < result.records.length; index++) {
                const element = result.records[index];
                temp[element.get(0).properties.title] = true;
            }
            arr[0] = arr[0].filter(element => {
                if(element.latitude || element.longitude){
                    return true;
                }else{
                    return false;
                }
            })
            arr[1] = Object.keys(temp);
            driver.close();
            session.close();
            resolve(arr);
          });
    })
}

export function getTitlesInVicinity(latitude: number, longitude: number){
    const driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS));
    const session = driver.session();
    const resultPromise = session.run(
        `match(b:Book)-[:Mentions]->(l:Location) 
        WHERE toFloat(l.latitude) > $latitude - 10 AND toFloat(l.latitude) < $latitude + 10 AND toFloat(l.longitude) > $longitude - 10 AND toFloat(l.longitude) < $longitude + 10
        return b.title`,
        {latitude, longitude}
    );
    return new Promise((resolve, reject) => {
        resultPromise.then(result => {
            //Book
            //Location
            //Author
            let hashMap = {};
            for (let index = 0; index < result.records.length; index++) {
                const element = result.records[index].get(0);
                hashMap[element] = true;
            }

            driver.close();
            session.close();
            resolve(Object.keys(hashMap));
          });
    })
    
}

getTitlesInVicinity(10, 10);
