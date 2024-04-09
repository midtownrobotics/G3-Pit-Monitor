const express = require('express');
const app = express();
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const fs = require('fs');

const PORT = 8080
app.set('views', 'views');
app.set('view engine', 'ejs');

const EVENT_KEY = fs.readFileSync(__dirname + '/PUT-EVENT-KEY-HERE.txt').toString();

function TBHAPI(theUrl){
    const parsedUrl = "https://www.thebluealliance.com/api/v3" + theUrl + "?X-TBA-Auth-Key=LVDMCD06pMcEyS94sswn0hp8mGup9P2vfYhXZ6MgTgWt5oLzlNCP3RdBsm41g8Zs"
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", parsedUrl, false);
    xmlHttp.send( null );
    return JSON.parse(xmlHttp.responseText);
}

function getMatches() {
    
    let matches = TBHAPI(`/event/${EVENT_KEY}/matches`)

    function compareByTime(a, b) {
        if (a.predicted_time < b.predicted_time) {
            return -1;
        }
        if (a.predicted_time > b.predicted_time) {
            return 1;
        }
        return 0;
    }

    matches = matches.sort(compareByTime)

    let upcomingMatches = [];

    for (let i = 0; i < matches.length; i++) {
        if (matches[i].actual_time == null) {
            upcomingMatches.push(matches[i])
        }
    }

    let pastMatches = [];

    for (let i = 0; i < matches.length; i++) {
        if (matches[i].actual_time !== null) {
            pastMatches.push(matches[i])
        }
    }

    return {past: pastMatches, upcoming: upcomingMatches};
}

app.get('/dash', function(req, res) {
    res.render('dash', {matches: getMatches().upcoming, past: getMatches().past, status: TBHAPI(`/event/${EVENT_KEY}/teams/statuses`).frc1648, rankings: TBHAPI(`/event/${EVENT_KEY}/rankings`).rankings});
})

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html")
})

console.log(`listening on port ${PORT}!`);
app.listen(PORT);