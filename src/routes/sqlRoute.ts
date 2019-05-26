import * as express from 'express';
import { getAuthorsAndBookFromCity } from '../connectors/sql'
const router = express.Router();

router.post("/", (req, res) => {
    res.send("hesllo from sql")
})

export default router;
