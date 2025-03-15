const EVENT_KEY = "2025gadal"

async function TBHAPI(theUrl){
    const parsedUrl = "https://www.thebluealliance.com/api/v3" + theUrl + "?X-TBA-Auth-Key=LVDMCD06pMcEyS94sswn0hp8mGup9P2vfYhXZ6MgTgWt5oLzlNCP3RdBsm41g8Zs"
    var response = await fetch(parsedUrl, { method: "GET" })
    var text = await response.text()
    var data = JSON.parse(text);
    console.log(data)
    return data
}

async function STATBOTICS(){
    const url = "https://api.statbotics.io/v3/team_event/1648/"+EVENT_KEY;
    var response = await fetch(url, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    })
    var text = await response.text()
    var data = JSON.parse(text)
    console.log(data.epa.breakdown)
    return data.epa.breakdown
}

const state = ["Charging", "InGame", "Idle"]

function changeBatteryState(id) {
    const stateToSet = state[document.getElementById(`state-${id}`).value]
    postData({action: "changeBatteryState", state: stateToSet, id: id})
}

async function getBatteryInfo() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "/battery", false);
    xmlHttp.send( null );
    return JSON.parse(xmlHttp.responseText);
}

let lastBatteryInfo = null;

async function reloadBatteryInfo(force) {
    let batteryInfo = await getBatteryInfo();

    if (JSON.stringify(lastBatteryInfo) == JSON.stringify(batteryInfo) && !force) return;

    console.log("Updating battery info")

    lastBatteryInfo = JSON.parse(JSON.stringify(batteryInfo));

    $("batteries").html("<h1 style='font-size: 50px;'>Battery Info:</h1>");

    batteryInfo.sort((a,b) => {
        if (a.state == "InGame") return -1;
        if (b.state == "InGame") return 1;
        if (a.state == "Idle") return 1;
        if (b.state == "Idle") return -1;
        return a.time-b.time;
    })

    let firstCharging = null;

    for (i = 0; i < batteryInfo.length; i++) {
        if (batteryInfo[i].state == "InGame") batteryInfo[i].state = "In Game";
        if (batteryInfo[i].state == "Charging" && firstCharging == null) firstCharging = batteryInfo[i].id;

        // console.log(firstCharging == batteryInfo[i].id)

        $("batteries").append(`
            <div class="battery" 
            ${firstCharging == batteryInfo[i].id ? "style='background-color: #1D970F'" : ""}
            ${batteryInfo[i].state == "In Game" ? "style='background-color: #0F8597;'" : ""}
            ${batteryInfo[i].state == "Idle" ? "style='background-color: #73643d;'" : ""}
            >
                <h3>${batteryInfo[i].name}</h3>
                <b>
                    <span style="font-style: italic;">${batteryInfo[i].state}</span> for <span style="font-style: italic;">${Math.round((new Date().getTime() - new Date(batteryInfo[i].time))/1000/60)}mins</span>
                </b>
                <br>
                <button onclick="changeBatteryState(${batteryInfo[i].id})">Set state to:</button>
                <select id="state-${batteryInfo[i].id}">
                    <option value="0">Charging</option>
                    <option value="1">In Game</option>
                    <option value="2">Idle</option>
                </select>
            </div>    
        `)
    }

}

setTimeout(reloadBatteryInfo, 1000)

let reloadCount = 0;

setInterval(() => {
    reloadCount++
    reloadBatteryInfo(reloadCount % 10 == 0)
}, 1000)

async function getMatches() {
    
    let matches = await TBHAPI(`/event/${EVENT_KEY}/matches`)

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

async function reload() {
    $('#table').html('')
    $("#rankings").html("")
    let allMatches = await getMatches()
    let matches = allMatches.upcoming
    let past = allMatches.past
    let status = await TBHAPI(`/event/${EVENT_KEY}/teams/statuses`)
    status = status.frc1648
    let rankings = await TBHAPI(`/event/${EVENT_KEY}/rankings`)
    rankings = rankings.rankings
    let epa = STATBOTICS().then(epa => {
        $("#total-epa").text(epa?.total_points)
        $("#auton-epa").text(epa?.auto_points)
        $("#teleop-epa").text(epa?.teleop_points)
        $("#endgame-epa").text(epa?.endgame_points)
    })
   
    $("#our-rank").text(status?.qual?.ranking?.rank)
    $("#our-wlt").text(`${status?.qual?.ranking?.record?.wins}-${status?.qual?.ranking?.record?.losses}-${status?.qual?.ranking?.record?.ties}`)
    


    for (i = 0; i<rankings?.length; i++) {
        $("#rankings").append(`<p class="rankings" ${rankings[i].team_key.substring(3) == "1648" ? 'style="font-weight:bold"': ''}>
            #${i+1}: ${rankings[i].team_key.substring(3)} - ${rankings[i].extra_stats[0]} RP
        </p>`)
    }

    $('#table').append(`
        <thead class="top" style="position:sticky; top: 0; font-weight: 700;">
            <td style="width: 100px;">
                Number
            </td>
            <td style="width: 100px;">
                Time
            </td>
            <td class="table-primary">
                Blue 1
            </td>
            <td class="table-primary">
                Blue 2
            </td>
            <td class="table-primary">
                Blue 3
            </td>
            <td class="table-danger">
                Red 1
            </td>
            <td class="table-danger">
                Red 2
            </td>
            <td class="table-danger">
                Red 3
            </td>
        </thead>
        <tbody>`
    )

    for (i = 0; i < matches?.length; i++) {
        let toAppend = "";

        const time = new Date(matches[i].predicted_time * 1000)
        let weekday= ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        let day = weekday[time.getDay()]
        let hour;
        if (time.getHours() > 12) {hour = time.getHours() - 12} else {hour = time.getHours()}
        let minutes;
        if (time.getMinutes() < 10) {minutes = "0" + time.getMinutes()} else {minutes = time.getMinutes()}
        const formattedTime = day+" "+hour+":"+minutes

        const blueStart = matches[i].alliances.blue.team_keys
        const redStart = matches[i].alliances.red.team_keys

        let blue = []; let red = [];
        blue.push(blueStart[0].substring(3))
        blue.push(blueStart[1].substring(3))
        blue.push(blueStart[2].substring(3))
        red.push(redStart[0].substring(3))
        red.push(redStart[1].substring(3))
        red.push(redStart[2].substring(3))
        
        toAppend += (
            `<tr 
                ${blue.includes("1648") ? 'class="table-primary"' : (red.includes("1648") ? 'class="table-danger"' : "")}
                ${(blue.includes("1648") || red.includes("1648")) ? 'style="border-width:3px;"' : "" }
            >

                <td>
                    ${matches[i].match_number}
                </td>
                <td>
                    ${formattedTime}
                </td>
                <td ${(blue[0] == "1648") ? 'style="font-weight: bold;"' : ""}>
                    ${blue[0]}
                </td>
                <td ${(blue[1] == "1648") ? 'style="font-weight: bold;"' : ""}>
                    ${blue[1]}
                </td>
                <td ${(blue[2] == "1648") ? 'style="font-weight: bold;"' : ""}>
                    ${blue[2]}
                </td>
                <td ${(red[0] == "1648") ? 'style="font-weight: bold;"' : ""}>
                    ${red[0]}
                </td>
                <td ${(red[1] == "1648") ? 'style="font-weight: bold;"' : ""}>
                    ${red[1]}
                </td>
                <td ${(red[2] == "1648") ? 'style="font-weight: bold;"' : ""}>
                    ${red[2]}
                </td>
            </tr>`
        )

        $('#table').append(toAppend)
    }

    $('#table tbody').append(`
        <tr>
            <td colspan="8" style="text-align: center;" class="table-warning">
                PAST MATCHES
            </td>
        </tr>
    `)

    console.log(past?.length)

    for (i = 0; i < past?.length; i++) {
        
        const blueStart = past[i].alliances.blue.team_keys
        const redStart = past[i].alliances.red.team_keys
        const blueScore = past[i].score_breakdown.blue
        const redScore = past[i].score_breakdown.red 
        
        let toAppend = "";

        let blue = []; let red = [];
        blue.push(blueStart[0].substring(3))
        blue.push(blueStart[1].substring(3))
        blue.push(blueStart[2].substring(3))
        red.push(redStart[0].substring(3))
        red.push(redStart[1].substring(3))
        red.push(redStart[2].substring(3))

        const time = new Date(past[i].actual_time * 1000)
        let weekday= ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        let day = weekday[time.getDay()]
        let hour;
        if (time.getHours() > 12) {hour = time.getHours() - 12} else {hour = time.getHours()}
        let minutes;
        if (time.getMinutes() < 10) {minutes = "0" + time.getMinutes()} else {minutes = time.getMinutes()}
        const formattedTime = `${day} ${hour}:${minutes}` 

        toAppend += (
            `<tr class="pastMatchRow" 
            ${blue.includes("1648") ? 'class="table-primary"' : (red.includes("1648") ? 'class="table-danger"' : "")}
            ${(blue.includes("1648") || red.includes("1648")) ? 'style="border-width:3px;"' : "" }
            >

                <td >
                    ${ past[i].match_number }
                </td>          
                <td ${blue.includes("1648") ? 'class="table-primary"' : (red.includes("1648") ? 'class="table-danger"' : "")}>
                    ${ formattedTime }
                </td>
                <td ${(blue[0] == "1648") ? 'style="font-weight: bold;"' : ""} ${(blueScore.totalPoints > redScore.totalPoints) ? 'class="table-success"' : '' } >
                    ${ blue[0] }
                </td>
                <td ${(blue[1] == "1648") ? 'style="font-weight: bold;"' : ""} ${(blueScore.totalPoints > redScore.totalPoints) ? 'class="table-success"' : '' } >
                    ${ blue[1] }
                </td>
                <td ${(blue[2] == "1648") ? 'style="font-weight: bold;"' : ""} ${(blueScore.totalPoints > redScore.totalPoints) ? 'class="table-success"' : '' } >
                    ${ blue[2] }
                </td>
                <td ${(red[0] == "1648") ? 'style="font-weight: bold;"' : ""} ${(redScore.totalPoints > blueScore.totalPoints) ? 'class="table-success"' : '' } >
                    ${ red[0] }
                </td>
                <td ${(red[1] == "1648") ? 'style="font-weight: bold;"' : ""} ${(redScore.totalPoints > blueScore.totalPoints) ? 'class="table-success"' : '' } >
                    ${ red[1] }
                </td>
                <td ${(red[2] == "1648") ? 'style="font-weight: bold;"' : ""} ${(redScore.totalPoints > blueScore.totalPoints) ? 'class="table-success"' : '' } >
                    ${ red[2] }
                </td>
            </tr>
            <tr style="display: none;" class="no-hover-effect">
                <td colspan="2">
                    Info:
                </td>
                <td colspan="3">
                    Total Points: ${ blueScore.totalPoints }<br>
                    Teleop Points: ${ blueScore.teleopPoints - blueScore.endGameBargePoints }<br>
                    Endgame Points: ${ blueScore.endGameBargePoints }<br>
                    Auton Points: ${ blueScore.autoPoints }
                </td>
                <td colspan="3">
                    Total Points: ${ redScore.totalPoints }<br>
                    Teleop Points: ${ redScore.teleopPoints - redScore.endGameBargePoints }<br>
                    Endgame Points: ${ redScore.endGameBargePoints }<br>
                    Auton Points: ${ redScore.autoPoints }
                </td>
            </tr>`
        )

        $('#table').append(toAppend)
    }

    $('#table').append('</tbody>')

    $('.pastMatchRow').off()
    $('.pastMatchRow').on('click', function() {
        $(this).next().slideToggle(0)
    })
    
}

$(document).on('ready', () => {
    $('#fs-c, #fs-o').on('click', function() {
        toggleFullscreen()
    })

    $("#rpl").on('click', function() {
        reload()
    })
})

async function postData(data) {
    return fetch("/", {
        method: "POST", 
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(res => res.json()).then(data => {
        return data.res
    });
}

function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen()
    } else {
        document.documentElement.requestFullscreen();
    }
};

reload()

setInterval(function(){
    reload()
}, (30 * 1000))