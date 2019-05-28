import * as express from 'express';
const bodyParser = require('body-parser');
import sqlRouter from './routes/sqlRoute';
import neoRouter from './routes/neoRoute';
import { getAuthorsAndBookFromCity, getCitiesFromBookTitle } from './connectors/sql';

const PORT = process.env.PORT ? process.env.PORT : 3000;

const app = express();

app.use(bodyParser.json());
app.use("/neo", neoRouter);
app.use("/sql", sqlRouter);

app.listen(PORT, () => {
    console.log(`Running server on port ${PORT}`)
})

