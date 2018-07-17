"use strict";
const appData = data;
let teams = [], rastit = [];
class OrienteeringApplication {
    static main() {
        OrienteeringApplication.loadData();
        leafMap.init();
        UIhandlers.loadTeams();
        mapHandlers.addRastitToMap(teams[0]);
        UIhandlers.setMapDrop();
        UIhandlers.additionalUIeffects();
    }
    static loadData() {
        for (let i = 0; i < appData.joukkueet.length; i++) {
            let e = appData.joukkueet[i];
            const leimaukset = e.rastit.map((l) => new Leimaus(l.aika, l.id));
            teams.push(new Joukkue(e.nimi, e.id, util.rainbow(appData.joukkueet.length, i), leimaukset));
        }
        rastit = appData.rastit.map((e) => new Rasti(e.lon, e.lat, e.koodi, e.id));
    }
}
class leafMap {
    static init() {
        L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
            maxZoom: 18,
            id: "mapbox.streets",
            accessToken: "your.mapbox.access.token"
        }).addTo(leafMap.view);
    }
}
leafMap.view = L.map("orienteeringMap").setView([62.133029, 25.737019], 13);
class UIhandlers {
    static loadTeams() {
        const teamContainer = document.getElementById("joukkueet");
        teams.forEach(e => {
            teamContainer.appendChild(Paper.teamListing(e));
        });
    }
    static additionalUIeffects() {
        const hide = document.getElementById("showmore");
        hide.addEventListener("click", e => {
            const text = document.getElementById("showmore-text");
            text.textContent = (UIhandlers.listVisible ? "Näytä" : "Piilota") + " joukkuelistaus";
            UIhandlers.listVisible = !UIhandlers.listVisible;
        });
    }
    static dragover(e) {
        e.preventDefault();
    }
    static dragenter(e) {
        e.preventDefault();
    }
    static drop() {
        console.log(":)");
    }
    static dragstart_handler(e) {
        console.log("dragStart");
        // Add the target element's id to the data transfer object
        e.dataTransfer.setData("text/plain", e.target.id);
    }
    static setMapDrop() {
        const map = document.getElementById("mapContainer");
        map.addEventListener("dragover", function (e) {
            e.preventDefault();
            this.className = "over";
            e.dataTransfer.dropEffect = "move";
            return false;
        });
        map.addEventListener("drop", function (e) {
            if (e.stopPropagation)
                e.stopPropagation();
            e.preventDefault();
            const el = document.getElementById(e.dataTransfer.getData("Text")), teamID = e.dataTransfer.getData("Text"), team = teams.find(e => e.id === parseInt(teamID)), kartalla = document.getElementById("kartalla");
            el.parentNode.removeChild(el);
            kartalla.appendChild(el);
            mapHandlers.getTeamRoute(team);
        });
    }
}
UIhandlers.listVisible = true;
class mapHandlers {
    static addRastitToMap(team) {
        rastit.forEach(e => {
            const leimaus = L.circle([e.lat, e.lon], {
                color: "red",
                fillOpacity: 0.5,
                radius: 150
            }).addTo(leafMap.view);
            leimaus.bindPopup(`Rasti ${e.koodi}`);
        });
    }
    static getTeamRoute(team) {
        const teamRastit = team.leimaukset.map(e => util.getMatchingRasti(e.id));
        const coords = teamRastit.map(e => {
            return [e.lat, e.lon];
        });
        const viiva = L.polyline(coords, { color: team.color }).addTo(leafMap.view);
        viiva.bindPopup(`Joukkueen ${team.nimi} käymä reitti`);
    }
}
class util {
    static rainbow(numOfSteps, step) {
        // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
        // Adam Cole, 2011-Sept-14
        // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
        let r = 0, g = 0, b = 0;
        const h = step / numOfSteps;
        let i = ~~(h * 6);
        let f = h * 6 - i;
        let q = 1 - f;
        switch (i % 6) {
            case 0:
                r = 1;
                g = f;
                b = 0;
                break;
            case 1:
                r = q;
                g = 1;
                b = 0;
                break;
            case 2:
                r = 0;
                g = 1;
                b = f;
                break;
            case 3:
                r = 0;
                g = q;
                b = 1;
                break;
            case 4:
                r = f;
                g = 0;
                b = 1;
                break;
            case 5:
                r = 1;
                g = 0;
                b = q;
                break;
        }
        let c = "#" +
            ("00" + (~~(r * 255)).toString(16)).slice(-2) +
            ("00" + (~~(g * 255)).toString(16)).slice(-2) +
            ("00" + (~~(b * 255)).toString(16)).slice(-2);
        return c;
    }
    static getMatka(team) {
        let matka = 0;
        const kaydytRastit = team.leimaukset;
        for (let i = 0; i < kaydytRastit.length - 1; i++) {
            let rasti1 = util.getMatchingRasti(kaydytRastit[i].id);
            let rasti2 = util.getMatchingRasti(kaydytRastit[i + 1].id);
            try {
                matka += util.getDistanceFromLatLonInKm(rasti1.lat, rasti1.lon, rasti2.lat, rasti2.lon);
            }
            catch (err) { }
        }
        return Math.floor(matka);
    }
    /**
     * Return distance between two points
     * @param lat1 - Latitude, point 1
     * @param lon1 - Longitude, point 1
     * @param lat2 - Latitude, point 2
     * @param lon2 - Longitude, point 2
     * @returns {number} - The distance traveled
     */
    static getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        let R = 6371; // Radius of the earth in km
        let dLat = util.deg2rad(lat2 - lat1); // deg2rad below
        let dLon = util.deg2rad(lon2 - lon1);
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(util.deg2rad(lat1)) * Math.cos(util.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c; // Distance in km
        return d;
    }
    static deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    static getKaydytRastit(team) {
        return rastit.filter((p) => p.id === team.id);
    }
    static getMatchingRasti(rastiID) {
        return rastit.find((r) => r.id == rastiID);
    }
}
class Paper {
    static teamListing(team) {
        const frag = document.createDocumentFragment(), container = document.createElement("div"), containerInner = document.createElement("div"), teamColor = document.createElement("div"), teamName = document.createElement("div"), teamTravel = document.createElement("div"), teamTextContainer = document.createElement("div");
        teamColor.style.background = team.color;
        teamName.textContent = team.nimi;
        teamTravel.textContent = "Kuljettu matka: ";
        containerInner.appendChild(teamColor);
        containerInner.appendChild(teamTextContainer);
        teamTextContainer.appendChild(teamName);
        teamTextContainer.appendChild(teamTravel);
        teamName.classList.add("teamnode-text");
        teamColor.classList.add("teamnode-color");
        teamTravel.classList.add("teamnode-text-minor");
        container.classList.add("teamnode-container");
        containerInner.classList.add("teamnode-container-inner");
        teamTextContainer.classList.add("teamnode-container-text");
        container.setAttribute("id", team.id.toString());
        container.appendChild(containerInner);
        container.setAttribute("draggable", "true");
        container.addEventListener("dragstart", UIhandlers.dragstart_handler);
        container.addEventListener("drop", UIhandlers.drop);
        frag.appendChild(container);
        return frag;
    }
}
class Joukkue {
    constructor(nimi, id, color, leimaukset) {
        this.nimi = nimi;
        this.leimaukset = leimaukset;
        this.color = color;
        this.id = parseInt(id.toString());
    }
}
class Leimaus {
    constructor(aika, id) {
        this.aika = Date.parse(aika);
        this.id = parseInt(id.toString());
    }
}
class Rasti {
    constructor(lon, lat, koodi, id) {
        this.lon = parseFloat(lon);
        this.lat = parseFloat(lat);
        this.koodi = koodi;
        this.id = id;
    }
}
window.onload = () => OrienteeringApplication.main();
