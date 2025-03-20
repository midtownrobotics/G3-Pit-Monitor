const express = require('express');
const app = express();

const PORT = 8004;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("./static"))

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/simple.html")
})

app.get('/dash', function(req, res) {
    res.sendFile(__dirname + "/dash.html")
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

const state = ["Charging", "InGame", "Idle", "Evil"]

function addBattery(name) {
    batteries.push({
        name: name,
        id: batteries.length, 
        state: state[2], 
        stateTime: new Date().getTime()
    })
}

addBattery("Tzatziki")
addBattery("Mustard")
addBattery("Mayo")
addBattery("Ketchup")
addBattery("BBQ")
addBattery("Soy Sauce")
addBattery("Sriracha")
addBattery("Ranch")