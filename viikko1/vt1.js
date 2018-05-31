"use strict";

const dataSet = data;

let rastit = getRastit();
let joukkueet = getJoukkueet();

function lisaaJoukkue(team, sarjaNimi) {
    for (let sarja of dataSet.sarjat) {
        if (sarja.nimi === sarjaNimi) {
            joukkueet.push(team);
        }
    }
}

function printEvenTeamsCheckpoints() {
    let usefulString = "";
    for (let i = 0; i < dataSet.rastit.length - 1; i++) {
        if (hasNumber(dataSet.rastit[i].koodi)) {
            usefulString += dataSet.rastit[i].koodi + ";";
        }
    }
    usefulString += dataSet.rastit[dataSet.rastit.length - 1].koodi;
    console.log(usefulString);
}

function getKaydytRastitID(team) {
    return dataSet.tupa.filter(p => p.joukkue === team.id).map(x => x.rasti);
}

function getKaydytRastit(team) {
    return dataSet.tupa.filter(p => p.joukkue === team.id);
}

function getUnique(arr) {
    return arr.filter(returnUniqueValues);
}

function returnUniqueValues(value, index, self) {
    return self.indexOf(value) === index;
}

function parseArrayToInt(arr) {
    return arr.filter(function (x) {
        return /^\d/.test(x)
    }).map(x => parseInt(x));
}

function getRastit() {
    return dataSet.rastit.map(x => x);
}

function getJoukkueet() {
    let arr = [];
    for (let i = 0; i < dataSet.sarjat.length; i++) {
        for (let j = 0; j < dataSet.sarjat[i].joukkueet.length; j++) {
            arr.push(dataSet.sarjat[i].joukkueet[j]);
        }
    }
    return arr;
}

function getKoodit(rastiArr) {
    return rastit.filter(function (e) {
        return rastiArr.indexOf(e.id.toString()) > -1;
    }).map(x => x.koodi);
}

function getFirstNumber(arr) {
    return arr.map(x => parseInt(x.toString()[0]));
}

function arrayElementsToString(arr) {
    return arr.map(x => x.toString());
}

function getPoints(team) {
    const kaydytRastit = getUnique(getKaydytRastitID(team).sort());
    let pisterastit = getKoodit(arrayElementsToString(kaydytRastit)).sort();
    let pisteet = eval(getFirstNumber(parseArrayToInt(pisterastit)).join('+'));
    team.pisteet = pisteet !== undefined ? pisteet : 0;
}


function hasNumber(myString) {
    return /^\d/.test(myString);
}

function Joukkue(nimi, last, jasenet, id) {
    this.nimi = nimi;
    this.last = last;
    this.jasenet = jasenet;
    this.id = id;
}

function removeTeam(team) {
    joukkueet = joukkueet.filter(x => x.nimi !== team);
}

function getMatchingRasti(rastiID) {
    return rastit.filter(rasti => rasti.id == rastiID)[0];
}

function getMatka(team) {
    let matka = 0;
    const kaydytRastit = getKaydytRastit(team).filter(function (rasti) {
        return (rasti.aika !== "");
    });
    for (let i = 0; i < kaydytRastit.length - 1; i++) {
        let rasti1 = getMatchingRasti(kaydytRastit[i].rasti);
        let rasti2 = getMatchingRasti(kaydytRastit[i + 1].rasti);
        try {
            matka += getDistanceFromLatLonInKm(rasti1.lat, rasti1.lon, rasti2.lat, rasti2.lon);
        } catch (err) {
        }
    }
    team.matka = Math.floor(matka);
}

function getAika(team) {
    const kaydytRastit = getKaydytRastit(team).filter(function (rasti) {
        return (rasti.aika !== "");
    });
    const ekaRasti = kaydytRastit.shift();
    if (ekaRasti === undefined) return;
    const maaliaika = Date.parse(team.last);
    const lahtoaika = Date.parse(ekaRasti.aika);
    const aika = new Date((maaliaika - lahtoaika) * 1000);
    const hours = aika.getHours();
    const min = aika.getMinutes();
    const sec = aika.getSeconds();
    return `${hours}:${min}:${sec}`;
}

function printTeams(tulostaPisteet, jarjesta, tulostaMatka) {
    if (jarjesta) {
        joukkueet.sort(
            function (a, b) {
                if (a.pisteet !== b.pisteet) {
                    return b.pisteet - a.pisteet;
                }
                return a.pisteet > b.pisteet ? 1 : -1;
            }
        );
    }
    for (let joukkue of joukkueet) {
        getPoints(joukkue);
        getMatka(joukkue);
        joukkue.aika = getAika(joukkue);
        let printString = joukkue.nimi;
        if (tulostaPisteet) {
            printString += ` (${joukkue.pisteet} p)`;
        }
        if (tulostaMatka) {
            printString += `, ${joukkue.pisteet} p, ${joukkue.matka} km, ${joukkue.aika !== undefined ? joukkue.aika : "00:00:00"}`;
        }
        console.log(printString);
    }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    let R = 6371; // Radius of the earth in km
    let dLat = deg2rad(lat2 - lat1);  // deg2rad below
    let dLon = deg2rad(lon2 - lon1);
    let a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

let joukkue = new Joukkue("Mallijoukkue", "2017-09-01 10:00:00", ["Tommi Lahtonen", "Matti Meikalainen"], 9999);

lisaaJoukkue(joukkue, "4h");
printTeams(false, false, false);
printEvenTeamsCheckpoints();
removeTeam("Vara 1");
removeTeam("Vara 2");
removeTeam("Vapaat");
printTeams(true, true, false);
printTeams(false, true, true);