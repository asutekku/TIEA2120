"use strict";

class TulosPalvelu {
    public static main(): void {
        create.table(util.getJoukkueet(data));
        create.form("rasti", "Rastin tiedot");
        create.form("joukkue", "Uusi joukkue");
        create.createEditButtons();
        create.setEditButtons();
    }
}

class Joukkue {
    get pisteet(): number {
        return this._pisteet;
    }

    set pisteet(value: number) {
        this._pisteet = value;
    }

    get sarja(): string {
        return this._sarja;
    }

    set sarja(value: string) {
        this._sarja = value;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get jasenet(): string[] {
        return this._jasenet;
    }

    set jasenet(value: string[]) {
        this._jasenet = value;
    }

    get last(): string {
        return this._last;
    }

    set last(value: string) {
        this._last = value;
    }

    get nimi(): string {
        return this._nimi;
    }

    set nimi(value: string) {
        this._nimi = value;
    }

    private _sarja: string;
    private _id: number;
    private _jasenet: string[];
    private _last: string;
    private _nimi: string;
    private _pisteet: number;

    constructor(nimi, last, jasenet, id, sarja, pisteet) {
        this._nimi = nimi;
        this._last = last;
        this._jasenet = jasenet;
        this._id = id;
        this._sarja = sarja;
        this._pisteet = pisteet;
    }
}

class Rasti {
    public kilpailu: number;
    public lon: string;
    public koodi: string;
    public lat: string;
    public id: number;

    constructor() {
        this.kilpailu = util.randomInt(16);
        this.lon = "";
        this.koodi = "";
        this.lat = "";
        this.id = util.randomInt(16);
    }
}

class Controller {
    static teamIndex: number;

    static newRasti(e) {
        if (e.preventDefault) e.preventDefault();
        let form: HTMLFormElement = util.getByID("form_lisaaRasti");
        let formData = new FormData(form);
        let rasti = {};
        let skip = false;
        rasti.kilpailu = util.randomInt(16);
        for (let pair of formData.entries()) {
            if (pair[1] === "") skip = true;
            rasti[pair[0]] = pair[1].toString();
        }
        if (!skip) {
            rasti.id = util.randomInt(16);
            data.rastit.push(rasti);
            form.reset();
        }
    }

    static saveJoukkue(e) {
        if (e.preventDefault) e.preventDefault();
        let form: HTMLFormElement = util.getByID("form_lisaaJoukkue");
        let formData = new FormData(form);
        let skip: boolean = false;
        let joukkue:Joukkue;
        if (!create.editMode) {
            joukkue.jasenet = [];
            formData.forEach(function (value, key) {
                if (key.startsWith("jasen")) {
                    joukkue.jasenet.push(value);
                } else {
                    joukkue[key] = value;
                }
            });
            joukkue.pisteet = 0;
            joukkue.aika = "00:00:00";
            joukkue.matka = 0;
            joukkue.sarja = "2h";
            console.log(joukkue);
            if (!Controller.formEmpty(form)) {
                data.sarjat[1].joukkueet.push(joukkue);
                let joukkueet = util.getJoukkueet(data);
                let newRow = create.teamRow(joukkueet[joukkueet.length - 1]);
                util.getByID("tulosTable").appendChild(create.teamRow(joukkue));
                form.reset();
            }
        } else {
            let team: Joukkue = util.getJoukkueet(data)[Controller.teamIndex];
            team.nimi = util.getByID("input_1_0").value;
            team.jasenet = [];
            for (let jasenInput of document.getElementsByTagName("legend")[1].children) {
                team.jasenet.push(jasenInput.value);
            }
            Controller.updateJoukkueet(team,form);
        }
    }

    static validateJoukkueForm() {
        let a = document.forms["form_lisaaJoukkue"]["input_1_0"].value;
        let b = document.forms["form_lisaaJoukkue"]["input_1_1"].value;
        let c = document.forms["form_lisaaJoukkue"]["input_1_2"].value;
        if (a == null || a == "", b == null || b == "", c == null || c == "") {
            create.emptyForm = false;
            util.getByID("joukkueButton").disabled = true;
            return false;
        }
        util.getByID("joukkueButton").disabled = false;
    }

    static formEmpty(form): boolean {
        return util.mapForm(form).map(x => x.value !== "").length <= 0;
    }

    static setValidations(object) {
        object.onfocusout = function () {
            Controller.validateJoukkueForm()
        };
        object.oninput = function () {
            Controller.validateJoukkueForm()
        };
    }

    static updateJoukkueet(team,form): void {
        util.getJoukkueet(data)[Controller.teamIndex] = team;
        form.reset();
        util.removeEl("tulosTable");
        create.table(util.getJoukkueet(data));
        create.toggleEditButtons();
    }

    static editJoukkue(jj) {
        if (!create.editMode) {
            create.toggleEditButtons();
            let joukkueet = util.getJoukkueet(data);
            let team = {};
            for (let i = 0; i < joukkueet.length; i++) {
                if (joukkueet[i].nimi === jj) {
                    console.log(i);
                    Controller.teamIndex = i;
                    team = joukkueet[i];
                }
            }
            let jasenCount = 1;
            for (let jasen of team.jasenet) {
                util.getByID("input_1_" + jasenCount).value = jasen.toString();
                jasenCount++;
            }
            util.getByID("input_1_0").value = team.nimi;
        } else {
            window.alert("Please finish editing before selecting a new team");
        }
    }
}

class create {
    static inputID = 0;
    static formID = 0;
    static editMode = false;
    static emptyForm = true;
    static legendText = "Uusi joukkue";


    static createEditButtons() {
        create.formButton(util.getByTag("fieldset")[1],
            "editButton",
            "Tallenna",
            false);
        create.formButton(util.getByTag("fieldset")[1],
            "cancelButton",
            "Peruuta",
            true);
        util.getByID("cancelButton").onclick = function () {
            let form: HTMLFormElement = util.getByID("form_lisaaJoukkue");
            document.getElementsByTagName("legend")[1].innerText = "Uusi joukkue";
            form.reset();
            create.toggleEditButtons();
        };
    }

    static setEditButtons() {
        util.getByID("joukkueButton").style.display = "block";
        util.getByID("editButton").style.display = "none";
        util.getByID("cancelButton").style.display = "none";
    }

    static toggleEditButtons() {
        let legend = document.getElementsByTagName("legend")[1];
        this.legendText = legend.innerText === this.legendText ? "Muokkaa joukkuetta" : "Uusi joukkue";
        legend.innerText = this.legendText;
        util.toggleDiv("joukkueButton");
        util.toggleDiv("editButton");
        util.toggleDiv("cancelButton");
        this.editMode = this.editMode == true ? false : true;
    }

    static element(tagName: string, inner?: any, id?: string): any {
        let el: any = document.createElement(tagName);
        if (inner !== undefined) el.innerHTML = inner;
        if (id !== undefined) el.id = id;
        return el;
    }

    static form(type: string, title: string,) {
        let form = document.getElementsByTagName("form")[type === "rasti" ? 0 : 1];
        let fieldSet: HTMLElement = this.element("fieldSet");
        let legend: HTMLElement = this.element("legend", title);
        form.appendChild(fieldSet);
        fieldSet.appendChild(legend);
        if (type === "rasti") {
            this.formID = 0;
            if (form.attachEvent) {
                form.attachEvent("submit", Controller.newRasti);
            } else {
                form.addEventListener("submit", Controller.newRasti);
            }
            form.removeAttribute("action");
            form.id = "form_lisaaRasti";
            this.formRow(fieldSet, "Lat", true);
            this.formRow(fieldSet, "Lon", true);
            this.formRow(fieldSet, "Koodi", true);
            this.formButton(fieldSet, "rasti", "Lisää rasti");
        } else if (type === "joukkue") {
            this.inputID = 0;
            form.removeAttribute("action");
            form.id = "form_lisaaJoukkue";
            this.formID = 1;
            if (form.attachEvent) {
                form.attachEvent("submit", Controller.saveJoukkue);
            } else {
                form.addEventListener("submit", Controller.saveJoukkue);
            }
            this.formRow(fieldSet, "Nimi", true, false, false, true);
            let fieldSetJasenet: HTMLElement = this.element("fieldSet");
            let legendJasenet: HTMLElement = this.element("legend", "Jäsenet");
            fieldSet.appendChild(fieldSetJasenet);
            fieldSetJasenet.appendChild(legendJasenet);
            this.formRow(fieldSetJasenet, "Jasen 1", true, false, false, true);
            this.formRow(fieldSetJasenet, "Jasen 2", true, false, false, true);
            let buttonRow = this.formButton(fieldSetJasenet, "jasenButton", "Lisää jäsen", true);
            let jasenMaara = 2;
            util.getByID("jasenButton").onclick = function () {
                jasenMaara++;
                create.formRow(fieldSetJasenet, "Jasen " + jasenMaara, false, true, buttonRow);
            };
            let joukkueButton = this.formButton(fieldSet, "joukkueButton", "Lisää joukkue");
            util.getByID("joukkueButton").disabled = true;
        } else {
            return;
        }
    }

    static formRow(appendable, inputLabel, required?, before?, beforeElement?, validate?) {
        let row = this.element("p");
        row.appendChild(this.input(inputLabel, required, validate));
        if (before) {
            appendable.insertBefore(row, beforeElement);
        } else {
            appendable.appendChild(row);
        }

    }

    static formButton(appendable, id, inputLabel, disableSubmit?) {
        let row = this.element("p");
        let button = this.element("button", inputLabel);
        if (!disableSubmit) {
            button.type = 'submit';
        }
        button.name = id;
        button.id = id;
        row.appendChild(button);
        appendable.appendChild(row);
        return row;
    }

    static input(inputLabel, required?, validate?) {
        let label = this.element("label", inputLabel + ": ");
        let input = this.element("input");
        let inputID = 'input_' + this.formID + '_' + this.inputID;
        if (required) input.required = "required";
        if (validate) Controller.setValidations(input);
        input.type = 'text';
        input.val = "";
        input.name = inputLabel.toLowerCase();
        label.htmlFor = inputID;
        input.id = inputID;
        input.class = 'formInput';
        this.inputID++;
        label.appendChild(input);
        return label;
    }

    static table(arr) {
        let joukkueet = arr.sort(util.dynamicSortMultiple("sarja", 'pisteet'));
        let tulosTable = create.element("table", "", "tulosTable");
        let tulosCaption = document.createElement("caption");
        let firstRow = document.createElement("tr");
        firstRow.innerHTML = '<th>Sarja</th><th>Joukkue</th><th>Pisteet</th><th>Aika</th><th>Matka</th>';
        tulosCaption.innerHTML = "Tulokset";
        tulosTable.appendChild(tulosCaption);
        tulosTable.appendChild(firstRow);
        util.getByID("tupa").appendChild(tulosTable);
        for (let joukkue of joukkueet) {
            joukkue.aika = util.getAika(joukkue);
            joukkue.matka = util.getMatka(joukkue);
            tulosTable.appendChild(create.teamRow(joukkue));
            util.getByID("a_" + joukkue.nimi).addEventListener('onclick', Controller.editJoukkue, false);
        }
    }

    static teamRow(team) {
        let jasenString: string = team.jasenet != null ? team.jasenet.join(', ') : "";
        let row = document.createElement("tr");
        let seriesEl = create.element("td", team.sarja);
        let teamEl = create.element("a", team.nimi);
        let pointsEl = create.element("td", team.pisteet);
        let aika = create.element("td", team.aika);
        let matka = create.element("td", team.matka + " km");
        teamEl.href = `javascript:Controller.editJoukkue("${team.nimi.toString()}")`;
        teamEl.id = "a_" + team.nimi;
        row.appendChild(seriesEl);
        row.appendChild(teamEl);
        row.innerHTML += "<br/>" + jasenString;
        row.appendChild(pointsEl);
        row.appendChild(aika);
        row.appendChild(matka);
        return row;
    }
}

class util {

    static rastit = util.getRastit();

    static sortTable(sorTable, n) {
        let table, rows, switching, i, x, y, shouldSwitch, dir, switchCount = 0;
        table = sorTable
        switching = true;
        dir = "asc";
        while (switching) {
            switching = false;
            rows = table.getElementsByTagName("tr");
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("td")[n];
                y = rows[i + 1].getElementsByTagName("td")[n];
                if (dir == "asc") {
                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                } else if (dir == "desc") {
                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                switchCount++;
            } else {
                if (switchCount == 0 && dir == "asc") {
                    dir = "desc";
                    switching = true;
                }
            }
        }
    }

    static dynamicSort(property) {
        let sortOrder = -1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b) {
            let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }

    static dynamicSortMultiple() {
        let props = arguments;
        return function (obj1, obj2) {
            var i = 0, result = 0, numberOfProperties = props.length;
            while (result === 0 && i < numberOfProperties) {
                result = util.dynamicSort(props[i])(obj1, obj2);
                i++;
            }
            return result;
        }
    }

    static getJoukkueet(data) {
        let arr = [];
        for (let i = 0; i < data.sarjat.length; i++) {
            for (let j = 0; j < data.sarjat[i].joukkueet.length; j++) {
                let joukkue = new Joukkue(
                    data.sarjat[i].joukkueet[j].nimi,
                    data.sarjat[i].joukkueet[j].last,
                    data.sarjat[i].joukkueet[j].jasenet,
                    data.sarjat[i].joukkueet[j].id,
                    data.sarjat[i].nimi,
                    0);
                joukkue.pisteet = this.getPoints(joukkue);
                arr.push(joukkue);
            }
        }
        return arr;
    }

    static getPoints(team) {
        const kaydytRastit = util.getUnique(util.getKaydytRastitID(team).sort());
        let pisterastit = util.getKoodit(util.arrayElementsToString(kaydytRastit)).sort();
        let pisteet: number = eval(util.getFirstNumber(util.parseArrayToInt(pisterastit)).join('+'));
        return pisteet !== undefined ? pisteet : 0;
    }

    static getRastit() {
        return data.rastit.map(x => x);
    }

    static randomInt(length): number {
        return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
    }

    static getKaydytRastitID(team) {
        return data.tupa.filter(p => p.joukkue === team.id).map(x => x.rasti);
    }

    static getKaydytRastit(team) {
        return data.tupa.filter(p => p.joukkue === team.id);
    }

    static getKoodit(rastiArr) {
        return this.getRastit().filter(function (e) {
            return rastiArr.indexOf(e.id.toString()) > -1;
        }).map(x => x.koodi);
    }

    static getUnique(arr) {
        return arr.filter(this.returnUniqueValues);
    }

    static returnUniqueValues(value, index, self) {
        return self.indexOf(value) === index;
    }

    static arrayElementsToString(arr) {
        return arr.map(x => x.toString());
    }

    static getFirstNumber(arr) {
        return arr.map(x => parseInt(x.toString()[0]));
    }

    static parseArrayToInt(arr) {
        return arr.filter(function (x) {
            return /^\d/.test(x)
        }).map(x => parseInt(x));
    }

    static getAika(team) {
        let aikaString = "00:00:00";
        const kaydytRastit = this.getKaydytRastit(team).filter(function (rasti) {
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
        try {
            aikaString = `${hours}:${min}:${sec}`
        } catch (e) {
            aikaString = "00:00:00"
        }
        return aikaString;
    }

    static getMatchingRasti(rastiID) {
        return util.rastit.filter(rasti => rasti.id == rastiID)[0];
    }

    static getMatka(team) {
        let matka = 0;
        const kaydytRastit = util.getKaydytRastit(team).filter(function (rasti) {
            return (rasti.aika !== "");
        });
        for (let i = 0; i < kaydytRastit.length - 1; i++) {
            let rasti1 = util.getMatchingRasti(kaydytRastit[i].rasti);
            let rasti2 = util.getMatchingRasti(kaydytRastit[i + 1].rasti);
            try {
                matka += util.getDistanceFromLatLonInKm(rasti1.lat, rasti1.lon, rasti2.lat, rasti2.lon);
            } catch (err) {
            }
        }
        return Math.floor(matka);
    }

    static getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        let R = 6371; // Radius of the earth in km
        let dLat = util.deg2rad(lat2 - lat1);  // deg2rad below
        let dLon = util.deg2rad(lon2 - lon1);
        let a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(util.deg2rad(lat1)) * Math.cos(util.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c; // Distance in km
        return d;
    }

    static deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

    static getByID(id) {
        return document.getElementById(id);
    }

    static getByTag(tag) {
        return document.getElementsByTagName(tag);
    }

    static mapForm(form) {
        return Array.from(form.getElementsByTagName("input"));
    }

    static toggleDiv(id) {
        let div = util.getByID(id);
        div.style.display = div.style.display == "none" ? "block" : "none";
    }

    static removeEl(elemID) {
        let elem = util.getByID(elemID);
        if (elem.parentNode) {
            elem.parentNode.removeChild(elem);
        }
    }
}

window.onload = function () {
    TulosPalvelu.main();
};