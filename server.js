const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database")

//Handeling Uncaught Exception

process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log("shutting down the server due to uncaught exception");
    process.exit(1);
})



//COnfig
dotenv.config({path:'backend/config/config.env'});
//COnnect to database
connectDatabase();


const server =  app.listen(process.env.PORT,()=>{

    console.log(`server is working on http://localhost:${process.env.PORT}`)
});

//unhandeled promise rejection
process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log("shutting down the server due to unhandeled exception");
    server.close(()=>{
        process.exit(1);
    });
});

