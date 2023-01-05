import express, { json } from "express";
import cors from "cors";
import { organizaMensagens, updateParticipants } from "./utils/utilFunctions.js";
import dayjs from "dayjs";
import {
    validateMessageBody,
    validateMessageHeader,
    validatePostParticipantBody,
} from "./validations/validateFunctions.js"
import { db } from "./database.js";
import { errorMaker } from "./errors/errorFunctions.js";

const app = express();
app.use(cors());
app.use(json());

app.post("/participants", async (req, res) => {
    try {
        if (!validatePostParticipantBody(req.body)) {
            throw errorMaker(422, "por favor, preenhca as informações corretamente");
        }
        const participant = await db.collection("participants").findOne({
            name: req.body.name,
        });
        if (participant) throw errorMaker(409, "este nome ja existe, por favor digite outro");

        await db.collection("participants").insertOne({
            ...req.body,
            lastStatus: Date.now(),
        });
        await db.collection("messages").insertOne({
            from: req.body.name,
            to: "Todos",
            text: "entra na sala...",
            type: "status",
            time: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        });
        return res.sendStatus(201);

    } catch (error) {
        if (error.code === 500) console.log(error);
        return res.status(error.code).send(error.message);
    }

});

app.get("/participants", async (req, res) => {
    try {
        const participants = await db.collection("participants").find({}).toArray();
        return res.send(participants);
    } catch (error) {
        if (error.code === 500) console.log(error);
        return res.status(error.code).send(error.message);
    }
});

app.post("/messages", async (req, res) => {
    try {
        const participants = await db.collection("participants").find({}).toArray()
        if (
            validateMessageBody(req.body) &&
            validateMessageHeader(req.headers, participants)
        ) {
            await db.collection("messages").insertOne({
                from: req.headers.user,
                ...req.body,
                time: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
            });
            return res.sendStatus(201);
        } else {
            throw errorMaker(422, "por favor, preenhca as informações corretamente");
        }
    } catch (error) {
        if (error.code === 500) console.log(error);
        return res.status(error.code).send(error.message);
    }
});

app.get("/messages", async (req, res) => {
    const { user } = req.headers;
    const { limit } = req.query;
    if (!user) throw errorMaker(422);
    try {
        let messages = await db.collection("messages").find({}).toArray();
        messages = organizaMensagens(messages, user, limit);
        return res.send(messages);

    } catch (error) {
        if (error.code === 500) console.log(error);
        return res.status(error.code).send(error.message);
    }
});

app.post("/status", async (req, res) => {
    const { user } = req.headers;
    if (!user) throw errorMaker(404);
    try {
        const participant = await db.collection("participants").findOne({ name: user })
        if (!participant) throw errorMaker(404);

        await db.collection("participants").updateOne(
            { _id: participant._id },
            { $set: { lastStatus: Date.now() } }
        );
        return res.sendStatus(200);

    } catch (error) {
        if (error.code === 500) console.log(error);
        return res.status(error.code).send(error.message);
    }
});

setInterval(updateParticipants, 15000);

export default app;
