import express, { json } from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient("mongodb://localhost:27017");
let db = null;
mongoClient.connect().then(() => {
    db = mongoClient.db("database-chat-uol");
})

const app = express();
app.use(cors());
app.use(json());

app.get("/", (req, res) => {
    db.collection("teste").find({});
    db.collection("teste").insertOne({
        name: "augusto"
    })
    res.send("voce esta no backjendeeee");
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server up an running on port ${port}`));