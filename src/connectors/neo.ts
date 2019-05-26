import neo4j from 'neo4j-driver'

const NEO4J_URL = process.env.NEO4J_URL ? `bolt://${process.env.NEO4J_URL}:7687` : "bolt://78.141.213.31:7687";
const NEO4J_USER = process.env.NEO4J_USER ? process.env.NEO4J_USER : "neo4j";
const NEO4J_PASS = process.env.NEO4J_PASS ? process.env.NEO4J_PASS : "test";



export function createAuthorAndBook(name: string, title: string): Promise<boolean>{
    const driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS));
    const session = driver.session();
    const resultPromise = session.run(
        `Create(a: Author {name: $name})
        Create(b: Book {
            title: $title
        })
        CREATE (a)-[r:Wrote]->(b);`,
        {name: name, title: title}
    );
    return new Promise((resolve, reject) => {
        resultPromise.then(result => {
            driver.close();
            session.close();
            resolve(true);
          });
    })
}

export function createCityRelationToBook(title:string, city: string): Promise<boolean>{
    const driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS));
    const session = driver.session();
    const resultPromise = session.run(
        `MATCH(b: Book { title: $title })
        MATCH(a: Location { name: $name })
        CREATE (a)-[r:Mentions]->(b);`,
        { title: title, name: city }
    );
    return new Promise((resolve, reject) => {
        const result = resultPromise.then((result: any) => {
            driver.close();
            session.close();
            resolve(true);
        }).catch((err: any) => reject(err));
    })
}

export function close(){
    
}
