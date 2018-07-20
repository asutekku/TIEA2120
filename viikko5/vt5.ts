"use strict";

// tslint:disable-next-line
const appData: any = data;

let teams: Joukkue[] = [],
    rastit: Rasti[] = [],
    karttaRastit: L.Circle[] = [],
    reitit: L.Polyline[] = [],
    teamsOnMap: Joukkue[] = [],
    selected: L.Circle,
    selectionMarker: L.Marker,
    rastiMarkers: L.Marker[] = [];

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
                setTimeout(function() {
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

    static joukkuuetOnList(): number {
        return document.getElementById("joukkueet")!.childElementCount;
    }

    static dragover(e: Event) {
        e.preventDefault();
    }

    static dragenter(e: Event) {
        e.preventDefault();
    }

    static leimausDragEnter(e: any) {
        e.preventDefault();
        const target: HTMLElement = e.target;
        try {
            target.classList.add("bottomLine");
        } catch (e) {
            //It's the text part but I don't want console warnings
        }
    }

    static leimausDragExit(e: any) {
        e.preventDefault();
        const target: HTMLElement = e.target;
        try {
            target.classList.remove("bottomLine");
        } catch (e) {
            //It's the text part but I don't want console warnings
        }
    }

    static drop(e: any) {}

    static leimausDrop(e: any) {
        if (e.stopPropagation) e.stopPropagation();
        e.preventDefault();
        const el = document.getElementById(e.dataTransfer.getData("Text"))!,
            teamID: string = e.dataTransfer
                .getData("Text")
                .split("_")[0]
                .split(":")[1],
            rastiID: number = parseInt(
                e.dataTransfer
                    .getData("Text")
                    .split("_")[1]
                    .split(":")[1]
            );
        const team: Joukkue = teams.find(e => e.id === parseInt(teamID))!,
            target: HTMLElement = e.target,
            parent = document.getElementById(team.id + "_onMapList")!,
            oldIndex = team.leimaukset.indexOf(
                team.leimaukset.find(e => {
                    return e.id === rastiID;
                })!
            );
        try {
            parent.insertBefore(el, target);
        } catch (e) {
            //Do not try to add the rasti to a wrong team
        }
        const newIndex = [...el.parentNode!.children].indexOf(el);
        const leimaus = team.leimaukset[oldIndex];
        team.leimaukset.splice(oldIndex, 1);
        team.leimaukset.splice(newIndex, 0, leimaus);
        UIhandlers.drawReitti(team);
        target.classList.remove("bottomLine");
        team.updateMatka();
    }

    static dragstart_handler(e: any) {
        e.dataTransfer.setData("text/plain", e.target.id);
    }

    static drawReitti(team: Joukkue) {
        if (team.reitti) {
            leafMap.map.removeLayer(team.reitti);
            team.reitti = undefined;
            mapHandlers.getTeamRoute(team);
        } else {
            mapHandlers.getTeamRoute(team);
        }
    }

    static setMapDrop(): void {
        const map = document.getElementById("mapContainer")!;
        const teamsDOM = document.getElementById("joukkueet")!;
        const onMapDOM = document.getElementById("kartalla")!;
        map.addEventListener("dragover", function(e) {
            e.preventDefault();
            this.className = "over";
            e.dataTransfer.dropEffect = "move";
            return false;
        });
        map.addEventListener("drop", function(e) {
            if (e.stopPropagation) e.stopPropagation();
            e.preventDefault();
            const el = document.getElementById(e.dataTransfer.getData("Text"))!,
                teamID = e.dataTransfer.getData("Text"),
                team = teams.find(e => e.id === parseInt(teamID))!;
            if (team) {
                const detailDom = Paper.teamListingOnMap(team);
                el.parentNode!.removeChild(el);
                onMapDOM.insertBefore(detailDom, onMapDOM.firstChild);
                UIhandlers.drawReitti(team);
                if (UIhandlers.joukkuuetOnList() <= 1) {
                    document.getElementById("joukkueet-empty")!.classList.remove("hide");
                }
            }
        });
        teamsDOM.addEventListener("dragover", function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            return false;
        });
        teamsDOM.addEventListener("drop", function(e) {
            if (e.stopPropagation) e.stopPropagation();
            e.preventDefault();
            const el = document.getElementById(e.dataTransfer.getData("Text"))!,
                teamID = e.dataTransfer.getData("Text").split("_")[0],
                team = teams.find(e => e.id === parseInt(teamID))!;
            if (team) {
                const newEl = Paper.teamListing(team);
                el.parentNode!.removeChild(el);
                teamsDOM.appendChild(newEl);
                teamsOnMap.splice(teamsOnMap.indexOf(team), 1);
                mapHandlers.setRastiColours(team.reitti, "red");
                leafMap.map.removeLayer(team.reitti);
                if (UIhandlers.joukkuuetOnList() <= 2) {
                    document.getElementById("joukkueet-empty")!.classList.add("hide");
                }
            }
        });
        onMapDOM.addEventListener("dragover", function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            return false;
        });
        onMapDOM.addEventListener("drop", function(e) {
            if (e.stopPropagation) e.stopPropagation();
            e.preventDefault();
            const el = document.getElementById(e.dataTransfer.getData("Text"))!,
                teamID = e.dataTransfer.getData("Text");
            if (teamID.split("_")[1] === "onMap") {
                const team = teams.find(e => e.id === parseInt(teamID))!;
                onMapDOM.insertBefore(el, onMapDOM.firstChild);
                if (team.reitti) {
                    leafMap.map.removeLayer(team.reitti);
                    team.reitti = undefined;
                    mapHandlers.getTeamRoute(team);
                } else {
                    mapHandlers.getTeamRoute(team);
                }
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
            mapHandlers.drawMarkers();
            leimaus.on("click", mapHandlers.onLeimausClick);
        });
    }

    static drawMarkers(): void {
        rastiMarkers.forEach(e => {
            leafMap.map.removeLayer(e);
        });
        rastiMarkers = [];
        rastit.forEach(e => {
            const koodi = L.divIcon({
                iconSize: new L.Point(50, 50),
                html: `<div>${e.koodi}</div>`
            });
            /**
             * Yksi aste on kutakuinkin 111111 metriä
             * 200 metriä on tällöin pyöristäen 111111 / 200
             *
             * Ja on muuten hyvä kysymys, miksi latituden muutos siirtää
             * markeria pystysuunnassa. Ainakin näin se oli nimetty datassa
             */
            const marker = L.marker([e.lat + 200 / 111111, e.lon], { icon: koodi });
            rastiMarkers.push(marker);
            marker.addTo(leafMap.map);
        });
    }

    static onLeimausClick(e: any) {
        if (selected === undefined) {
            e.target.setStyle({
                fillOpacity: 1
            });
            selected = e.target;
        } else {
            selected.setStyle({
                fillOpacity: 0.5
            });
            e.target.setStyle({
                fillOpacity: 1
            });
            selected = e.target;
        }
        if (selectionMarker) {
            leafMap.map.removeLayer(selectionMarker);
        }
        const marker = L.marker([selected.getLatLng().lat, selected.getLatLng().lng], { draggable: true }).addTo(
            leafMap.map
        );
        selectionMarker = marker;
        marker.on("dragend", function(e) {
            const lat = Math.round(selected.getLatLng().lat * 1000000) / 1000000,
                lng = Math.round(selected.getLatLng().lng * 1000000) / 1000000,
                newlon = Math.round(marker.getLatLng().lng * 1000000) / 1000000,
                newlat = Math.round(marker.getLatLng().lat * 1000000) / 1000000,
                rasti = util.getRastiByLatLng(lat, lng)!;
            selected.setLatLng([newlat, newlon]);
            rasti!.lon = newlon;
            rasti!.lat = newlat;
            mapHandlers.updateRoutes(rasti.id, newlat, newlon);
            leafMap.map.removeLayer(selectionMarker);
            selected.setStyle({
                fillOpacity: 0.5
            });
            mapHandlers.drawMarkers();
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
            e.setStyle({ color: color });
        });
    }

    static getTeamRoute(team: Joukkue) {
        const teamRastit = team.leimaukset.map(e => util.getMatchingRasti(e.id));
        const coords: any = teamRastit.map(e => {
            return [e!.lat, e!.lon];
        });
        const reitti: L.Polyline = L.polyline(coords, { color: team.color })!;
        leafMap.map.addLayer(reitti);
        team.reitti = reitti;
        if (teamsOnMap.indexOf(team) <= -1) {
            teamsOnMap.push(team);
        }
        mapHandlers.setRastiColours(reitti, team.color);
        reitti.bindPopup(`Joukkueen ${team.nimi} käymä reitti`);
    }

    static updateRoutes(id: number, newlat: number, newlon: number): void {
        const affected: Joukkue[] = teams.filter((t: Joukkue) => {
            return t.leimaukset.find((l: Leimaus) => l.id == id);
        });
        affected.forEach(e => {
            e.updateMatka();
            const matkaDOM = document.getElementById(`matka_${e.id}`);
            if (matkaDOM) {
                matkaDOM.textContent = `Kuljettu matka: ${e.matka}km`;
            }
        });
        teamsOnMap.forEach(e => {
            const index = teamsOnMap.indexOf(e);
            leafMap.map.removeLayer(e.reitti);
            mapHandlers.getTeamRoute(e);
            if (index > -1) teamsOnMap[index] = e;
        });
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
            } catch (err) {}
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

    static getRastiByLatLng(lat: number, lng: number) {
        return rastit.find(e => {
            return e.lat === lat && e.lon === lng;
        });
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
        teamTravel.id = `matka_${team.id}`;
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

    static teamListingOnMap(team: Joukkue): DocumentFragment {
        const frag = document.createDocumentFragment(),
            teamSummary = document.createElement("summary"),
            teamDetails = document.createElement("details"),
            teamList = document.createElement("ul");
        teamSummary.textContent = team.nimi;
        teamDetails.appendChild(teamSummary);
        teamDetails.appendChild(teamList);
        teamDetails.id = team.id.toString() + "_onMap";
        teamDetails.classList.add("team-details");
        teamList.id = team.id + "_onMapList";
        team.leimaukset.forEach(e => {
            let rasti = util.getMatchingRasti(e.id)!;
            const listItem = document.createElement("li");
            const rastiTime = document.createElement("span");
            listItem.id = "TEAM:" + team.id + "_ID:" + e.id;
            listItem.classList.add("team-details-item");
            listItem.setAttribute("draggable", "true");
            listItem.textContent = rasti.koodi;
            rastiTime.textContent = e.aika.toString();
            listItem.addEventListener("dragstart", UIhandlers.dragstart_handler);
            listItem.addEventListener("drop", UIhandlers.leimausDrop);
            listItem.addEventListener("dragenter", UIhandlers.leimausDragEnter);
            listItem.addEventListener("dragexit", UIhandlers.leimausDragExit);
            teamList.appendChild(listItem);
        });
        teamDetails.setAttribute("draggable", "true");
        teamDetails.addEventListener("dragstart", UIhandlers.dragstart_handler);
        frag.appendChild(teamDetails);
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

    updateMatka(): void {
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
