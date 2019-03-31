const express = require("express");
const app = express();

app.listen(3001, "localhost", function(){
    console.log("Сервер ожидает подключения...");
});

