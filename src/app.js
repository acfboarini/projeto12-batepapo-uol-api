import express, { json } from 'express';
import cors from 'cors';
import { organizaMensagens } from './utils/utilFunctions.js';
import dayjs from 'dayjs';
import { 
    validateMessageBody, validateMessageHeader, validatePostParticipantBody 
} from './validations/validateFunctions.js';
import { MongoClient } from 'mongodb';

let db;
const mongo_url = process.env.MONGO_URL || "mongodb://localhost:27017";

const mongoClient = new MongoClient(mongo_url);
mongoClient.connect().then(() => {
  db = mongoClient.db("database-chat-uol");
});

const app = express();
app.use(cors());
app.use(json());

app.post("/participants", (req,res) => {

    if (validatePostParticipantBody(req.body)) {
        db.collection("participants").findOne({
            name: req.body.name
        })
        .then(participante => {
    
            if (participante) return res.status(409).send("este nome ja existe, por favor digite outro");
    
            db.collection("participants").insertOne({
                ...req.body,
                lastStatus: Date.now()
            })
            .then(() => {
                const time = dayjs().format("HH:mm:ss");
                db.collection("messages").insertOne({
                    from: req.body.name, 
                    to: 'Todos', 
                    text: 'entra na sala...', 
                    type: 'status', 
                    time
                }).then(response => {
                    res.sendStatus(201);
                });
            });
        });
    } else {
        return res.status(422).send("por favor, preenhca as informações corretamente")
    }
});

app.get("/participants", (req, res) => {
    db.collection("participants").find({}).toArray()
    .then(participants => {
        res.status(200).send(participants);
    });
});

app.post("/messages", (req, res) => {
    let participants;
    db.collection("participants").find({}).toArray()
    .then(participantsData => {
        participants = participantsData;
        if (validateMessageBody(req.body) && validateMessageHeader(req.headers, participants)) {
            const time = dayjs().format("HH:mm:ss");
            db.collection("messages").insertOne({
                from: req.headers.user,
                ...req.body,
                time,
            }).then(() => res.sendStatus(201));
        } else {
            return res.status(422).send("por favor, preencha as informações corretamente")
        }
    });
});

app.get("/messages", (req, res) => {
    const { user } = req.headers;
    const { limit } = req.query;
    if (!user) return res.sendStatus(422);
    let messages;
    db.collection("messages").find({}).toArray()
    .then(result => {
        messages = organizaMensagens(result, user, limit);
        return res.send(messages);
    });
});



export default app;