"use strict";

function getJoukkueet() {
    let arr = [];
    for (let i = 0; i < data.sarjat.length; i++) {
        for (let j = 0; j < data.sarjat[i].joukkueet.length; j++) {
            arr.push([data.sarjat[i].nimi, data.sarjat[i].joukkueet[j].nimi]);
        }
    }
    return arr;
}

function createElement(arr) {
    let joukkueet = sortByColumn(arr, 1);
    joukkueet = sortByColumn(joukkueet, 0);
    let tulosTable = document.createElement("table");
    let tulosCaption = document.createElement("caption");
    let firstRow = document.createElement("tr");
    firstRow.innerHTML = "<th>Joukkue</th><th>Sarja</th>";
    tulosCaption.innerHTML = "Tulokset";
    tulosTable.appendChild(tulosCaption);
    tulosTable.appendChild(firstRow);
    document.getElementById("tupa").appendChild(tulosTable);
    for (let joukkue of joukkueet) {
        let jasenString = joukkue.jasenet.join(', ');
        let joukkue = document
        let row = createRow(`<td>${joukkue[0]}</td><td>${joukkue[1]}</td>`);
        tulosTable.appendChild(row);
    }
}

function createElement(type:string,inner){
    let element = document.createElement(type);
}

function teamRow(team){
    let jasenString = "";
    for (let jasen of team){
        jasenString+=jasen.
    }
    return createRow(`<td>${team[0]}</td><td>${team[1]}</td>`);
}

function PrintTeams(teams){
    for (let team of teams) {

        let row = createRow(`<td>${team[0]}</td><td>${team[1]}</td>`);
        tulosTable.appendChild(teamRow(team);
    }
    return row;
}

function sortByColumn(a, i) {
    a.sort((a, b) => a[i].localeCompare(b[i]));
    //a.sort(function (a, b) {return a[i] === b[i] ? 0 : (a[i] < b[i]) ? -1 : 1;});
    return a;
}

function createRow(data) {
    let row = document.createElement("tr");
    row.innerHTML = data;
    return row;
}

function main() {
    createElement(getJoukkueet());
}

window.onload = function () {
    main();
}
