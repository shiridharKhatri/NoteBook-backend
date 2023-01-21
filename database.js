const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({path:"./config.env"});
const dbURL = process.env.DATABASE;
const connectToServer = ()=>{
    mongoose.connect(dbURL).then(()=>{
        console.log("Connected To Server Successfully");
    }).catch((error)=>{
        console.log("Failed to connect with a server", error)
    })
}
module.exports = connectToServer;