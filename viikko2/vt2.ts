"use strict";

const printDebug = false;
let editModeOn = false;

let tulosPalveluData = data;

/**
 * Main class
 */
class TulosPalvelu {
    /**
     * The main function
     * I like to have this to not accidentally executing something unwanted
     */
    public static main(): void {
        let header = document.createElement("div");
        header.setAttribute("id", "header");
        let container = document.createElement("div");
        container.setAttribute("id", "container");
        let form_container = document.createElement("div");
        form_container.setAttribute("id", "form_container");
        let rasti_container = document.createElement("div");
        rasti_container.setAttribute("id", "rasti_container");
        rasti_container.setAttribute("class", "card");
        let joukkue_container = document.createElement("div");
        joukkue_container.setAttribute("id", "joukkue_container");
        let editJoukkueCard = document.createElement("div");
        editJoukkueCard.setAttribute("id", "joukkue_body");
        editJoukkueCard.setAttribute("class", "card");
        document.getElementById("tupa").setAttribute("class", "card");
        document.body.appendChild(rasti_container);
        document.body.appendChild(joukkue_container);
        create.table(util.getJoukkueet(tulosPalveluData));
        create.form("rasti", "Uusi rasti");
        create.form("joukkue", "Uusi joukkue");
        create.createEditButtons();
        create.setEditButtons();
        util.wrap(document.body.getElementsByTagName("h1")[0], header);
        util.wrap(document.body.getElementsByTagName("h2")[0], rasti_container);
        util.wrap(util.getByID("form_lisaaRasti"), rasti_container);
        util.wrap(util.getByID("joukkue"), editJoukkueCard);
        util.wrap(util.getByID("form_lisaaJoukkue"), editJoukkueCard);
        joukkue_container.appendChild(editJoukkueCard);
        util.wrap(util.getByID("tupa"), container);
        util.wrap(joukkue_container, form_container);
        util.wrap(rasti_container, form_container);
        util.wrap(form_container, container);
        let rastiLeimaukset = create.card("Rastileimaukset", "Tarkastele rastileimauksia");
        let link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", "https://fonts.googleapis.com/css?family=Roboto");
        document.head.appendChild(link);
        joukkue_container.appendChild(rastiLeimaukset);
        create.rastiLeimaukset();
        util.sortTable(document.getElementById("tulosTable"), 0);
        util.sortTable(document.getElementById("tulosTable"), 0);
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
        this.lon = "";
        this.koodi = "";
        this.lat = "";
        this.id = util.randomInt(16);
    }
}

/**
 * Class to handle the controlling functions
 */
class Controller {
    static editedCellContent: any;
    static teamIndex: number;
    static arrayOfLeimaukset: any;
    static editedJoukkue: Joukkue;
    static currentSort: number[] = [4, 0, 0, 0, 0];
    static leimausCount: number = 0;
    private static editedCellType: string;

    static jasenInputCount(): number {
        return document.getElementById("jasenet_fieldset").getElementsByTagName("input").length;
    }

    static jasenInputValues() {
        return document.getElementById("jasenet_fieldset").getElementsByTagName("input");
    }

    static joukkueFormInputs() {
        return document.getElementById("form_lisaaJoukkue").getElementsByTagName("input");
    }

    static jasenRows(): NodeListOf<Element> {
        return document.getElementById("jasenet_fieldset").getElementsByClassName("formRow");
    }

    static removeExtraJasenInputs(): void {
        let rows: NodeListOf<Element> = Controller.jasenRows();
        if (rows.length > 2)
            for (let i = rows.length - 1; i >= 2; i--) {
                util.removeElementByNode(rows[i]);
            }
    }

    /**
     * Creates a new rasti and saves it to rastis
     * @param e - Event to prevent button doing something evil
     */
    static newRasti(e) {
        if (e.preventDefault) e.preventDefault();
        let form: HTMLElement = util.getByID("form_lisaaRasti");
        let formData: FormData = new FormData(form);
        let rasti: Object = {};
        let skip = false;
        rasti.kilpailu = util.randomInt(16);
        for (let pair of formData.entries()) {
            if (pair[1] === "") skip = true;
            if (pair[1] === "rand") {
                rasti[pair[0].substring(0, 3)] = util.getRandomPoint().toString();
            } else if (pair[0] !== "koodi"){
                rasti[pair[0].substring(0, 3)] = pair[1].toString();
            } else {
                rasti[pair[0]] = pair[1].toString();
            }
        }
        if (!skip) {
            rasti.id = util.randomInt(16);
            tulosPalveluData.rastit.push(rasti);
            form.reset();
        }
        console.log(tulosPalveluData.rastit);
    }

    /**
     * Saves the team to tulosPalveluData
     * @param e - Event to prevent button doing something evil
     */
    static saveJoukkue(e) {
        e.preventDefault();
        let form: HTMLFormElement = util.getByID("form_lisaaJoukkue");
        let formData = new FormData(form);
        let values = Controller.joukkueFormInputs();
        if (editModeOn) {
            Controller.editedJoukkue = util.getJoukkueet(tulosPalveluData)[Controller.teamIndex];
            console.log(Controller.editedJoukkue);
            Controller.editedJoukkue.nimi = Controller.joukkueFormInputs()[0].value;
            Controller.editedJoukkue.jasenet = [];
            Controller.editedJoukkue.id = util.getJoukkueet(tulosPalveluData)[Controller.teamIndex].id;
            util.updateJoukkue(Controller.editedJoukkue);
            for (let input of document.getElementById("jasenet_fieldset").getElementsByTagName("input")) {
                LOGGER.debug(`Adding a new member: ${input.value}`);
                Controller.editedJoukkue.jasenet.push(input.value);
            }
            Controller.updateJoukkueTable(Controller.editedJoukkue, form);
            create.toggleEditButtons();
        } else if (!Controller.formEmpty(form)) {
            let joukkue: Joukkue = new Joukkue(values[0].value, "00:00:00", [], util.randomInt(16), "2h", 0);
            formData.forEach(function (value, key) {
                if (key.startsWith("jäsen")) {
                    joukkue.jasenet.push(value);
                } else {
                    joukkue[key] = value;
                }
            });
            joukkue.pisteet = 0;
            joukkue.aika = "00:00:00";
            joukkue.matka = 0;
            joukkue.sarja = "2h";
            Controller.appendJoukkueRow(joukkue);
        }
        editModeOn = false;
        Controller.removeExtraJasenInputs();
        create.updateLeimausTable();
        form.reset();
        document.getElementsByTagName("legend")[0].textContent = "Uusi joukkue";
        document.getElementById("joukkueButton").disabled = true;
    }

    static appendJoukkueRow(joukkue): void {
        tulosPalveluData.sarjat[1].joukkueet.push(joukkue);
        util.getByID("tulosTable").appendChild(create.teamRow(joukkue));
        let sort = Controller.currentSort;
        const sortedTable = document.getElementById("tulosTable");
        let initialSort = Controller.currentSort;
        for (let i = 0; i < 5; i++) {
            if (Controller.currentSort[i] == 4) {
                console.log(`Sorting column ${i}`);
                util.sortTable(sortedTable, i);
            }
        }
    }

    /**
     * Checks whether the form is empty or not
     * @returns {boolean} - Is the form valid
     */
    static validateForm(formID, buttonID) {
        let inputs: NodeListOf<HTMLInputElement> = document.getElementById(formID).getElementsByTagName("input");
        let disableButtons = false;
        for (let input of inputs) if (input.value == null || input.value == "") disableButtons = true;
        util.getByID(buttonID).disabled = disableButtons;
    }

    /**
     * Checks whether the form is empty
     * @param form - Form to check
     * @returns {boolean} - True if empty, false if not
     */
    static formEmpty(form): boolean {
        return util.mapForm(form).map(x => x.value !== "").length <= 0;
    }

    /**
     * Set validations for input fields
     * @param object - Object to set the validation to
     */
    static setValidations(object) {
        object.onfocusout = function () {
            Controller.validateForm("form_lisaaJoukkue", "joukkueButton");
        };
        object.oninput = function () {
            Controller.validateForm("form_lisaaJoukkue", "joukkueButton");
        };
    }

    /**
     * Updates team tulosPalveluData
     * @param team - Team to update
     * @param form - Resets the form where the tulosPalveluData is coming from
     */
    static updateJoukkueTable(team, form): void {
        util.getJoukkueet(tulosPalveluData)[Controller.teamIndex] = team;
        let joukkueet = util.getJoukkueet(tulosPalveluData);
        let parentRow;
        for (let i = 0; i < joukkueet.length; i++) {
            if (joukkueet[i].id === team.id) {
                Controller.teamIndex = i;
                parentRow = Controller.getTeamFromTable(joukkueet[i].id);
                joukkueet[i] = team;
                break;
            }
        }
        let teamEl = parentRow.getElementsByTagName("td")[1];
        let jasenString: string = team.jasenet != null ? team.jasenet.join(", ") : "";
        let teamAh = create.element("a", team.nimi);
        teamAh.href = `javascript:Controller.editJoukkue("${team.id.toString()}")`;
        teamAh.id = team.id;
        teamEl.textContent = "";
        teamEl.appendChild(teamAh);
        teamEl.appendChild(document.createElement("br"));
        teamEl.appendChild(document.createTextNode(jasenString));
        form.reset();
    }

    static updateJoukkueStats() {
        let joukkue = Controller.editedJoukkue;
        let joukkueet = util.getJoukkueet(tulosPalveluData);
        let parentRow;
        for (let i = 0; i < joukkueet.length; i++) {
            if (joukkueet[i].id === joukkue.id) {
                Controller.teamIndex = i;
                parentRow = Controller.getTeamFromTable(joukkueet[i].id);
                joukkueet[i] = joukkue;
                break;
            }
        }
        Controller.editedJoukkue.pisteet = util.getPoints(Controller.editedJoukkue);
        Controller.editedJoukkue.aika = util.getAika(Controller.editedJoukkue);
        Controller.editedJoukkue.matka = util.getMatka(Controller.editedJoukkue);
        parentRow.getElementsByTagName("td")[2].textContent = Controller.editedJoukkue.pisteet;
        if (Controller.editedJoukkue.aika != undefined) {
            parentRow.getElementsByTagName("td")[3].textContent = Controller.editedJoukkue.aika;
        } else {
            parentRow.getElementsByTagName("td")[3].textContent = "00:00:00";
        }
        parentRow.getElementsByTagName("td")[4].textContent = Controller.editedJoukkue.matka + " km";
    }

    static getTeamFromTable(teamID: string): HTMLElement {
        const teamNames = document.getElementById("tulosTable").getElementsByTagName("a");
        let returnable;
        for (let row of teamNames) {
            if (row.id == teamID) {
                returnable = row.parentNode.parentNode;
            }
        }
        return returnable;
    }

    /**
     * Edits a team
     * @param jj - Name of the team
     */
    static editJoukkue(teamID) {
        const fields = this.jasenInputValues();
        if (!editModeOn) {
            document.getElementsByTagName("legend")[0].textContent = "Muokkaa joukkuetta";
            editModeOn = true;
            create.toggleEditButtons();
            let joukkueet = util.getJoukkueet(tulosPalveluData);
            for (let i = 0; i < joukkueet.length; i++) {
                if (joukkueet[i].id.toString() === teamID) {
                    Controller.teamIndex = i;
                    Controller.editedJoukkue = joukkueet[i];
                }
            }
            create.updateLeimausTable(Controller.editedJoukkue);
            this.joukkueFormInputs()[0].value = Controller.editedJoukkue.nimi;
            for (let i = 0; i < Controller.editedJoukkue.jasenet.length; i++) {
                if (i > 1) {
                    create.formRow(util.getByID("jasenet_fieldset"), `Jäsen ${i + 1}`, false, true, util.getByID("p_jasenButton"), true, i.toString());
                    fields[i].value = Controller.editedJoukkue.jasenet[i].toString();
                } else {
                    fields[i].value = Controller.editedJoukkue.jasenet[i].toString();
                }
            }
            document.getElementById("addLeimausButton").disabled = false;
        }
    }

    static checkCheckboxes() {
        let arr = [];
        let count = 0;
        let showButton = false;
        for (let checkbox of document.getElementById("leimausTable").getElementsByTagName("input")) {
            if (checkbox.checked) {
                count++;
                showButton = true;
                arr.push(checkbox);
            }
        }
        document.getElementById("removeLeimausButton").disabled = !showButton;
        Controller.arrayOfLeimaukset = arr;
    }

    static removeLeimaukset() {
        for (let leimaus of Controller.arrayOfLeimaukset) {
            let leimausID = leimaus.parentNode.parentNode.getElementsByTagName("td")[2].textContent;
            for (let i = 0; i < tulosPalveluData.tupa.length; i++) {
                if (tulosPalveluData.tupa[i].joukkue == Controller.editedJoukkue.id && tulosPalveluData.tupa[i].rasti == leimausID) {
                    tulosPalveluData.tupa.splice(i, 1);
                }
            }
            util.removeElementByNode(leimaus.parentNode.parentNode);
        }
        Controller.updateJoukkueStats();
    }

    static setValidateRastiField(cell) {
        const aikaRegWhole = /^([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-9]{2}):([0-9]{2}):([0-9]{2})/;
        if (cell.textContent.match(aikaRegWhole)) {
            Controller.editedCellType = "aika";
        } else {
            Controller.editedCellType = "rasti";
        }
        Controller.editedCellContent = cell.textContent;
    }

    static validateRastiField(cell) {
        const cellValue = cell.textContent;
        const rastiRegex = /^([0-9]{16})/;
        const aikaRegWhole = /^([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-9]{2}):([0-9]{2}):([0-9]{2})/;
        const rastiID = cell.parentNode.getElementsByTagName("td")[2].textContent
        if (Controller.editedCellType == "aika") {
            cell.textContent = Controller.editedCellContent;
            if (cellValue.match(aikaRegWhole)) {
                for (let i = 0; i < tulosPalveluData.tupa.length; i++) {
                    if (tulosPalveluData.tupa[i].joukkue == Controller.editedJoukkue.id && tulosPalveluData.tupa[i].rasti == rastiID) {
                        tulosPalveluData.tupa[i].aika = cellValue;
                        cell.textContent = cellValue;
                    }
                }
            }
        } else {
            cell.textContent = Controller.editedCellContent;
            if (cellValue.match(rastiRegex)) {
                for (let i = 0; i < tulosPalveluData.tupa.length; i++) {
                    if (tulosPalveluData.tupa[i].joukkue == Controller.editedJoukkue.id && tulosPalveluData.tupa[i].rasti == parseInt(cell.textContent)) {
                        tulosPalveluData.tupa[i].rasti = cellValue;
                        cell.textContent = cellValue;
                    }
                }
            }
        }
        Controller.updateJoukkueStats();
    }

    static removeLeimaus(row) {
        let leimausID = row.getElementsByTagName("td")[2].textContent;
        for (let i = 0; i < tulosPalveluData.tupa.length; i++) {
            if (tulosPalveluData.tupa[i].joukkue == Controller.editedJoukkue.id && tulosPalveluData.tupa[i].rasti == leimausID) {
                tulosPalveluData.tupa.splice(i, 1);
            }
        }
        util.removeElementByNode(row);
        Controller.updateJoukkueStats();
    }

    /**
     * Sets an array to see which element has been sorted the most recently.
     * @param {number} index
     */
    static setSort(index: number): void {
        Controller.currentSort = Controller.currentSort.map(x => x == 0 ? 0 : x - 1);
        Controller.currentSort[index] = 4;
        console.log(Controller.currentSort);
    }
}

class create {
    static formID = 0;
    static emptyForm = true;
    static legendText = "Uusi joukkue";

    /**
     * Creates the form buttons
     */
    static createEditButtons() {
        create.submitFormButton(util.getByTag("fieldset")[1], "editButton", "Tallenna", true);
        util.getByID("editButton").addEventListener("click", Controller.saveJoukkue);
        create.submitFormButton(util.getByTag("fieldset")[1], "cancelButton", "Peruuta", true);
        util.getByID("cancelButton").onclick = function () {
            Controller.removeExtraJasenInputs();
            let form: HTMLFormElement = util.getByID("form_lisaaJoukkue");
            document.getElementsByTagName("legend")[0].textContent = "Uusi joukkue";
            form.reset();
            create.setEditButtons();
            create.updateLeimausTable();
            editModeOn = false;
        };
    }

    /**
     * Set the visibility of form buttons
     */
    static setEditButtons() {
        util.getByID("joukkueButton").style.display = "block";
        util.getByID("editButton").style.display = "none";
        util.getByID("cancelButton").style.display = "none";
    }

    /**
     * Toggles the state of edit buttons
     */
    static toggleEditButtons() {
        let legend = document.getElementsByTagName("legend")[0];
        legend.textContent = this.legendText;
        util.toggleDiv("joukkueButton");
        util.toggleDiv("editButton");
        util.toggleDiv("cancelButton");
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
            this.formRow(fieldSet, "Latitude", true, false, "", false, "", "Rastin pituusaste");
            this.formRow(fieldSet, "Longitude", true, false, "", false, "", "Rastin leveysaste");
            this.formRow(fieldSet, "Koodi", true, false, "", false, "", "Rastin koodi");
            this.submitFormButton(fieldSet, "rasti", "Lisää rasti");
        } else if (type === "joukkue") {
            form.removeAttribute("action");
            form.id = "form_lisaaJoukkue";
            this.formID = 1;
            this.formRow(fieldSet, "Nimi", true, false, false, true, "", "Joukkueen nimi");
            let fieldSetJasenet: HTMLElement = this.element("fieldSet", "", "jasenet_fieldset");
            let legendJasenet: HTMLElement = this.element("legend", "Jäsenet");
            fieldSet.appendChild(fieldSetJasenet);
            fieldSetJasenet.appendChild(legendJasenet);
            this.formRow(fieldSetJasenet, "Jäsen 1", true, false, false, true, "1");
            this.formRow(fieldSetJasenet, "Jäsen 2", true, false, false, true, "2");
            let buttonRow = this.submitFormButton(fieldSetJasenet, "jasenButton", "Lisää jäsen", true);
            document.getElementById("jasenButton").addEventListener("click", create.addNewJasenRow);
            let joukkueButton = this.submitFormButton(fieldSet, "joukkueButton", "Lisää joukkue", true);
            document.getElementById("joukkueButton").addEventListener("click", Controller.saveJoukkue);
            util.getByID("joukkueButton").disabled = true;
        } else {
            return;
        }
    }

    static addNewJasenRow(e) {
        e.preventDefault();
        create.formRow(
            util.getByID("jasenet_fieldset"),
            `Jäsen ${Controller.jasenInputCount() + 1}`,
            false,
            true,
            util.getByID("p_jasenButton"),
            true,
            (Controller.jasenInputCount() + 1).toString()
        );
        util.getByID("cancelButton").style.display = "block";
    }

    /**
     * Creates an row with input to a form
     * @param appendable - The top level element, most likely fieldSet
     * @param inputLabel - Label for the input
     * @param required - Is the input required
     * @param {boolean} before - Is the row inserted before some element
     * @param beforeElement - Which element the row is inserted before
     * @param {boolean} validate - Does the function validate when exited
     * @param id
     */
    static formRow(appendable, inputLabel: string, required?, before?: boolean, beforeElement?, validate?, id?: string, addText?: string) {
        let row = this.element("p");
        row.setAttribute("class", "formRow");
        row.appendChild(this.input(inputLabel, required, validate, addText));
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
        let row: HTMLParagraphElement = this.element("p");
        row.id = "p_" + id;
        let button = this.element("button", inputLabel);
        if (!disableSubmit) button.type = "submit";
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
     * @param addText
     * @returns {HTMLParagraphElement} - Returns the input inside a p
     */
    static input(inputLabel, required?, validate?, addText?) {
        let label: HTMLLabelElement = this.element("label");
        label.setAttribute("class", "input");
        let input = this.element("input");
        let inputID = `input_${inputLabel}`;
        if (required) input.required = "required";
        if (validate) Controller.setValidations(input);
        input.type = "text";
        input.placeholder = inputLabel;
        input.val = "";
        input.name = inputLabel.toLowerCase();
        label.htmlFor = inputID;
        input.class = "formInput";
        label.appendChild(input);
        if (addText != undefined) label.appendChild(this.element("span", addText));
        return label;
    }

    /**
     * Creates tables to be used in the tulospalvelu
     * These are not modular and will not be
     * @param arr - The array to create the table from
     */
    static table(arr) {
        let joukkueet: any = arr;
        util.sortArrayProperty(joukkueet, "sarja");
        let tulosTable: HTMLTableElement = create.element("table", "", "tulosTable");
        let tulosCaption: HTMLTableCaptionElement = document.createElement("caption");
        let firstRow: HTMLTableRowElement = document.createElement("tr");
        let sarjaHeader: HTMLTableHeaderCellElement = this.element("th", "Sarja");
        sarjaHeader.addEventListener("click", (e: Event) => util.sortTable(tulosTable, 0));
        firstRow.appendChild(sarjaHeader);
        let joukkueHeader = this.element("th", "Joukkue");
        joukkueHeader.addEventListener("click", (e: Event) => util.sortWithSeries(tulosTable, 1));
        firstRow.appendChild(joukkueHeader);
        let pisteHeader = this.element("th", "Pisteet");
        pisteHeader.addEventListener("click", (e: Event) => util.sortWithSeries(tulosTable, 2));
        firstRow.appendChild(pisteHeader);
        let aikaHeader = this.element("th", "Aika");
        aikaHeader.addEventListener("click", (e: Event) => util.sortTable(tulosTable, 3));
        firstRow.appendChild(aikaHeader);
        let matkaHeader = this.element("th", "Matka");
        matkaHeader.addEventListener("click", (e: Event) => util.sortTable(tulosTable, 4));
        firstRow.appendChild(matkaHeader);
        tulosCaption.textContent = "Tulokset";
        tulosTable.appendChild(tulosCaption);
        tulosTable.appendChild(firstRow);
        util.getByID("tupa").appendChild(tulosTable);
        for (let joukkue of joukkueet) {
            joukkue.aika = util.getAika(joukkue);
            joukkue.matka = util.getMatka(joukkue);
            tulosTable.appendChild(create.teamRow(joukkue));
            util.getByID(joukkue.id).addEventListener("onclick", Controller.editJoukkue, false);
        }
    }

    /**
     * The row to be inserted into the array
     * @param team - Team element to insert into the row
     * @returns {HTMLTableRowElement} - Row element
     */
    static teamRow(team) {
        let jasenString: string = team.jasenet != null ? team.jasenet.join(", ") : "";
        let row = document.createElement("tr");
        let seriesEl = create.element("td", team.sarja);
        let teamEl = document.createElement("td");
        let teamAh = create.element("a", team.nimi);
        let pointsEl = create.element("td", team.pisteet);
        let aika = create.element("td", (team.aika == undefined ? "00:00:00" : team.aika));
        let matka = create.element("td", team.matka + " km");
        teamAh.href = `javascript:Controller.editJoukkue("${team.id.toString()}")`;
        teamAh.id = team.id;
        row.appendChild(seriesEl);
        row.appendChild(teamEl);
        teamEl.appendChild(teamAh);
        teamEl.appendChild(document.createElement("br"));
        teamEl.appendChild(document.createTextNode(jasenString));
        row.appendChild(pointsEl);
        row.appendChild(aika);
        row.appendChild(matka);
        return row;
    }

    static card(title: string, desription: string): HTMLElement {
        let cardContainer: HTMLElement = document.createElement("div");
        let cardTitle: HTMLElement = document.createElement("h2");
        cardTitle.textContent = title;
        cardContainer.id = title.toLowerCase().replace(/ /gi, "_");
        cardContainer.setAttribute("class", "card");
        cardContainer.appendChild(cardTitle);
        return cardContainer;
    }

    static rastiLeimaukset() {
        let leimaustableContainer = create.element("div", "", "leimausTableContainer");
        let leimausTable = create.element("table", "", "leimausTable");
        let headerRow = document.createElement("tr");
        headerRow.appendChild(create.element("th", ""));
        headerRow.appendChild(create.element("th", "Aika"));
        headerRow.appendChild(create.element("th", "Rasti"));
        headerRow.appendChild(create.element("th", ""));
        leimausTable.appendChild(headerRow);
        leimaustableContainer.appendChild(leimausTable);
        document.getElementById("rastileimaukset").appendChild(leimaustableContainer);
        create.submitFormButton(document.getElementById("rastileimaukset"), "removeLeimausButton", "Poista valitut", true);
        create.submitFormButton(document.getElementById("rastileimaukset"), "addLeimausButton", "Lisää leimaus", true);
        document.getElementById("removeLeimausButton").disabled = true;
        document.getElementById("removeLeimausButton").addEventListener("click", Controller.removeLeimaukset, false);
        document.getElementById("addLeimausButton").addEventListener("click", create.newLeimausRow, false);
        document.getElementById("addLeimausButton").disabled = true;
    }

    static updateLeimausTable(joukkue?) {
        if (joukkue != undefined) {
            let leimaukset = util.getKaydytRastit(joukkue);
            let index = 0;
            let leimausTable = document.getElementById("leimausTable");
            for (let rasti of leimaukset) {
                leimausTable.appendChild(create.leimausRow(rasti.aika, rasti.rasti, index));
                index++;
            }
        } else {
            let rows: NodeListOf<HTMLElementTagNameMap["tr"]>;
            rows = document.getElementById("leimausTable").getElementsByTagName("tr");
            if (rows.length > 1) {
                for (let i = rows.length - 1; i >= 1; i--) {
                    util.removeElementByNode(rows[i]);
                }
            }
        }
    }

    static newLeimausRow() {
        let aika = new Date();
        let aikaString = util.ISODateString(aika);
        let index = document.getElementById("leimausTable").getElementsByTagName("input").length;
        let rastinum = util.randomInt(16);
        const leimausRow = create.leimausRow(aikaString, rastinum.toString(), index);
        document.getElementById("leimausTable").appendChild(leimausRow);
        tulosPalveluData.tupa.push({aika: aikaString, rasti: rastinum, joukkue: Controller.editedJoukkue.id});
        Controller.updateJoukkueStats();
    }

    static leimausRow(aika: string, rasti: string, indexID): HTMLElement {
        let row = document.createElement("tr");
        let selectCell = create.element("td");
        let selectCheckBox = create.element("input");
        let selectCheckBoxLabel = create.element("label");
        let selectCheckBoxLabeSpan = create.element("span");
        selectCheckBox.type = "checkbox";
        selectCheckBox.setAttribute("class", "checkbox");
        selectCheckBox.id = `checkbox_${indexID}`;
        selectCheckBox.addEventListener("click", Controller.checkCheckboxes, false);
        selectCheckBoxLabel.htmlFor = `checkbox_${indexID}`;
        selectCell.appendChild(selectCheckBox);
        selectCheckBoxLabel.appendChild(selectCheckBoxLabeSpan);
        selectCell.appendChild(selectCheckBoxLabel);
        let aikaCell = create.element("td", aika);
        aikaCell.contentEditable = "true";
        aikaCell.addEventListener('focusout', function (e) {
            Controller.validateRastiField(aikaCell)
        }, true);
        aikaCell.addEventListener('focus', function (e) {
            Controller.setValidateRastiField(aikaCell)
        }, true);
        let rastiCell = create.element("td", rasti);
        rastiCell.contentEditable = "true";
        rastiCell.addEventListener('focusout', function (e) {
            Controller.validateRastiField(rastiCell)
        }, true);
        rastiCell.addEventListener('focus', function (e) {
            Controller.setValidateRastiField(rastiCell)
        }, true);
        let poistoCell = create.element("td");
        let poistoButton = create.element("span", "×");
        poistoButton.setAttribute("class", "removeButton");
        let poistoid = Controller.leimausCount;
        poistoButton.id = `leimaus_${poistoid}`;
        poistoButton.addEventListener("click", function () {
            Controller.removeLeimaus(row)
        }, false);
        poistoCell.appendChild(poistoButton);
        row.appendChild(selectCell);
        row.appendChild(aikaCell);
        row.appendChild(rastiCell);
        row.appendChild(poistoCell);
        Controller.leimausCount += 1;
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

    static sortWithSeries(table, col) {
        this.sortTable(table, col);
    }

    /**
     * Table sorting function
     * Originally taken from w3c but edited to fit my needs
     * @param ediTable - Table to edit
     * @param col - Column to sort by
     */
    static sortTable(ediTable, col) {
        let header = ediTable.getElementsByTagName("th")[col];
        for (let item of ediTable.getElementsByTagName("th")) {
            if (item.textContent[item.textContent.length - 1] == "↑" || item.textContent[item.textContent.length - 1] == "↓") {
                item.textContent = item.textContent.substring(0, item.textContent.length - 2);
            }
        }
        let rows,
            i,
            x,
            y,
            shouldSwitch,
            switchCount = 0;
        let table = ediTable;
        let switching = true;
        let dir = "asc";
        while (switching) {
            switching = false;
            rows = table.getElementsByTagName("tr");
            for (i = 1; i < rows.length - 1; i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("td")[col];
                y = rows[i + 1].getElementsByTagName("td")[col];
                if (dir == "asc") {
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
                } else if (dir == "desc") {
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
                switchCount++;
            } else {
                if (switchCount == 0 && dir == "asc") {
                    dir = "desc";
                    switching = true;
                }
            }
        }
        if (dir == "asc") {
            if (header.textContent[header.textContent.length - 1] == "↑" || header.textContent[header.textContent.length - 1] == "↓") {
                header.textContent = header.textContent.substring(0, header.textContent.length - 1);
                header.textContent = header.textContent + " ↑";
            } else {
                header.textContent = header.textContent + " ↑";
            }
        } else if (dir == "desc") {
            if (header.textContent[header.textContent.length - 1] == "↑" || header.textContent[header.textContent.length - 1] == "↓") {
                header.textContent = header.textContent.substring(0, header.textContent.length - 1);
                header.textContent = header.textContent + " ↓";
            } else {
                header.textContent = header.textContent + " ↓";
            }
        }
        Controller.setSort(col);
    }

    /**
     * Returns the joukkueet in a nice array
     * @param tulosPalveluData-  The json object
     * @returns {Joukkue[]} - Returns the joukkeet as Joukkue array
     */
    static getJoukkueet(tulosPalveluData) {
        let arr: Joukkue[] = [];
        for (let i = 0; i < tulosPalveluData.sarjat.length; i++) {
            for (let j = 0; j < tulosPalveluData.sarjat[i].joukkueet.length; j++) {
                let joukkue = new Joukkue(
                    tulosPalveluData.sarjat[i].joukkueet[j].nimi,
                    tulosPalveluData.sarjat[i].joukkueet[j].last,
                    tulosPalveluData.sarjat[i].joukkueet[j].jasenet,
                    tulosPalveluData.sarjat[i].joukkueet[j].id,
                    tulosPalveluData.sarjat[i].nimi,
                    0
                );
                joukkue.pisteet = this.getPoints(joukkue);
                arr.push(joukkue);
            }
        }
        return arr;
    }

    static updateJoukkue(joukkue) {
        for (let sarja of tulosPalveluData.sarjat) {
            for (let team of sarja.joukkueet) {
                if (team.id === joukkue.id) {
                    team.nimi = joukkue.nimi;
                    team.jasenet = joukkue.jasenet;
                }
            }
        }
    }

    /**
     * Returns the points of the team
     * @param team - Team to get the numbers
     * @returns {number} - Team points
     */
    static getPoints(team) {
        const kaydytRastit = util.getUnique(util.getKaydytRastitID(team).sort());
        let pisterastit = util.getKoodit(util.arrayElementsToString(kaydytRastit)).sort();
        let pisteet: number = eval(util.getFirstNumber(util.parseArrayToInt(pisterastit)).join("+"));
        return pisteet !== undefined ? pisteet : 0;
    }

    /**
     * Gets all of the rastit in an array
     * @returns {any} - Array of rastit
     */
    static getRastit() {
        return tulosPalveluData.rastit.map(x => x);
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
        return tulosPalveluData.tupa.filter(p => p.joukkue === team.id).map(x => x.rasti);
    }

    /**
     * Returns the visisted rastit
     * @param team - Team to process
     * @returns {any} - Rasti array
     */
    static getKaydytRastit(team) {
        return tulosPalveluData.tupa.filter(p => p.joukkue === team.id);
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
        let aikaString = "00:00:00";
        const kaydytRastit = this.getKaydytRastit(team).filter(function (rasti) {
            return rasti.aika !== "";
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
            aikaString = "00:00:00";
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
            return rasti.aika !== "";
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
    static startsWithNumber(myString) {
        return /^\d/.test(myString);
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
        return Array.from(form.getElementsByTagName("input"));
    }

    /**
     * Toggles HTMLDOM element visibility
     * @param id - Id to toggle
     */
    static toggleDiv(id: string) {
        try {
            let div = util.getByID(id);
            div.style.display = div.style.display == "none" ? "block" : "none";
        } catch (err) {
            LOGGER.debug(`Could not find ID: ${id}`);
            LOGGER.debug(err);
        }
    }

    static wrap(toWrap, wrapper?) {
        wrapper = wrapper || document.createElement("div");
        toWrap.parentNode.appendChild(wrapper);
        return wrapper.appendChild(toWrap);
    }

    static ISODateString(d) {
        function pad(n) {
            return n < 10 ? '0' + n : n
        }

        return d.getUTCFullYear() + '-'
            + pad(d.getUTCMonth() + 1) + '-'
            + pad(d.getUTCDate()) + ' '
            + pad(d.getUTCHours()) + ':'
            + pad(d.getUTCMinutes()) + ':'
            + pad(d.getUTCSeconds())
    }

    static getRandomPoint(): number {
        return Math.round((Math.random() * 360 - 180) * 1000000) / 1000000
        // .toFixed() returns string, so ' * 1' is a trick to convert to number
    }

    /**
     * Removes the element
     * @param elemID - ID of element to remove
     */
    static removeEl(elemID) {
        let elem = util.getByID(elemID);
        try {
            if (elem.parentNode) {
                elem.parentNode.removeChild(elem);
            }
        } catch (err) {
            LOGGER.debug(`Failed removing node with id: ${elemID}`);
            LOGGER.debug(err);
        }
    }

    static removeElementByNode(node: Element) {
        try {
            if (node.parentNode) {
                LOGGER.debug(`Removing node: ${node}`);
                node.parentNode.removeChild(node);
            }
        } catch (err) {
            LOGGER.debug(`Failed removing node: ${node.nodeName}`);
            LOGGER.debug(err);
        }
    }
}

class LOGGER {
    static time: string = new Date().toLocaleString();

    static debug(message) {
        if (printDebug) console.log(`${this.time} ${message}`);
    }
}

/**
 * Runs when everything has loaded
 */
window.onload = function () {
    TulosPalvelu.main();
};
