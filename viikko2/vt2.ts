'use strict';

/**
 * Main class
 */
class TulosPalvelu {
    /**
     * The main function
     * I like to have this to not accidentally executing something unwanted
     */
    public static main(): void {
        create.table(util.getJoukkueet(data));
        create.form('rasti', 'Rastin tiedot');
        create.form('joukkue', 'Uusi joukkue');
        create.createEditButtons();
        create.setEditButtons();
    }
}

/**
 * Class for the team
 */
class Joukkue {
    public sarja: string;
    public id: number;
    public jasenet: string[];
    public last: string;
    public nimi: string;
    public pisteet: number;

    constructor(nimi, last, jasenet, id, sarja, pisteet) {
        this.nimi = nimi;
        this.last = last;
        this.jasenet = jasenet;
        this.id = id;
        this.sarja = sarja;
        this.pisteet = pisteet;
    }
}

/**
 * Rasti class
 */
class Rasti {
    public kilpailu: number;
    public lon: string;
    public koodi: string;
    public lat: string;
    public id: number;

    constructor() {
        this.kilpailu = util.randomInt(16);
        this.lon = '';
        this.koodi = '';
        this.lat = '';
        this.id = util.randomInt(16);
    }
}

/**
 * Class to handle the controlling functions
 */
class Controller {
    static teamIndex: number;
    public static formAmount: number = 2;

    /**
     * Creates a new rasti and saves it to rastis
     * @param e - Event to prevent button doing something evil
     */
    static newRasti(e) {
        if (e.preventDefault) e.preventDefault();
        let form: HTMLFormElement = util.getByID('form_lisaaRasti');
        let formData = new FormData(form);
        let rasti = {};
        let skip = false;
        rasti.kilpailu = util.randomInt(16);
        for (let pair of formData.entries()) {
            if (pair[1] === '') skip = true;
            rasti[pair[0]] = pair[1].toString();
        }
        if (!skip) {
            rasti.id = util.randomInt(16);
            data.rastit.push(rasti);
            form.reset();
        }
    }

    /**
     * Saves the team to data
     * @param e - Event to prevent button doing something evil
     */
    static saveJoukkue(e) {
        if (e.preventDefault) e.preventDefault();
        let form: HTMLFormElement = util.getByID('form_lisaaJoukkue');
        let formData = new FormData(form);
        let skip: boolean = false;
        if (!create.editMode) {
            let joukkue: Joukkue = new Joukkue(util.getByID('input_1_0').value, '00:00:00', [], util.randomInt(16), '2h', 0);
            formData.forEach(function (value, key) {
                if (key.startsWith('jasen')) {
                    joukkue.jasenet.push(value);
                } else {
                    joukkue[key] = value;
                }
            });
            joukkue.pisteet = 0;
            joukkue.aika = '00:00:00';
            joukkue.matka = 0;
            joukkue.sarja = '2h';
            console.log(joukkue);
            if (!Controller.formEmpty(form)) {
                data.sarjat[1].joukkueet.push(joukkue);
                let joukkueet = util.getJoukkueet(data);
                let newRow = create.teamRow(joukkueet[joukkueet.length - 1]);
                util.getByID('tulosTable').appendChild(create.teamRow(joukkue));
                form.reset();
            }
        } else {
            let team: Joukkue = util.getJoukkueet(data)[Controller.teamIndex];
            team.nimi = util.getByID('input_1_0').value;
            team.jasenet = [];
            for (let jasenInput of document.getElementsByTagName('legend')[1].children) {
                team.jasenet.push(jasenInput.value);
            }
            Controller.updateJoukkueet(team, form);
        }
    }

    /**
     * Should validate the team form
     * @returns {boolean} - Is the form valid
     */
    static validateJoukkueForm() {
        let a = document.forms['form_lisaaJoukkue']['input_1_0'].value;
        let b = document.forms['form_lisaaJoukkue']['input_1_1'].value;
        let c = document.forms['form_lisaaJoukkue']['input_1_2'].value;
        if ((a == null || a == '', b == null || b == '', c == null || c == '')) {
            create.emptyForm = false;
            util.getByID('joukkueButton').disabled = true;
            return false;
        }
        util.getByID('joukkueButton').disabled = false;
    }

    /**
     * Checks whether the form is empty
     * @param form - Form to check
     * @returns {boolean} - True if empty, false if not
     */
    static formEmpty(form): boolean {
        return util.mapForm(form).map(x => x.value !== '').length <= 0;
    }

    /**
     * Set validations for input fields
     * @param object - Object to set the validation to
     */
    static setValidations(object) {
        object.onfocusout = function () {
            Controller.validateJoukkueForm();
        };
        object.oninput = function () {
            Controller.validateJoukkueForm();
        };
    }

    /**
     * Updates team data
     * @param team - Team to update
     * @param form - Resets the form where the data is coming from
     */
    static updateJoukkueet(team, form): void {
        util.getJoukkueet(data)[Controller.teamIndex] = team;
        form.reset();
        util.removeEl('tulosTable');
        create.table(util.getJoukkueet(data));
        create.toggleEditButtons();
    }

    /**
     * Edits a team
     * @param jj - Name of the team
     */
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
            for (let i = 0; i < team.jasenet.length; i++) {
                if (i > 1) {
                    this.formAmount++;
                    create.formRow(util.getByID('jasenet_fieldset'), 'Jäsen ' + (this.formAmount), false, true, util.getByID('p_jasenButton'), true);
                    util.getByID('input_1_' + jasenCount).value = team.jasenet[i].toString();
                } else {
                    util.getByID('input_1_' + jasenCount).value = team.jasenet[i].toString();
                }
                jasenCount++;
            }
            util.getByID('input_1_0').value = team.nimi;
        } else {
            window.alert('Please finish editing before selecting a new team');
        }
    }
}

class create {
    static inputID = 0;
    static formID = 0;
    static editMode = false;
    static emptyForm = true;
    static legendText = 'Uusi joukkue';

    /**
     * Creates the form buttons
     */
    static createEditButtons() {
        create.submitFormButton(util.getByTag('fieldset')[1], 'editButton', 'Tallenna', false);
        create.submitFormButton(util.getByTag('fieldset')[1], 'cancelButton', 'Peruuta', true);
        util.getByID('cancelButton').onclick = function () {
            if (Controller.formAmount > 2) {
                for (let i = 2; i < Controller.formAmount; i++)
                    util.removeEl('input_1_' + i);
            }
            let form: HTMLFormElement = util.getByID('form_lisaaJoukkue');
            document.getElementsByTagName('legend')[1].textContent = 'Uusi joukkue';
            form.reset();
            Controller.formAmount = 2;
            create.toggleEditButtons();
        };
    }

    /**
     * Set the visibility of form buttons
     */
    static setEditButtons() {
        util.getByID('joukkueButton').style.display = 'block';
        util.getByID('editButton').style.display = 'none';
        util.getByID('cancelButton').style.display = 'none';
    }

    /**
     * Toggles the state of edit buttons
     */
    static toggleEditButtons() {
        let legend = document.getElementsByTagName('legend')[1];
        this.legendText = legend.textContent === this.legendText ? 'Muokkaa joukkuetta' : 'Uusi joukkue';
        legend.textContent = this.legendText;
        util.toggleDiv('joukkueButton');
        util.toggleDiv('editButton');
        util.toggleDiv('cancelButton');
        this.editMode = this.editMode != true;
    }

    /**
     * Alternative way to create new element instead of document.createElement
     * @param {string} - tagName Tag of the element
     * @param inner - TextContent of the element
     * @param {string} - id ID of the element
     * @returns {HTMLElement} - Returns the element
     */
    static element(tagName: string, inner?: any, id?: string): any {
        let el: HTMLElement = document.createElement(tagName);
        if (inner !== undefined) el.textContent = inner;
        if (id !== undefined) el.id = id;
        return el;
    }

    /**
     * Form constructor
     * @param {string} type - Type of the form (In this case either rasti or joukkue)
     * @param {string} title - Name of of the legend of the form
     */
    static form(type: string, title: string) {
        let form = document.getElementsByTagName('form')[type === 'rasti' ? 0 : 1];
        let fieldSet: HTMLElement = this.element('fieldSet');
        let legend: HTMLElement = this.element('legend', title);
        form.appendChild(fieldSet);
        fieldSet.appendChild(legend);
        if (type === 'rasti') {
            this.formID = 0;
            if (form.attachEvent) {
                form.attachEvent('submit', Controller.newRasti);
            } else {
                form.addEventListener('submit', Controller.newRasti);
            }
            form.removeAttribute('action');
            form.id = 'form_lisaaRasti';
            this.formRow(fieldSet, 'Lat', true);
            this.formRow(fieldSet, 'Lon', true);
            this.formRow(fieldSet, 'Koodi', true);
            this.submitFormButton(fieldSet, 'rasti', 'Lisää rasti');
        } else if (type === 'joukkue') {
            this.inputID = 0;
            form.removeAttribute('action');
            form.id = 'form_lisaaJoukkue';
            this.formID = 1;
            if (form.attachEvent) {
                form.attachEvent('submit', Controller.saveJoukkue);
            } else {
                form.addEventListener('submit', Controller.saveJoukkue);
            }
            this.formRow(fieldSet, 'Nimi', true, false, false, true);
            let fieldSetJasenet: HTMLElement = this.element('fieldSet', '', 'jasenet_fieldset');
            let legendJasenet: HTMLElement = this.element('legend', 'Jäsenet');
            fieldSet.appendChild(fieldSetJasenet);
            fieldSetJasenet.appendChild(legendJasenet);
            this.formRow(fieldSetJasenet, 'Jäsen 1', true, false, false, true);
            this.formRow(fieldSetJasenet, 'Jäsen 2', false, false, false, true);
            let buttonRow = this.submitFormButton(fieldSetJasenet, 'jasenButton', 'Lisää jäsen', true);
            let jasenMaara = 2;
            util.getByID('jasenButton').onclick = function () {
                Controller.formAmount++;
                jasenMaara++;
                create.formRow(fieldSetJasenet, 'Jasen ' + Controller.formAmount, false, true, buttonRow);
            };
            let joukkueButton = this.submitFormButton(fieldSet, 'joukkueButton', 'Lisää joukkue');
            util.getByID('joukkueButton').disabled = true;
        } else {
            return;
        }
    }

    /**
     * Creates an row with input to a form
     * @param appendable - The top level element, most likely fieldSet
     * @param inputLabel - Label for the input
     * @param required - Is the input required
     * @param {boolean} before - Is the row inserted before some element
     * @param beforeElement - Which element the row is inserted before
     * @param {boolean} validate - Does the function validate when exited
     */
    static formRow(appendable, inputLabel: string, required?, before?: boolean, beforeElement?, validate?) {
        let row = this.element('p');
        row.appendChild(this.input(inputLabel, required, validate));
        if (before) appendable.insertBefore(row, beforeElement);
        else appendable.appendChild(row);
    }

    /**
     * Creates a submit button to be used in a form
     * @param appendable - The top level element, most likely fieldSet
     * @param id - ID of the Button
     * @param inputLabel - Label for the button
     * @param disableSubmit - Whether button is disabled from the start
     * @returns {HTMLParagraphElement} - Returns the button inside p-element
     */
    static submitFormButton(appendable, id, inputLabel, disableSubmit?) {
        let row: HTMLParagraphElement = this.element('p');
        row.id = 'p_' + id;
        let button = this.element('button', inputLabel);
        if (!disableSubmit) button.type = 'submit';
        button.name = id;
        button.id = id;
        row.appendChild(button);
        appendable.appendChild(row);
        return row;
    }

    /**
     * Creates an input field to be used in a form
     * @param inputLabel - The label for hte field
     * @param required - Is the input required
     * @param validate - Does it validate the form
     * @returns {HTMLParagraphElement} - Returns the input inside a p
     */
    static input(inputLabel, required?, validate?) {
        let label: HTMLLabelElement = this.element('label', inputLabel + ': ');
        let input = this.element('input');
        let inputID = 'input_' + this.formID + '_' + this.inputID;
        if (required) input.required = 'required';
        if (validate) Controller.setValidations(input);
        input.type = 'text';
        input.val = '';
        input.name = inputLabel.toLowerCase();
        label.htmlFor = inputID;
        input.id = inputID;
        input.class = 'formInput';
        this.inputID++;
        label.appendChild(input);
        return label;
    }

    /**
     * Creates tables to be used in the tulospalvelu
     * These are not modular and will not be
     * @param arr - The array to create the table from
     */
    static table(arr) {
        let joukkueet: any = arr;
        util.sortArrayProperty(joukkueet, 'sarja');
        let tulosTable: HTMLTableElement = create.element('table', '', 'tulosTable');
        let tulosCaption: HTMLTableCaptionElement = document.createElement('caption');
        let firstRow: HTMLTableRowElement = document.createElement('tr');
        let sarjaHeader: HTMLTableHeaderCellElement = this.element('th', 'Sarja');
        sarjaHeader.addEventListener('click', (e: Event) => util.sortTable(tulosTable, 0));
        firstRow.appendChild(sarjaHeader);
        let joukkueHeader = this.element('th', 'Joukkue');
        joukkueHeader.addEventListener('click', (e: Event) => util.sortTable(tulosTable, 1));
        firstRow.appendChild(joukkueHeader);
        let pisteHeader = this.element('th', 'Pisteet');
        pisteHeader.addEventListener('click', (e: Event) => util.sortTable(tulosTable, 2));
        firstRow.appendChild(pisteHeader);
        let aikaHeader = this.element('th', 'Aika');
        aikaHeader.addEventListener('click', (e: Event) => util.sortTable(tulosTable, 3));
        firstRow.appendChild(aikaHeader);
        let matkaHeader = this.element('th', 'Matka');
        matkaHeader.addEventListener('click', (e: Event) => util.sortTable(tulosTable, 4));
        firstRow.appendChild(matkaHeader);
        tulosCaption.textContent = 'Tulokset';
        tulosTable.appendChild(tulosCaption);
        tulosTable.appendChild(firstRow);
        util.getByID('tupa').appendChild(tulosTable);
        for (let joukkue of joukkueet) {
            joukkue.aika = util.getAika(joukkue);
            joukkue.matka = util.getMatka(joukkue);
            tulosTable.appendChild(create.teamRow(joukkue));
            util.getByID('a_' + joukkue.nimi).addEventListener('onclick', Controller.editJoukkue, false);
        }
    }

    /**
     * The row to be inserted into the array
     * @param team - Team element to insert into the row
     * @returns {HTMLTableRowElement} - Row element
     */
    static teamRow(team) {
        let jasenString: string = team.jasenet != null ? team.jasenet.join(', ') : '';
        let row = document.createElement('tr');
        let seriesEl = create.element('td', team.sarja);
        let teamEl = document.createElement('td');
        let teamAh = create.element('a', team.nimi);
        let pointsEl = create.element('td', team.pisteet);
        let aika = create.element('td', team.aika);
        let matka = create.element('td', team.matka + ' km');
        teamAh.href = `javascript:Controller.editJoukkue("${team.nimi.toString()}")`;
        teamAh.id = 'a_' + team.nimi;
        row.appendChild(seriesEl);
        row.appendChild(teamEl);
        teamEl.appendChild(teamAh);
        teamEl.appendChild(document.createElement('br'));
        teamEl.appendChild(document.createTextNode(jasenString));
        row.appendChild(pointsEl);
        row.appendChild(aika);
        row.appendChild(matka);
        return row;
    }
}

class util {
    /**
     * Array to be used in the functions in this class
     */
    static rastit: any = util.getRastit();

    /**
     * Sorts the array
     * @param arr - Array to be sorted
     * @param property - Value to sort from
     */
    static sortArrayProperty(arr, property) {
        arr.sort(function (a, b) {
            let itemA = a[property].toUpperCase(); // ignore upper and lowercase
            let itemB = b[property].toUpperCase(); // ignore upper and lowercase
            if (itemA < itemB) return -1;
            if (itemA > itemB) return 1;
            return 0;
        });
    }

    /**
     * Table sorting function taken form w3c and edited a bit
     * @param ediTable - Table to edit
     * @param col - Column to sort by
     */
    static sortTable(ediTable, col) {
        let table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
        table = ediTable;
        switching = true;
        dir = 'asc';
        while (switching) {
            switching = false;
            rows = table.getElementsByTagName('tr');
            for (i = 1; i < rows.length - 1; i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName('td')[col];
                y = rows[i + 1].getElementsByTagName('td')[col];
                if (dir == 'asc') {
                    if (!this.startsWithNumber(x.textContent)) {
                        if (x.textContent.toLowerCase() > y.textContent.toLowerCase()) {
                            shouldSwitch = true;
                            break;
                        }
                    } else {
                        if (parseInt(x.textContent) > parseInt(y.textContent)) {
                            shouldSwitch = true;
                            break;
                        }
                    }
                } else if (dir == 'desc') {
                    if (!this.startsWithNumber(x.textContent)) {
                        if (x.textContent.toLowerCase() < y.textContent.toLowerCase()) {
                            shouldSwitch = true;
                            break;
                        }
                    } else {
                        if (parseInt(x.textContent) < parseInt(y.textContent)) {
                            shouldSwitch = true;
                            break;
                        }
                    }
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                switchcount++;
            } else {
                if (switchcount == 0 && dir == 'asc') {
                    dir = 'desc';
                    switching = true;
                }
            }
        }
    }

    /**
     * Returns the joukkueet in a nice array
     * @param data-  The json object
     * @returns {Joukkue[]} - Returns the joukkeet as Joukkue array
     */
    static getJoukkueet(data) {
        let arr: Joukkue[] = [];
        for (let i = 0; i < data.sarjat.length; i++) {
            for (let j = 0; j < data.sarjat[i].joukkueet.length; j++) {
                let joukkue = new Joukkue(
                    data.sarjat[i].joukkueet[j].nimi,
                    data.sarjat[i].joukkueet[j].last,
                    data.sarjat[i].joukkueet[j].jasenet,
                    data.sarjat[i].joukkueet[j].id,
                    data.sarjat[i].nimi,
                    0
                );
                joukkue.pisteet = this.getPoints(joukkue);
                arr.push(joukkue);
            }
        }
        return arr;
    }

    /**
     * Returns the points of the team
     * @param team - Team to get the numbers
     * @returns {number} - Team points
     */
    static getPoints(team) {
        const kaydytRastit = util.getUnique(util.getKaydytRastitID(team).sort());
        let pisterastit = util.getKoodit(util.arrayElementsToString(kaydytRastit)).sort();
        let pisteet: number = eval(util.getFirstNumber(util.parseArrayToInt(pisterastit)).join('+'));
        return pisteet !== undefined ? pisteet : 0;
    }

    /**
     * Gets all of the rastit in an array
     * @returns {any} - Array of rastit
     */
    static getRastit() {
        return data.rastit.map(x => x);
    }

    /**
     * Tool to get random integer with defined length
     * @param length - Length of the integer
     * @returns {number} - Random integer
     */
    static randomInt(length): number {
        return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
    }

    /**
     * Returns the ids of visited Rastit
     * @param team - Team to process
     * @returns {any} - Rasti ID array
     */
    static getKaydytRastitID(team) {
        return data.tupa.filter(p => p.joukkue === team.id).map(x => x.rasti);
    }

    /**
     * Returns the visisted rastit
     * @param team - Team to process
     * @returns {any} - Rasti array
     */
    static getKaydytRastit(team) {
        return data.tupa.filter(p => p.joukkue === team.id);
    }

    /**
     * Return the codes for Rasti
     * @param rastiArr - Array of rastit
     * @returns {any} - Codes for rastit
     */
    static getKoodit(rastiArr) {
        return this.getRastit()
            .filter(function (e) {
                return rastiArr.indexOf(e.id.toString()) > -1;
            })
            .map(x => x.koodi);
    }

    /**
     * Return filtered array with only unique values
     * @param arr - Array to process
     * @returns {any} - Filtered array
     */
    static getUnique(arr) {
        return arr.filter(this.returnUniqueValues);
    }

    /**
     * Return unique values
     * @param value - Array
     * @param index - Index of the value
     * @param self -
     * @returns {boolean} - Is the value unique
     */
    static returnUniqueValues(value, index, self) {
        return self.indexOf(value) === index;
    }

    /**
     * Converts array's elements to a string
     * @param arr - Array to process
     * @returns {any} - Mapped array
     */
    static arrayElementsToString(arr) {
        return arr.map(x => x.toString());
    }

    /**
     * Returns the first character in a string of every element of array
     * @param arr - Array to process
     * @returns {any} - Array of first characters
     */
    static getFirstNumber(arr) {
        return arr.map(x => parseInt(x.toString()[0]));
    }

    /**
     * parses array elements to integer
     * @param arr - Array to process
     * @returns {any} - Array with only int elements
     */
    static parseArrayToInt(arr) {
        return arr
            .filter(function (x) {
                return /^\d/.test(x);
            })
            .map(x => parseInt(x));
    }

    static insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    /**
     * Returns the time used by a team
     * @param team - The team handled
     * @returns {string} - Time for the team
     */
    static getAika(team) {
        let aikaString = '00:00:00';
        const kaydytRastit = this.getKaydytRastit(team).filter(function (rasti) {
            return rasti.aika !== '';
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
            aikaString = `${hours}:${min}:${sec}`;
        } catch (e) {
            aikaString = '00:00:00';
        }
        return aikaString;
    }

    /**
     * Return an array of rastis whose if match with rastiID
     * @param rastiID - Id to check
     * @returns {any} - returns all matching rastit
     */
    static getMatchingRasti(rastiID: string) {
        return util.rastit.filter(rasti => rasti.id == rastiID)[0];
    }

    /**
     * Return the distance traveled by a team
     * @param team - Team to process
     * @returns {number} - Distance traveled
     */
    static getMatka(team) {
        let matka = 0;
        const kaydytRastit = util.getKaydytRastit(team).filter(function (rasti) {
            return rasti.aika !== '';
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
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(util.deg2rad(lat1)) * Math.cos(util.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c; // Distance in km
        return d;
    }

    /**
     * converts degrees to radian
     * @param deg - Degree to convert
     * @returns {number} - Radians from degredd
     */
    static deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    /**
     * Checks if the string includes a number
     * @param myString - String to check
     * @returns {boolean} - Whether it returns true or false
     */
    static hasNumber(myString) {
        return /\d/.test(myString);
    }

    /**
     * Checks if the string starts with a number
     * @param myString - String to check
     * @returns {boolean} - Whether it returns true or false
     */
    static startsWithNumber(myString){
        return /^\d/.test(myString;)
    }

    /**
     * Returns document by id (Just to shorten the getElementById
     * @param id - ID to get
     * @returns {HTMLElement | null} - Returned element
     */
    static getByID(id) {
        return document.getElementById(id);
    }

    /**
     * Returns document by id (Just to shorten the getElementsByTagName
     * @param tag - Tag to search
     * @returns {NodeListOf<HTMLElementTagNameMap[keyof HTMLElementTagNameMap]>} - Elements with tag
     */
    static getByTag(tag) {
        return document.getElementsByTagName(tag);
    }

    /**
     * Return input values from an array
     * @param form - The form to check
     * @returns {any[]} - Form values
     */
    static mapForm(form) {
        return Array.from(form.getElementsByTagName('input'));
    }

    /**
     * Toggles HTMLDOM element visibility
     * @param id - Id to toggle
     */
    static toggleDiv(id) {
        let div = util.getByID(id);
        div.style.display = div.style.display == 'none' ? 'block' : 'none';
    }

    /**
     * Removes the element
     * @param elemID - ID of element to remove
     */
    static removeEl(elemID) {
        let elem = util.getByID(elemID);
        if (elem.parentNode) {
            elem.parentNode.removeChild(elem);
        }
    }
}

/**
 * Runs when everything has loaded
 */
window.onload = function () {
    TulosPalvelu.main();
};
