import * as express from 'express';
const bodyParser = require('body-parser');
import sqlRouter from './routes/sqlRoute';
import neoRouter from './routes/neoRoute';
import * as fs from 'fs';
import { getAuthorsAndBookFromCity, getCitiesFromBookTitle } from './connectors/sql';

const PORT = process.env.PORT ? process.env.PORT : 3000;

const app = express();

app.use(bodyParser.json());
app.use("/neo", neoRouter);
app.use("/sql", sqlRouter);

app.get("/html", async (req, res) => {
    const citiesArr = await getCitiesFromBookTitle("A Little Pilgrim: Stories of the Seen and the Unseen");
    fs.readFile('./src/pages/sut.html', 'utf8', (err, text) => {
        // Array af alle longitudes lægges sammen
        // Summen divideres med array.length
        // Samme gøres for latitude
        let medianLong = 0;
        let medianLat = 0;
        let cityMapLocation = "";
        console.log(citiesArr[0].name)
        for (let index = 0; index < citiesArr.length; index++) {
            const city = citiesArr[index];
            medianLong += parseFloat(city.longitude);
            medianLat += parseFloat(city.latitude);
            if(index === citiesArr.length-1){
                cityMapLocation += `["${city.name}", ${city.latitude}, ${city.longitude}]`
            }else{
                cityMapLocation += `["${city.name}", ${city.latitude}, ${city.longitude}],`
            }
        }
        text = text.replace("__ææ__", `${medianLat/citiesArr.length}, ${medianLong/citiesArr.length}`)
        text = text.replace("__åå__", `[${cityMapLocation}]`)
        res.send(text);
    })
})

app.listen(PORT, () => {
    console.log(`Running server on port ${PORT}`)
})

