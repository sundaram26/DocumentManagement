import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import session from 'express-session';
import MongoDBStore from 'connect-mongodb-session'
import mongoose from 'mongoose';

const app = express()

// Connect to MongoDB
const mongoDBStore = MongoDBStore(session);

const store = new mongoDBStore({
    uri: `${process.env.MONGODB_URI}/${DB_NAME}`, 
    collection: 'sessions' 
});

store.on('error', (error) => {
    console.error('MongoDB session store error:', error);
});

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({extended: true, limit: "50mb"}))
app.use(express.static("public"))
app.use(cookieParser()) 
app.use(session({
    secret: process.env.SESSION_SECRET_KEY, 
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { 
        secure: true,
        httpOnly: true,
        maxAge: 2* 60 * 60 * 1000 
    } // Set to true if using HTTPS
}));



//route import
import userRoutes from "./routes/user.routes.js"
import otpRoutes from "./routes/otp.routes.js"
import dmsRoutes from "./routes/dmsMembers.routes.js"
import rotaractRoutes from "./routes/rotaractMembers.routes.js"
import adminRoutes from "./routes/admin.routes.js"

//routes declaration
app.use('/api/v1/users', userRoutes)     // http://localhost:8000/api/v1/users/register
app.use('/api/v1/users', otpRoutes)
app.use('/api/v1/members/dms', dmsRoutes)
app.use('/api/v1/members/rotaract', rotaractRoutes)
app.use('/api/v1/admin', adminRoutes)


export { app }