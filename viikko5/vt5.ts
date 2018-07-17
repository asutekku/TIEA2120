"use strict";

const appData: any = data!;

let teams: Joukkue[] = [],
    rastit: Rasti[] = [],
    karttaRastit: L.Circle[] = [],
    reitit: L.Polyline[] = [];

class OrienteeringApplication {
    public static main(): void {
        OrienteeringApplication.loadData();
        leafMap.init();
        UIhandlers.setMapDrop();
        UIhandlers.additionalUIeffects();
        UIhandlers.loadTeams();
        mapHandlers.addRastitToMap();
        UIhandlers.setView();
    }

    static loadData(): void {
        rastit = appData.rastit.map((e: any) => new Rasti(e.lon, e.lat, e.koodi, e.id));
        for (let i = 0; i < appData.joukkueet.length; i++) {
            let e = appData.joukkueet[i];
            const leimaukset: Leimaus[] = e.rastit.map((l: any) => new Leimaus(l.aika, l.id)),
                team = new Joukkue(e.nimi, e.id, util.rainbow(appData.joukkueet.length, i), leimaukset);
            teams.push(team);
        }
    }
}

class leafMap {
    static map = L.map("orienteeringMap").setView([62.133029, 25.737019], 13);

    static init(): void {
        L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
            maxZoom: 16,
            minZoom: 12
        }).addTo(leafMap.map);
    }
}

class UIhandlers {
    static listVisible = true;

    static loadTeams(): void {
        const teamContainer = document.getElementById("joukkueet")!;
        teams.forEach(e => {
            teamContainer.appendChild(Paper.teamListing(e));
        });
    }

    static setView(): void {
        leafMap.map.fitBounds(util.getCorners());
    }

    static additionalUIeffects(): void {
        const hide = document.getElementById("showmore")!;
        hide.addEventListener("click", e => {
            const cont = document.getElementById("teamContainer")!;
            const text = document.getElementById("showmore-text")!;
            text.textContent = (UIhandlers.listVisible ? "Näytä" : "Piilota") + " joukkuelistaus";
            if (UIhandlers.listVisible) {
                cont.classList.add("animationHide");
                cont.classList.remove("animationShow");
                setTimeout(function () {
                    cont.classList.add("hide");
                }, 900);
            } else {
                cont.classList.remove("animationHide");
                cont.classList.add("animationShow");
                cont.classList.remove("hide");
            }
            UIhandlers.listVisible = !UIhandlers.listVisible;
        });
    }

    static dragover(e: Event) {
        e.preventDefault();
    }

    static dragenter(e: Event) {
        e.preventDefault();
    }

    static drop(e: any) {
    }

    static dragstart_handler(e: any) {
        e.dataTransfer.setData("text/plain", e.target.id);
    }

    static setMapDrop(): void {
        const map = document.getElementById("mapContainer")!;
        const teamsDOM = document.getElementById("joukkueet")!;
        const onMapDOM = document.getElementById("kartalla")!;
        map.addEventListener("dragover", function (e) {
            e.preventDefault();
            this.className = "over";
            e.dataTransfer.dropEffect = "move";
            return false;
        });
        map.addEventListener("drop", function (e) {
            if (e.stopPropagation) e.stopPropagation();
            e.preventDefault();
            const el = document.getElementById(e.dataTransfer.getData("Text"))!,
                teamID = e.dataTransfer.getData("Text"),
                team = teams.find(e => e.id === parseInt(teamID))!;
            el.parentNode!.removeChild(el);
            onMapDOM.insertBefore(el, onMapDOM.firstChild);
            if (team.reitti) {
                leafMap.map.removeLayer(team.reitti);
                team.reitti = undefined;
                mapHandlers.getTeamRoute(team);
            } else {
                mapHandlers.getTeamRoute(team);
            }
        });
        teamsDOM.addEventListener("dragover", function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            return false;
        });
        teamsDOM.addEventListener("drop", function (e) {
            if (e.stopPropagation) e.stopPropagation();
            e.preventDefault();
            const el = document.getElementById(e.dataTransfer.getData("Text"))!,
                teamID = e.dataTransfer.getData("Text"),
                team = teams.find(e => e.id === parseInt(teamID))!;
            el.parentNode!.removeChild(el);
            teamsDOM.appendChild(el);
            mapHandlers.setRastiColours(team.reitti, "red");
            leafMap.map.removeLayer(team.reitti);
        });
        onMapDOM.addEventListener("dragover", function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            return false;
        });
        onMapDOM.addEventListener("drop", function (e) {
            if (e.stopPropagation) e.stopPropagation();
            e.preventDefault();
            const el = document.getElementById(e.dataTransfer.getData("Text"))!,
                teamID = e.dataTransfer.getData("Text"),
                team = teams.find(e => e.id === parseInt(teamID))!;
            onMapDOM.insertBefore(el, onMapDOM.firstChild);
            if (team.reitti) {
                leafMap.map.removeLayer(team.reitti);
                team.reitti = undefined;
                mapHandlers.getTeamRoute(team);
            } else {
                mapHandlers.getTeamRoute(team);
            }
        });
    }
}

class mapHandlers {
    static addRastitToMap(): void {
        rastit.forEach(e => {
            const leimaus = L.circle([e.lat, e.lon], {
                color: "red",
                fillOpacity: 0.5,
                radius: 150
            }).addTo(leafMap.map);
            karttaRastit.push(leimaus);
            leimaus.bindPopup(`Rasti ${e.koodi}`);
        });
    }

    static setRastiColours(reitti: L.Polyline, color: string): void {
        const lats: any[] = reitti.getLatLngs();
        const kaydyt = lats.map(e => {
            const rasti: L.Circle = karttaRastit.find((l: L.Circle) => {
                const rastilat = l.getLatLng();
                return rastilat.lat === e.lat;
            })!;
            return rasti;
        });
        kaydyt.forEach(e => {
            e.setStyle({color: color});
        });
    }

    static getTeamRoute(team: Joukkue) {
        const teamRastit = team.leimaukset.map(e => util.getMatchingRasti(e.id));
        const coords: any = teamRastit.map(e => {
            return [e!.lat, e!.lon];
        });
        const reitti: L.Polyline = L.polyline(coords, {color: team.color})!;
        leafMap.map.addLayer(reitti);
        team.reitti = reitti;
        reitit.push(reitti);
        mapHandlers.setRastiColours(reitti, team.color);
        reitti.bindPopup(`Joukkueen ${team.nimi} käymä reitti`);
    }
}

class util {
    static rainbow(numOfSteps: number, step: number): string {
        // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
        // Adam Cole, 2011-Sept-14
        // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
        let r: number = 0,
            g: number = 0,
            b: number = 0;
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
        return (
            "#" +
            ("00" + (~~(r * 255)).toString(16)).slice(-2) +
            ("00" + (~~(g * 255)).toString(16)).slice(-2) +
            ("00" + (~~(b * 255)).toString(16)).slice(-2)
        );
    }

    static getMatka(leimaukset: Leimaus[]) {
        let matka = 0;
        for (let i = 0; i < leimaukset.length - 1; i++) {
            let rasti1 = util.getMatchingRasti(leimaukset[i].id);
            let rasti2 = util.getMatchingRasti(leimaukset[i + 1].id);
            try {
                matka += util.getDistanceFromLatLonInKm(rasti1!.lat, rasti1!.lon, rasti2!.lat, rasti2!.lon);
            } catch (err) {
            }
        }
        return Math.round(matka * 10) / 10;
    }

    static getCorners() {
        let tr: number[], bl: number[];
        const cords = karttaRastit.map(e => {
            const c = e.getLatLng();
            return [c.lat, c.lng];
        });
        tr = cords[0];
        bl = cords[0];
        cords.forEach(e => {
            if (e[0] > bl[0] && e[1] > bl[1]) bl = e;
            if (e[0] < tr[0] && e[1] < tr[1]) tr = e;
        });
        const c1 = L.latLng(tr[0], tr[1]);
        const c2 = L.latLng(bl[0], bl[1]);
        return L.latLngBounds(c1, c2);
    }

    /**
     * Return distance between two points
     * @param lat1 - Latitude, point 1
     * @param lon1 - Longitude, point 1
     * @param lat2 - Latitude, point 2
     * @param lon2 - Longitude, point 2
     * @returns {number} - The distance traveled
     */
    static getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
        let R = 6371; // Radius of the earth in km
        let dLat = util.deg2rad(lat2 - lat1); // deg2rad below
        let dLon = util.deg2rad(lon2 - lon1);
        let a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(util.deg2rad(lat1)) * Math.cos(util.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c; // Distance in km
        return d;
    }

    static deg2rad(deg: number) {
        return deg * (Math.PI / 180);
    }

    static getKaydytRastit(team: Joukkue): Rasti[] {
        return rastit.filter((p: Rasti) => p.id === team.id);
    }

    static getMatchingRasti(rastiID: number): Rasti | undefined {
        return rastit.find((r: Rasti) => {
            return r.id === rastiID;
        });
    }
}

class Paper {
    static teamListing(team: Joukkue): DocumentFragment {
        const frag = document.createDocumentFragment(),
            container = document.createElement("div"),
            containerInner = document.createElement("div"),
            teamColor = document.createElement("div"),
            teamName = document.createElement("div"),
            teamTravel = document.createElement("div"),
            teamTextContainer = document.createElement("div");
        teamColor.style.background = team.color;
        teamName.textContent = team.nimi;
        teamTravel.textContent = `Kuljettu matka: ${team.matka}km`;
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
        frag.appendChild(container);
        return frag;
    }
}

class Joukkue {
    nimi: string;
    leimaukset: Leimaus[];
    id: number;
    color: string;
    reitti: any;
    matka: number;

    constructor(nimi: string, id: string, color: string, leimaukset: Leimaus[]) {
        this.nimi = nimi;
        this.leimaukset = leimaukset;
        this.color = color;
        this.id = parseInt(id.toString());
        this.matka = util.getMatka(this.leimaukset);
    }
}

class Leimaus {
    aika: number;
    id: number;

    constructor(aika: string, id: string) {
        this.aika = Date.parse(aika);
        this.id = parseInt(id.toString());
    }
}

class Rasti {
    lon: number;
    lat: number;
    koodi: string;
    id: number;

    constructor(lon: string, lat: string, koodi: string, id: number) {
        this.lon = parseFloat(lon);
        this.lat = parseFloat(lat);
        this.koodi = koodi;
        this.id = id;
    }
}

window.onload = () => OrienteeringApplication.main();
