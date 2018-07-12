// data-muuttuja sisältää kaiken tarvittavan ja on rakenteeltaan lähes samankaltainen kuin viikkotehtävässä 2
// Rastileimaukset on siirretty tupa-rakenteesta suoraan jokaisen joukkueen yhteyteen
//
// voit tutkia tarkemmin käsiteltävää tietorakennetta konsolin kautta
// tai json-editorin kautta osoitteessa http://jsoneditoronline.org/
// Jos käytät json-editoria niin avaa data osoitteesta:
// http://appro.mit.jyu.fi/tiea2120/vt/vt3/appData.json

"use strict";

let submitButton: HTMLButtonElement;
let applicationForm: HTMLFormElement;
let kisaForm: HTMLFormElement;
let joukkueet: Joukkue[];
let sarjat: Sarja[];
let kisat: Kisa[];
let rastit: Rasti[];
let editing = false;
let tempLeimaukset;
let tempID;
let tempJoukkue;
let appData = data;

/**
 * Main class
 */
class suunnistusApp {
    public static main(): void {
        this.setVariables();
        UI.initHandlers();
        document.getElementById("teamListContainer").appendChild(UI.getTeamList());
    }

    static setVariables(): void {
        applicationForm = <HTMLFormElement>document.getElementById("suunnistusForm");
        kisaForm = <HTMLFormElement>document.getElementById("kisaform");
        submitButton = <HTMLButtonElement>document.getElementById("submitFormButton");
        sarjat = appData.kisat[0].sarjat.map(
            e => new Sarja(e.nimi, e.kilpailu, e.matka, e.kesto, e.loppuaika, e.altKey, e.id)
        );
        joukkueet = appData.joukkueet.map(
            e =>
                new Joukkue(
                    e.nimi,
                    e.jasenet,
                    e.sarja,
                    e.seura,
                    e.id,
                    e.rastit.map(e => {
                        return new Rastileimaus(e.aika, parseInt(e.id.toString()));
                    }),
                    e.pisteet,
                    e.matka,
                    e.leimaustapa,
                    Util.getDate(new Date(e.luontiaika))
                )
        );
        kisat = appData.kisat.map(
            e =>
                new Kisa(e.nimi, e.id, new Date(e.loppuaika).getTime(), e.kesto, new Date(e.alkuaika).getTime(), sarjat)
        );
        rastit = appData.rastit.map(e => new Rasti(e.lon, e.koodi, e.lat, e.id, e.pisteet));
    }
}

/**
 * Class for UI Actions
 */
class UI {
    /**
     * Inits application handelers
     */
    static initHandlers(): void {
        applicationForm.addEventListener("submit", Validate.teamInput);
        kisaForm.addEventListener("submit", Validate.kisaInput);
        document.getElementById("series").appendChild(UI.getSarjaButtons());
        document.getElementById("sarjaListaus").appendChild(UI.getSarjaList());
        UI.setTeamHandlers();
        UI.setJasenHandlers();
        UI.setLeimausHandlers();
        UI.setKisaHandlers();
        UI.updateKisaSelect();
        UI.updateOptions();
        document.getElementById("rastiTable").appendChild(UI.leimausRow());
    }

    /**
     * Sets team handlers
     */
    static setTeamHandlers(): void {
        const teamInput: HTMLInputElement = applicationForm.querySelector("input[name=teamName]");
        const kisaSelect: HTMLSelectElement = <HTMLSelectElement>document.getElementById("kisaSelection");
        teamInput.onblur = function () {
            if (Validate.teamUnique(teamInput.value)) {
                teamInput.classList.remove("invalid");
            } else {
                teamInput.classList.add("invalid");
            }
        };
        kisaSelect.onchange = () => {
            let kisaID = parseInt(kisaSelect.options[kisaSelect.selectedIndex].value);
            document.getElementById("sarjaButtonContainer").remove();
            document.getElementById("series").appendChild(UI.getSarjaButtons(kisaID));
        };
        teamInput.addEventListener(
            "input",
            () => {
                if (teamInput.value.trim() === "") {
                    teamInput.setCustomValidity("Syötä nimi joukkueelle");
                } else {
                    teamInput.setCustomValidity("");
                }
            },
            false
        );
        teamInput.addEventListener(
            "invalid",
            function () {
                if (!Validate.teamUnique(teamInput.value)) {
                    this.setCustomValidity(`"${teamInput.value}" on jo käytössä, valitse toinen nimi!`);
                }
            },
            false
        );
    }

    /**
     * Sets handlers for jasen
     */
    static setJasenHandlers(): void {
        let jasenFields: HTMLInputElement[] = Array.from(applicationForm.querySelectorAll("input.jasenField"));
        jasenFields.forEach(field => {
            field.required = true;
            field.setCustomValidity("Syötä vähintään kaksi jäsentä");
            field.onblur = () => {
                if (Validate.getJasenet().length >= 2) {
                    jasenFields.forEach(e => {
                        e.setCustomValidity("");
                        e.required = false;
                    });
                } else {
                    jasenFields.forEach(e => {
                        e.setCustomValidity("Syötä vähintään kaksi jäsentä");
                        e.required = true;
                    });
                }
            };
        });
    }

    /**
     * Sets handlers for leimaus
     */
    static setLeimausHandlers(): void {
        let leimausBoxes: HTMLInputElement[] = Array.from(
            applicationForm.querySelectorAll("input.form_checkbox_leimaus")
        );
        leimausBoxes.forEach(box => {
            box.required = true;
            box.setCustomValidity("Valitse vähintään yksi leimaustapa");
            box.addEventListener("change", () => {
                if (Validate.getLeimaustapa().length >= 1) {
                    if (document.getElementById("boxError")) Util.removeElement("boxError");
                    leimausBoxes.forEach(e => {
                        e.setCustomValidity("");
                        e.required = false;
                    });
                } else {
                    document
                        .getElementById("punchSystem")
                        .appendChild(Util.errorMessage("Valitse vähintään yksi leimaustapa", "boxError"));
                    leimausBoxes.forEach(e => {
                        e.setCustomValidity("Valitse vähintään yksi leimaustapa");
                        e.required = true;
                    });
                }
            });
        });
    }

    /**
     * Sets handlers for kisa
     */
    static setKisaHandlers(): void {
        const kisaKesto: HTMLInputElement = kisaForm.querySelector("input[name=kisaKesto]"),
            kisaLoppu: HTMLInputElement = kisaForm.querySelector("input[name=kisaLoppu]"),
            kisaAlku: HTMLInputElement = kisaForm.querySelector("input[name=kisaAlku]"),
            kisaNimi: HTMLInputElement = kisaForm.querySelector("input[name=kisaNimi]");
        kisaNimi.addEventListener(
            "submit",
            function () {
                kisaNimi.setCustomValidity("");
                if (!Validate.kisaUnique(kisaNimi.value)) {
                    kisaNimi.setCustomValidity(`"${kisaNimi.value}" on jo käytössä, valitse toinen nimi!`);
                } else {
                    kisaNimi.setCustomValidity("");
                }
            },
            false
        );
        kisaNimi.onblur = function () {
            kisaNimi.setCustomValidity("");
            if (!Validate.kisaUnique(kisaNimi.value)) {
                kisaNimi.setCustomValidity(`"${kisaNimi.value}" on jo käytössä, valitse toinen nimi!`);
            } else {
                kisaNimi.setCustomValidity("");
            }
        };
        kisaAlku.onblur = () => {
            if (kisaKesto.value === "") {
                kisaLoppu.min = kisaAlku.value;
            } else if (kisaAlku.value !== "") {
                kisaLoppu.min = new Date(
                    new Date(kisaAlku.value).getTime() + parseInt(kisaKesto.value) * 3600000
                ).toLocaleString();
            }
        };
        kisaKesto.onchange = () => {
            if (kisaAlku.value !== "") {
                kisaLoppu.min = new Date(
                    new Date(kisaAlku.value).getTime() + parseInt(kisaKesto.value) * 3600000
                ).toLocaleString();
            }
        };
        kisaLoppu.onblur = () => {
            kisaLoppu.setCustomValidity("");
            Validate.kisaTimeValid();
        };
    }

    /**
     * Creates sarja radios
     * @param {number} kisaID
     * @returns {DocumentFragment} Radio button row
     */
    static getSarjaButtons(kisaID?: number): DocumentFragment {
        if (document.getElementById("sarjaButtonContainer")) Util.removeElement("sarjaButtonContainer");
        let frag = document.createDocumentFragment(),
            container = document.createElement("div"),
            checked = false,
            editSarja = sarjat;
        if (kisaID) editSarja = kisat.find(kisa => kisa.id === kisaID).sarjat;
        container.id = "sarjaButtonContainer";
        editSarja.forEach(e => {
            const formRow: HTMLDivElement = document.createElement("div"),
                sarjaRadio: HTMLInputElement = document.createElement("input"),
                sarjaLabel: HTMLLabelElement = document.createElement("label"),
                sarjaSpan: HTMLSpanElement = document.createElement("span");
            formRow.classList.add("form_row", "form_row_innder");
            sarjaRadio.type = "radio";
            sarjaRadio.name = "sarjaPunch";
            sarjaRadio.classList.add("sarjaRadio");
            sarjaRadio.value = e.nimi;
            sarjaRadio.id = `series_${e.nimi}`;
            sarjaRadio.checked = true;
            sarjaLabel.htmlFor = `series_${e.nimi}`;
            sarjaLabel.classList.add("form_innerLabel", "form_label");
            sarjaSpan.textContent = e.nimi;
            formRow.appendChild(sarjaRadio);
            formRow.appendChild(sarjaLabel);
            sarjaLabel.appendChild(sarjaSpan);
            container.appendChild(formRow);
            checked = true;
        });
        frag.appendChild(container);
        return frag;
    }

    /**
     * Initializes Joukke form
     * @param {Joukkue} team
     */
    static setJoukkueForm(team: Joukkue): void {
        editing = true;
        tempLeimaukset = team.rastit;
        (<HTMLInputElement>applicationForm.querySelector("input[name=teamName]")).value = team.nimi;
        (<HTMLInputElement>applicationForm.querySelector("input[name=creationDate]")).value = team.luontiaika;
        Array.from(applicationForm.querySelectorAll("input[name=punchType]")).forEach(e => {
            (e as HTMLInputElement).setCustomValidity("");
            (e as HTMLInputElement).required = false;
            team.leimaustapa.forEach(tapa => {
                if (tapa === (e as HTMLInputElement).value) {
                    (e as HTMLInputElement).checked = true;
                }
            });
        });
        Array.from(applicationForm.querySelectorAll("input[name=sarjaPunch]")).forEach(e => {
            (e as HTMLInputElement).setCustomValidity("");
            if ((e as HTMLInputElement).value === Validate.getSarjaByID(team.sarja).nimi) {
                (e as HTMLInputElement).checked = true;
            }
        });
        let jasenIndex = 0;
        Array.from(applicationForm.querySelectorAll("input[name^='jasen_input']")).forEach(e => {
            (e as HTMLInputElement).required = false;
            (e as HTMLInputElement).setCustomValidity("");
            if (jasenIndex < team.jasenet.length) {
                (e as HTMLInputElement).value = team.jasenet[jasenIndex];
                jasenIndex++;
            }
        });
        Array.from(document.getElementsByClassName("rastiLeimausRow")).forEach(e => e.remove());
        UI.setOptions(team);
        let rastiTable = document.getElementById("rastiTable");
        if (team.rastit)
            team.rastit.forEach(e => {
                let rasti = Validate.getRasti(e.id);
                if (rasti) {
                    rastiTable.appendChild(UI.leimausRow(rasti.koodi, Util.getDate(new Date(e.aika)), team));
                }
            });
        UI.fixOptions(team); // :)
    }

    /**
     * Sets selections for rastiselector
     * @param {Joukkue} team
     */
    static setOptions(team?: Joukkue): void {
        const rastiSelection = document.getElementById("rastit");
        while (rastiSelection.firstChild) {
            rastiSelection.removeChild(rastiSelection.firstChild);
        }
        rastit.forEach(e => {
            const option = document.createElement("option");
            option.setAttribute("value", e.koodi);
            rastiSelection.appendChild(option);
        });
    }

    /**
     * Updates selecetions for rastiSelector
     */
    static updateOptions(): void {
        const rastiInputs = document.querySelectorAll("input[list=rastit]"),
            rastiList = Array.from(rastiInputs)
                .filter(e => (e as HTMLInputElement).value !== "" && rastit.find(l => l.koodi === (e as HTMLInputElement).value))
                .map(e => (e as HTMLInputElement).value),
            selections = rastit.map(e => e.koodi).filter(e => !rastiList.includes(e)),
            rastiSelection = document.getElementById("rastit");
        while (rastiSelection.firstChild) {
            rastiSelection.removeChild(rastiSelection.firstChild);
        }
        selections.forEach(e => {
            const option = document.createElement("option");
            option.setAttribute("value", e);
            rastiSelection.appendChild(option);
        });
    }

    /**
     * Fixes selections for rastiSelector :D
     * @param team
     */
    static fixOptions(team): void {
        let rastiSelection = document.getElementById("rastit");
        team.rastit.forEach(e => {
            let rasti = Validate.getRasti(e.id);
            if (rasti) rastiSelection.querySelector(`option[value="${rasti.koodi.toString()}"]`).remove();
        });
    }

    /**
     * Returns the list of teams
     * @returns {DocumentFragment}
     */
    static getTeamList(): DocumentFragment {
        const frag = document.createDocumentFragment();
        const list = document.createElement("ul");
        list.id = "teamList";
        list.classList.add("flex-container", "wrap");
        joukkueet.sort().forEach(e => {
            const li = document.createElement("li");
            li.textContent = e.nimi;
            li.classList.add("flex-item");
            li.addEventListener("click", () => {
                applicationForm.reset();
                (<HTMLInputElement>document.getElementById("series_2h")).checked = true;
                tempJoukkue = e;
                tempID = e.id;
                UI.setJoukkueForm(e);
            });
            list.appendChild(li);
        });
        frag.appendChild(list);
        return frag;
    }

    /**
     * Returns the list of sarjat in kisa
     * @returns {DocumentFragment}
     */
    static getSarjaList(): DocumentFragment {
        if (document.getElementById("kisasarjaList")) document.getElementById("kisasarjaList").remove();
        const frag = document.createDocumentFragment();
        const list = document.createElement("ul");
        list.id = "kisasarjaList";
        sarjat
            .map(e => e.nimi)
            .sort()
            .forEach(e => {
                const li = document.createElement("li");
                li.textContent = e;
                list.appendChild(li);
            });
        frag.appendChild(list);
        return frag;
    }

    /**
     * Updates kisaselect
     */
    static updateKisaSelect(): void {
        const kisaSelect: HTMLSelectElement = <HTMLSelectElement>document.getElementById("kisaSelection");
        while (kisaSelect.firstChild) {
            kisaSelect.removeChild(kisaSelect.firstChild);
        }
        kisat.forEach(e => {
            const option: HTMLOptionElement = document.createElement("option");
            option.textContent = e.nimi;
            option.value = e.id.toString();
            kisaSelect.appendChild(option);
        });
    }

    /**
     * Creates leimausrow
     * @param {string} rastiID
     * @param {string} rastiAika
     * @param {Joukkue} team
     * @returns {DocumentFragment}
     */
    static leimausRow(rastiID?: string, rastiAika?: string, team?: Joukkue): DocumentFragment {
        const frag = document.createDocumentFragment(),
            row = document.createElement("tr"),
            rastiCell = document.createElement("td"),
            aikaCell = document.createElement("td"),
            poistoCell = document.createElement("td"),
            rastiInputlist = document.createElement("input"),
            rastiDateInput = document.createElement("input"),
            rastiPoistoInput = document.createElement("input"),
            sarja: Sarja | null = team ? Validate.getSarjaByID(team.sarja) : null,
            kisa: Kisa | null = team ? Validate.getKisaById(Validate.getSarjaByID(team.sarja).kilpailu) : Validate.getKisaById(5372934059196416);
        let maxAika: number, minAika: number;
        if (sarja) {
            if (sarja.loppuaika !== null || sarja.alkuaika !== null) {
                minAika = new Date(sarja.alkuaika).getTime();
                maxAika = new Date(sarja.loppuaika).getTime();
            }
        } else {
            minAika = new Date(kisa.alkuaika).getTime();
            maxAika = new Date(kisa.loppuaika).getTime();
        }
        row.classList.add("rastiLeimausRow");
        row.appendChild(rastiCell);
        rastiInputlist.setAttribute("list", "rastit");
        rastiInputlist.setAttribute("value", rastiID ? rastiID : "");
        rastiInputlist.setCustomValidity("");
        rastiDateInput.setAttribute("value", rastiAika ? Util.getDate(new Date(rastiAika)) : "");
        rastiInputlist.onblur = () => {
            UI.updateOptions();
            rastiDateInput.setAttribute("min", Util.getDate(new Date(minAika)));
            rastiDateInput.setAttribute("max", Util.getDate(new Date(maxAika)));
            if (rastiInputlist.value === "") {
                rastiInputlist.setCustomValidity("Anna leimaukselle koodi");
            } else if (!Validate.rastikoodi(rastiInputlist.value)) {
                rastiInputlist.setCustomValidity("Rastia ei ole olemassa");
            } else if (
                Array.from(document.querySelectorAll("input[list=rastit]")).filter(
                    e => (e as HTMLInputElement).value === rastiID
                ).length > 1
            ) {
                rastiInputlist.setCustomValidity("Rasti on jo leimattu");
            } else {
                rastiInputlist.setCustomValidity("");
            }
            if (Validate.validToAddLeimausRow() && Validate.rastikoodi(rastiInputlist.value)) {
                document.getElementById("rastiTable").appendChild(UI.leimausRow());
            }
        };
        rastiDateInput.onblur = () => {
            const val: number = new Date(rastiDateInput.value).getTime();
            if (val < minAika || val > maxAika && rastiInputlist.value !== "") {
                rastiDateInput.setCustomValidity("Ajan tulee sijoittua kisan ajalle");
            } else {
                rastiDateInput.setCustomValidity("");
            }
        };
        rastiCell.appendChild(rastiInputlist);
        row.appendChild(aikaCell);
        rastiDateInput.setAttribute("type", "datetime-local");
        aikaCell.appendChild(rastiDateInput);
        row.appendChild(poistoCell);
        rastiPoistoInput.setAttribute("type", "checkbox");
        rastiPoistoInput.setAttribute("name", "removeCheckbox");
        poistoCell.appendChild(rastiPoistoInput);
        frag.appendChild(row);
        return frag;
    }
}

/**
 * Class for validating functions
 */
class Validate {
    static teamInput(e): boolean {
        if (e.preventDefault) e.preventDefault();
        const teamInput: HTMLInputElement = applicationForm.querySelector("input[name=teamName]"),
            teamName: string = (teamInput as HTMLInputElement).value,
            jasenet = Validate.getJasenet(),
            leimaustavat = Validate.getLeimaustapa(),
            sarja = Validate.getSarja(),
            formValid: boolean = Validate.teamNameInput() && jasenet.length >= 2 && leimaustavat.length >= 1,
            rastit = Validate.getRastitFromForm()
        if (formValid) {
            const newTeam = new Joukkue(
                teamName,
                Validate.getJasenet(),
                Validate.getSarja().id,
                null,
                editing ? tempID : Util.generateID(),
                rastit,
                editing ? tempJoukkue.pisteet : 0,
                editing ? tempJoukkue.matka : 0,
                Validate.getLeimaustapa(),
                Util.getDate(new Date())
            );
            if (!editing) joukkueet.push(newTeam);
            dataset.saveJoukkue(newTeam);
            applicationForm.reset();
            (<HTMLInputElement>document.getElementById("series_2h")).checked = true;
            UI.initHandlers();
            Util.removeElement("teamList"); //:^)
            Array.from(document.getElementsByClassName("rastiLeimausRow")).forEach(e => e.remove());
            document.getElementById("teamListContainer").appendChild(UI.getTeamList());
            alert(`Joukkue "${teamName}" tallennettu onnistuneesti`);
            editing = false;
            return true;
        }
        return false;
    }

    /**
     * Validates kisainput
     * @param e
     * @returns {boolean}
     */
    static kisaInput(e): boolean {
        if (e.preventDefault) e.preventDefault();
        const kisaName = Validate.kisaNameInput(),
            alku = Validate.getkisaAlku(),
            loppu = Validate.getkisaLoppu(),
            kesto = Validate.getkisaKesto();
        const valid: boolean = kisaName && Validate.kisaTimeValid();
        if (valid) {
            const randomID = Util.generateID();
            const newSarjat: Sarja[] = sarjat.map(e => {
                e.kilpailu = randomID;
                e.id = Util.generateID();
                return e;
            });
            const newKisa = new Kisa(kisaName, randomID, loppu, kesto, alku, newSarjat);
            kisat.push(newKisa);
            dataset.saveKisa(newKisa);
            kisaForm.reset();
        }
        return false;
    }

    /**
     * Validates kisaname
     * @returns {string | null}
     */
    static kisaNameInput(): string | null {
        const kisaNimi: HTMLInputElement = kisaForm.querySelector("input[name=kisaNimi]");
        kisaNimi.setCustomValidity("");
        if (!Validate.kisaUnique(kisaNimi.value) && !editing) {
            kisaNimi.setCustomValidity(`"${kisaNimi.value}" on jo käytössä, valitse toinen nimi!`);
            return null;
        } else if (kisaNimi.value.trim() === "") {
            kisaNimi.setCustomValidity(`"Anna kisalle nimi!`);
            return null;
        }
        return kisaNimi.value;
    }

    /**
     * validated teamname
     * @returns {boolean}
     */
    static teamNameInput(): boolean {
        const teamName: HTMLInputElement = applicationForm.querySelector("input[name=teamName]");
        teamName.setCustomValidity("");
        if (!Validate.teamUnique(teamName.value) && !editing) {
            teamName.setCustomValidity(`"${teamName.value}" on jo käytössä, valitse toinen nimi!`);
            return false;
        } else if (teamName.value.trim() === "") {
            teamName.setCustomValidity(`"Anna joukkueelle nimi!`);
            return false;
        }
        return true;
    }

    /**
     * some helper functions
    */
    static teamUnique(name: string): boolean {
        return !joukkueet.find(e => e.nimi.toLowerCase() === name.trim().toLowerCase());
    }
    /**
     * some helper functions
     */
    static getJasenet(): string[] {
        return Array.from(applicationForm.querySelectorAll("input.jasenField"))
            .map(e => (e as HTMLInputElement).value)
            .filter(e => e.trim() !== "");
    }
    /**
     * some helper functions
     */
    static getRasti(rastiID: number): Rasti {
        return rastit.find(e => e.id === rastiID);
    }
    /**
     * some helper functions
     */
    static getRastiByCode(key: string): Rasti {
        return rastit.find(e => e.koodi === key);
    }
    /**
     * some helper functions
     */
    static getRastitFromForm(): Rastileimaus[] {
        const rows = Array.from(applicationForm.getElementsByClassName("rastiLeimausRow"));
        const rastitFrom: Rastileimaus[] = rows.filter(e => (e.childNodes[2].childNodes[0] as HTMLInputElement).checked === false)
            .map(e => {
                const rastiKoodi: string = (e.childNodes[0].childNodes[0] as HTMLInputElement).value,
                    rastiAika: string = Util.getDate(new Date((e.childNodes[1].childNodes[0] as HTMLInputElement).value));
                return new Rastileimaus(rastiAika,Validate.getRastiByCode(rastiKoodi).id);
            }).filter(e => !isNaN(e.aika));
        return rastitFrom;
    }
    /**
     * some helper functions
     */
    static getSarjaByID(id: number): Sarja {
        return sarjat.find(e => e.id === id);
    }
    /**
     * some helper functions
     */
    static validToAddLeimausRow(): boolean {
        const rastiInputs = Array.from(document.querySelectorAll("input[list=rastit]")),
            filled: number = rastiInputs.filter(e => (e as HTMLInputElement).value !== "").length;
        return filled === rastiInputs.length;

    }
    /**
     * some helper functions
     */
    static getSarja(): Sarja {
        const sarjaCode = (Array.from(applicationForm.querySelectorAll("input.sarjaRadio")).find(
            e => (e as HTMLInputElement).checked
        ) as HTMLInputElement).value;
        return sarjat.find(e => e.nimi === sarjaCode);
    }
    /**
     * some helper functions
     */
    static getLeimaustapa(): string[] {
        return Array.from(applicationForm.querySelectorAll("input[type=checkbox]"))
            .filter(e => (e as HTMLInputElement).checked)
            .map(e => (e as HTMLInputElement).value);
    }
    /**
     * some helper functions
     */
    static rastikoodi(koodi): boolean {
        return !!rastit.find(e => (e.koodi === koodi));
    }
    /**
     * some helper functions
     */
    static kisaUnique(name): boolean {
        return !kisat.find(e => e.nimi.toLowerCase() === name.trim().toLowerCase());
    }
    /**
     * some helper functions
     */
    static getKisaById(id): Kisa {
        return kisat.find(e => e.id === id);
    }
    /**
     * some helper functions
     */
    static kisaTimeValid(): boolean {
        const inputAlku: HTMLInputElement = kisaForm.querySelector("input[name=kisaAlku]"),
            inputLoppu: HTMLInputElement = kisaForm.querySelector("input[name=kisaLoppu]"),
            inputKesto: HTMLInputElement = kisaForm.querySelector("input[name=kisaKesto]"),
            start: number = new Date(inputAlku.value).getTime(),
            end: number = new Date(inputLoppu.value).getTime(),
            length: number = new Date(inputKesto.value).getTime() ? new Date(inputKesto.value).getTime() : 0;
        inputAlku.setCustomValidity("");
        inputLoppu.setCustomValidity("");
        if (start === null || end === null) {
            inputAlku.setCustomValidity(`Syötä alkuaika`);
            inputLoppu.setCustomValidity(`Syötä loppuaika`);
            return false;
        } else if (length === 0 && !(end > start)) {
            inputLoppu.setCustomValidity(`Loppuajan täytyy olla suurempi kuin alkuajan`);
            return false;
        } else if (length !== 0 && !(end > start + length)) {
            inputLoppu.setCustomValidity(`Loppuajan täytyy olla suurempi kuin alkuaika + kisan kesto`);
            return false;
        }
        return true;
    }
    /**
     * some helper functions
     */
    static getkisaAlku(): number {
        const alku: HTMLInputElement = kisaForm.querySelector("input[name=kisaAlku]");
        return new Date(alku.value).getTime();
    }
    /**
     * some helper functions
     */
    static getkisaLoppu(): number {
        const loppu: HTMLInputElement = kisaForm.querySelector("input[name=kisaLoppu]");
        return new Date(loppu.value).getTime();
    }
    /**
     * some helper functions
     */
    static getkisaKesto(): number {
        const kesto: HTMLInputElement = kisaForm.querySelector("input[name=kisaKesto]");
        return parseInt(kesto.value);
    }
}

/**
 * Class to save data
 */
class dataset {
    static saveJoukkue(team: Joukkue): void {
        const joukkue = {
            nimi: team.nimi.toString(),
            jasenet: team.jasenet,
            sarja: team.sarja,
            seura: team.seura,
            id: team.id,
            rastit: team.rastit.map(e => ({aika: Util.getDate(new Date(e.aika)), id: e.id})),
            pisteet: team.pisteet,
            matka: team.matka,
            leimaustapa: team.leimaustapa,
            luontiaika: team.luontiaika
        };
        if (editing) {
            const index = joukkueet
                .map(function (e) {
                    return e.id;
                })
                .indexOf(tempID);
            appData.joukkueet[index] = joukkue;
        } else {
            appData.joukkueet.push(joukkue);
        }
        suunnistusApp.setVariables();
        editing = false;
        UI.updateKisaSelect();
    }

    static saveKisa(kisa: Kisa): void {
        const newKisa = {
            nimi: kisa.nimi,
            id: kisa.id,
            loppuaika: new Date(kisa.loppuaika).toDateString(),
            kesto: kisa.kesto,
            alkuaika: new Date(kisa.alkuaika).toDateString(),
            sarjat: kisa.sarjat
        };
        appData.kisat.push(newKisa);
    }
}

/**
 * Class for joukkue
 */
class Joukkue {
    public nimi: string;
    public seura: string | null;
    public id: number;
    public rastit: Rastileimaus[] | null;
    public pisteet: number;
    public matka: number;
    public jasenet: string[];
    public sarja: number;
    public leimaustapa: string[];
    public luontiaika: string;

    constructor(
        nimi: string,
        jasenet: string[],
        sarja: number,
        seura: string | null,
        id: number,
        rastit: Rastileimaus[],
        pisteet: number,
        matka: number,
        leimaustapa: string[],
        luontiaika: string
    ) {
        this.nimi = nimi.trim();
        this.jasenet = jasenet;
        this.sarja = sarja;
        this.seura = seura;
        this.id = id;
        this.rastit = rastit;
        this.pisteet = pisteet;
        this.matka = matka;
        this.leimaustapa = leimaustapa;
        this.luontiaika = luontiaika;
    }
}

/**
 * class for Rastileuimaus
 */
class Rastileimaus {
    public aika: number; //in unix time
    public id: number;

    constructor(aika: string, id: number) {
        this.aika = Date.parse(aika);
        this.id = id;
    }
}
/*
* Class for Rasti
 */
class Rasti {
    public lon: number;
    public koodi: string;
    public lat: number;
    public id: number;
    public pisteet: number;

    constructor(lon: string, koodi: string, lat: string, id: number, pisteet: number) {
        this.lon = parseFloat(lon);
        this.koodi = koodi;
        this.lat = parseFloat(lat);
        this.id = id;
        this.pisteet = pisteet;
    }
}

/**
 * class for Kisa
 */
class Kisa {
    public nimi: string;
    public id: number;
    public loppuaika: number; //Unix time
    public kesto: number;
    public alkuaika: number; //Unix time
    public sarjat: Sarja[];

    constructor(nimi: string, id: number, loppuaika: number, kesto: number, alkuaika: number, sarjat: Sarja[]) {
        this.nimi = nimi;
        this.id = id;
        this.loppuaika = loppuaika;
        this.kesto = kesto;
        this.alkuaika = alkuaika;
        this.sarjat = sarjat;
    }
}

/**
 * Class for sarja
 */
class Sarja {
    public nimi: string;
    public kilpailu: number;
    public matka: string;
    public kesto: number;
    public loppuaika: number | null;
    public alkuaika: number | null;
    public id: number;

    constructor(
        nimi: string,
        kilpailu: number,
        matka: string,
        kesto: number,
        loppuaika: string | null,
        alkuaika: string | null,
        id: number
    ) {
        this.nimi = nimi;
        this.kilpailu = kilpailu;
        this.matka = matka;
        this.kesto = kesto;
        this.loppuaika = loppuaika ? Date.parse(loppuaika) : null;
        this.alkuaika = alkuaika ? Date.parse(alkuaika) : null;
        this.id = id;
    }
}

/**
 * Helper functions again
 */
class Util {
    static generateID(): number {
        let num: number = parseInt((Math.random() + " ").substring(2, 10) + (Math.random() + " ").substring(2, 10));
        if (!joukkueet.find(joukkue => joukkue.id === num)) {
            return num;
        }
        Util.generateID();
    }

    static getDate(date: Date): string {
        function z(n) {
            return (n < 10 ? "0" : "") + n;
        }

        return (
            date.getFullYear() +
            "-" +
            z(date.getMonth() + 1) +
            "-" +
            z(date.getDate()) +
            "T" +
            z(date.getHours()) +
            ":" +
            z(date.getMinutes())
        );
    }

    static removeElement(id: string) {
        let elem = document.getElementById(id);
        return elem.parentNode.removeChild(elem);
    }

    static insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    static errorMessage(message: string, id: string) {
        let frag = document.createDocumentFragment(),
            errorMsg = document.createElement("div");
        errorMsg.classList.add("errorMessage");
        errorMsg.textContent = message;
        errorMsg.id = id;
        frag.appendChild(errorMsg);
        return frag;
    }

    /**
     * Returns sarja based on input code
     * If it returns false, 4h is selected to be the default sarja
     * @param {number} code
     * @returns {Sarja}
     */
    static getSarjaFromCode(code: number): Sarja {
        const sarja = sarjat.find(e => e.id === code);
        return sarja ? sarja : Util.getSarjaFromCode(4751022794735616);
    }
}

window.onload = () => {
    suunnistusApp.main();
};
