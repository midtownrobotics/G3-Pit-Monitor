const express = require('express');
const app = express();

const PORT = 8004;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html")
})

app.get('/static.js', function(req, res) {
    res.sendFile(__dirname + "/static.js")
})

app.get('/battery', function(req, res) {
    res.send(JSON.stringify(batteries))
})

app.post('/', function(req, res) {
    let body = req.body;

    if (body.action == "changeBatteryState") {
        if (batteries[body.id].state == body.state) return;

        batteries[body.id].state = body.state
        batteries[body.id].stateTime = new Date().getTime()
    }
})

console.log(`listening on port ${PORT}!`);
app.listen(PORT);

// Battery Management

let batteries = []

const state = ["Charging", "InGame", "Idle"]

function addBattery(name) {
    batteries.push({
        name: name,
        id: batteries.length, 
        state: state[2], 
        stateTime: new Date().getTime()
    })
}

addBattery("A")
addBattery("B")
addBattery("C")
addBattery("D")
addBattery("E")
addBattery("F")
addBattery("G")
addBattery("H")