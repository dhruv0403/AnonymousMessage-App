import mongoose, { mongo } from "mongoose";

type ConnectionObject={
    isConnected?: number;

}

/* The line `const connection:ConnectionObject={}` is declaring a constant variable named `connection` of
type `ConnectionObject` in TypeScript. It initializes the variable with an empty object `{}`. This
object can have an optional property `isConnected` of type number, but since it is not provided
during initialization, it is currently undefined. */
const connection:ConnectionObject={}

async function dbConnect():Promise<void> {
    // Check if we have a connection to the database or if it's currently connecting
    if(connection.isConnected){
        console.log('Already connected to the database');
        return;
    }
    
    try {
        const db=await mongoose.connect(process.env.MONGODB_URI || '',{})
        connection.isConnected = db.connections[0].readyState;
        console.log('Database connected successfully');

    } catch (error) {
        console.error('Database connection failed:', error);
        // Graceful exit in case of a connection error
        process.exit(1);

    }
}

export default dbConnect;