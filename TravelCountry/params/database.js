const DATABASECONNECTION = "mongodb+srv://chenyuyang:Food1221!@cluster0.hiah2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
//working with local database mongodb
//const DATABASECONNECTION = "mongodb://localhost:27017/";

module.exports = { DATABASECONNECTION };  
// use {} to enclose the DATABASECONNECTION so that we can see it in app.js when call params.DATABASECONNECTION