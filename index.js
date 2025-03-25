const express = require('express');
const { Battery, sequelize } = require('./models');
const app = express();

const PORT = 8007;

// (async () => {
//     try {
//         await Battery.sync({ force: true });
//         await sequelize.authenticate();
//         console.log('Connected to the SQLite database using better-sqlite3.');
//     } catch (error) {
//         console.error('Unable to connect to the database:', error);
//     }
// })();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("./static"))

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/simple.html")
})

app.get('/dash', function(req, res) {
    res.sendFile(__dirname + "/dash.html")
})

app.get('/battery', async function(req, res) {

    res.send(JSON.stringify(await Battery.findAll()))

    // res.send('battery')
})

app.post('/', async function(req, res) {
    let body = req.body;

    if (body.action == "changeBatteryState") {
        const battery = await Battery.findOne({ where: { id: body.id } })
        battery.update({ state: body.state })
        battery.update({ time: new Date().getTime() })
    }
})

console.log(`listening on port ${PORT}!`);
app.listen(PORT);

// Battery Management

let batteries = []

const state = ["Charging", "InGame", "Idle", "Evil"]

async function addBattery(name) {
    await Battery.findOrCreate({
        where: {name: name},
        defaults: {
            state: state[2], 
            time: new Date().getTime()
        }
    })
}

async function loadBatteries() {
    await addBattery("Mustard")
    await addBattery("Ketchup")
    await addBattery("Ranch")
    await addBattery("Soy Sauce")
    await addBattery("Tzatziki")
    await addBattery("BBQ")
    await addBattery("Sriracha")
    await addBattery("Mayo")
}

loadBatteries()
