import dayjs from "dayjs";
import { db } from "../database.js";

export function organizaMensagens(messages, user, limit = null) {
  messages = filtraMensagens(messages, user);
  messages = ordenaMensagens(messages);
  if (limit) {
    return limitaMensagens(messages, limit);
  }
  return messages;
}

function filtraMensagens(messages, user) {
  let filter_messages = [];
  messages.forEach(message => {
    if (message.type === "private_message") {
      if (message.to === user || message.from === user) {
        filter_messages.push(message);
      }
    } else {
      filter_messages.push(message);
    }
  });
  return filter_messages;
}

function ordenaMensagens(messages) {
  return messages.sort(function (a, b) {
    if (a.time > b.time) {
      return 1;
    }
    if (a.time < b.time) {
      return -1;
    }
    return 0;
  });
}

function limitaMensagens(messages, limit) {
  const limited_messages = [];
  for (let i = 0; i < messages.length; i++) {
    if (i < limit) {
      const format_time = dayjs(messages[i].time).format("HH:mm:ss");
      limited_messages.push({ ...messages[i], time: format_time });
    }
  }
  return limited_messages;
}

export async function updateParticipants() {
  const participants = await db.collection("participants").find({}).toArray();
  await verificaStatus(participants);
}

async function verificaStatus(participants) {
  const now = Date.now();
  for (let participant of participants) {
    if ((now - participant.lastStatus) / 1000 > 10) {
      await removeParticipant(participant);
    }
  }
}

async function removeParticipant(participant) {
  const message = {
    from: participant.name,
    to: 'Todos',
    text: 'sai da sala...',
    type: 'status',
    time: dayjs().format("YYYY-MM-DDTHH:mm:ss")
  };

  await db.collection("participants").deleteOne({ _id: participant._id });
  await db.collection("messages").insertOne(message);
}
