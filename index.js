import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.get("/", (req, res) => {
    res.send("voce esta no backjendeeee");
});

app.listen(5000, () => console.log("Aplicacao rodando normalmente"));