import dayjs from 'dayjs';
import db from '../database.js';

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
	messages.forEach((message) => {
		if (message.type === 'private_message') {
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
			const format_time = dayjs(messages[i].time).format('HH:mm:ss');
			limited_messages.push({ ...messages[i], time: format_time });
		}
	}
	return limited_messages;
}

export function updateParticipants() {
	db.collection('participants')
		.find({})
		.toArray()
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
		time: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
	};

	const promise = db
		.collection('participants')
		.deleteOne({ _id: participant._id });
	promise.then(() => {
		return db.collection('messages').insertOne(message);
	});
}
