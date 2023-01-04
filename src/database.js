import { MongoClient } from 'mongodb';

let db = null;
const mongo_url = process.env.MONGO_URL || 'mongodb://localhost:27017';

const mongoClient = new MongoClient(mongo_url);
mongoClient
	.connect()
	.then(() => {
		console.log('conectado ao banco ');
		db = mongoClient.db('database-chat-uol');
	})
	.catch(() => console.log('erro ao conectar com o banco Mongo'));

export default db;
