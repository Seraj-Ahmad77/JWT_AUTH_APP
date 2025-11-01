import mongoose from "mongoose";

export const connectDB=()=>{
    mongoose.connect(process.env.MONGO_URI,{
        dbName:"JWT_AUTHENTICATION",

    }).then(()=>{
        console.log("Database connected successfully.");
    }).catch((err)=>{
        console.log(`Some error occured while connecting database ${err}`);
    })
}