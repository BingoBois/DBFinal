import * as express from 'express';
import { getAuthorsAndBookFromCity, getCitiesFromBookTitle, getBooksAndPlotCitiesFromAuthor, getTitlesInVicinity  } from '../connectors/neo'
const router = express.Router();
import * as fs from 'fs';
import { CitiesFromBook } from '../types/types';


router.post("/findBooksFromCity", async (req, res) => {
    const city = req.body.city;
    if(city){
        res.json(await getAuthorsAndBookFromCity(city))
    }else{
        res.json({message: "Please send a city with your post request"})
    }
})

router.post("/html", async (req, res) => {
    const bookTitle = req.body.bookTitle;
    if(bookTitle){
        const citiesArr = await getCitiesFromBookTitle(bookTitle);
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
            text = text.replace("__øø__", "");
            res.send(text);
        })
    }else{
        res.send("No bookTitle found")
    }
})

router.get("/html2", async (req, res) => {
    const author = "Various"
    //req.body.bookTitle;
    if(author){
        try{
            const sqlData = await getBooksAndPlotCitiesFromAuthor(author);
            console.log(sqlData[1]);
            const citiesArr = sqlData[0] as CitiesFromBook[];
            const titles: string[] = sqlData[1] as string[];
            fs.readFile('./src/pages/sut.html', 'utf8', (err, text) => {
                // Array af alle longitudes lægges sammen
                // Summen divideres med array.length
                // Samme gøres for latitude
                let medianLong = 0;
                let medianLat = 0;
                let cityMapLocation = "";
                console.log(citiesArr.length)
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
                text = text.replace("__øø__", "<p>" + titles.join("</p><p>") + "</p>");
                res.send(text);
            })
        }catch(e){
            res.send(e)
        }
        
    }else{
        res.send("No bookTitle found")
    }
})

router.post("/vicinity", async (req, res) => {
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
    if(!latitude || !longitude){
        return res.json({error: "Missing latitude or longitude"})
    }
    try {
        res.json(await getTitlesInVicinity(latitude, longitude))
    } catch (error) {
        res.json(error)
    }
})
export default router;
