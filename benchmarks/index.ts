import fetch from 'node-fetch';

const cities = ["Ba", "Of", "Aga", "Koga", "Aba", "Aalborg", "Ba", "Of", "Aga", "Koga", "Aba", "Aalborg", "Ba", "Of", "Aga", "Koga", "Aba", "Aalborg"];

async function mysql(){
    let arr = [];
    let average = 0;
    for (let index = 0; index < cities.length; index++) {
        const before = new Date().getTime();
        await fetchUrl("http://83.88.66.128:3000/sql/vicinity", 10, 10)
        const after = new Date().getTime();
        const diff = after-before;
        average += diff;
        arr.push(after-before);
    }
    console.log("--------------------------\nMySql\n")
    console.log(average/arr.length);
}

async function neo(){
    let arr = [];
    let average = 0;
    for (let index = 0; index < cities.length; index++) {
        const before = new Date().getTime();
        await fetchUrl("http://83.88.66.128:3000/neo/vicinity", 10, 10)
        const after = new Date().getTime();
        const diff = after-before;
        average += diff;
        arr.push(after-before);
    }
    console.log("--------------------------\nNeo\n")
    console.log(average/arr.length);
}

function fetchUrl(url: string, latitude: number, longitude: number){
    return new Promise((resolve, reject) => {
        fetch(url, { method: 'POST', 
        body: JSON.stringify({latitude, longitude}),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(res => res.json()) // expecting a json response
        .then(json =>  {
            resolve(true)
        }).catch(e => console.log(e));  
    })
    
}

(async () => {
    await mysql();
    await neo();
})();
