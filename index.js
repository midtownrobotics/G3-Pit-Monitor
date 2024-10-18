const express = require('express');
const app = express();

const PORT = 8004;

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html")
})

app.get('/static.js', function(req, res) {
    res.sendFile(__dirname + "/static.js")
})

console.log(`listening on port ${PORT}!`);
app.listen(PORT);