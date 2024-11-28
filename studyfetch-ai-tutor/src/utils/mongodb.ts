import { MongoClient } from 'mongodb';

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!process.env.MONGODB_URI) {
    throw new Error ('Please define the MONGODB_URI environment variable');
}

const uri = process.env.MONGODB_URI as string;
const options = {};

let client: MongoClient;
let clientPromise: Promise <MongoClient>;

if(process.env.NODE_ENV === 'development') {
    if(!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
}
else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}
export const connectToDatabase = async () => {
    const client = await clientPromise;
    const db = client.db();
    return { client, db };
};

export default clientPromise;