import express, { json } from "express";
import cors from "cors";
import { organizaMensagens } from "./utils/utilFunctions.js";
import dayjs from "dayjs";
import {
  validateMessageBody,
  validateMessageHeader,
  validatePostParticipantBody,
} from "./validations/validateFunctions.js";
import { MongoClient } from "mongodb";

let db;
const mongo_url = process.env.MONGO_URL || "mongodb://localhost:27017";

const mongoClient = new MongoClient(mongo_url);
mongoClient.connect()
.then(() => {
  console.log("conectado ao banco ")
  db = mongoClient.db("database-chat-uol");
})
.catch(() => console.log("erro ao conectar com o banco Mongo"))

const app = express();
app.use(cors());
app.use(json());

app.post("/participants", (req, res) => {
    if (validatePostParticipantBody(req.body)) {
        db.collection("participants").findOne({
            name: req.body.name,
        })
        .then((participante) => {
            if (participante) return res.status(409).send("este nome ja existe, por favor digite outro");
            db.collection("participants").insertOne({
                ...req.body,
                lastStatus: Date.now(),
            })
            .then(() => {
                db.collection("messages").insertOne({
                    from: req.body.name,
                    to: "Todos",
                    text: "entra na sala...",
                    type: "status",
                    time: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
                })
                .then(() => {
                    return res.sendStatus(201);
                });
            });
        });
    } else {
        return res.status(422).send("por favor, preenhca as informações corretamente");
    }
});

app.get("/participants", (req, res) => {
    db.collection("participants").find({}).toArray()
    .then((participants) => {
      return res.status(200).send(participants);
    });
});

app.post("/messages", (req, res) => {
    let participants;
    db.collection("participants").find({}).toArray()
    .then((participantsData) => {
        participants = participantsData;
        if (
            validateMessageBody(req.body) &&
            validateMessageHeader(req.headers, participants)
        ) {
            const time = dayjs().format("YYYY-MM-DDTHH:mm:ss");
            db.collection("messages").insertOne({
                from: req.headers.user,
                ...req.body,
                time,
            })
            .then(() => res.sendStatus(201));
        } else {
            return res.status(422).send("por favor, preencha as informações corretamente");
        }
    });
});

app.get("/messages", (req, res) => {
    const { user } = req.headers;
    const { limit } = req.query;
    if (!user) return res.sendStatus(422);

    db.collection("messages").find({}).toArray()
    .then((result) => {
        const messages = organizaMensagens(result, user, limit);
        return res.send(messages);
    });
});

app.post("/status", (req, res) => {
    const { user } = req.headers;
    if (!user) return res.sendStatus(404);

    db.collection("participants").findOne({name: user})
    .then(user => {
        if (user) {
            const status = Date.now();
            db.collection("participants").updateOne(
                { _id: user._id }, 
                { $set: { lastStatus: status } }
            );
            return res.sendStatus(200);
        }
        return res.sendStatus(404);
    });
});

setInterval(updateParticipants, 15000);

function updateParticipants() {
    db.collection("participants").find({}).toArray()
    .then((participants) => {
        verificaStatus(participants);
    });
}

function verificaStatus(participants) {
    const now = Date.now();
    for (let participant of participants) {
        if ((now - participant.lastStatus) / 1000 > 10) {
            removeParticipant(participant);
        }
    }
}

function removeParticipant(participant) {
    const message = {
        from: participant.name, 
        to: 'Todos', 
        text: 'sai da sala...', 
        type: 'status', 
        time: dayjs().format("YYYY-MM-DDTHH:mm:ss")
    };

    const promise = db.collection("participants").deleteOne({ _id: participant._id })
    promise.then(() => {
        return db.collection("messages").insertOne(message);
    });
}

export default app;
