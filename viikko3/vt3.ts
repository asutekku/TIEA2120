// data-muuttuja sisältää kaiken tarvittavan ja on rakenteeltaan lähes samankaltainen kuin viikkotehtävässä 2
// Rastileimaukset on siirretty tupa-rakenteesta suoraan jokaisen joukkueen yhteyteen
//
// voit tutkia tarkemmin käsiteltävää tietorakennetta konsolin kautta
// tai json-editorin kautta osoitteessa http://jsoneditoronline.org/
// Jos käytät json-editoria niin avaa data osoitteesta:
// http://appro.mit.jyu.fi/tiea2120/vt/vt3/data.json

"use strict";

let submitButton: HTMLButtonElement;
let applicationForm: HTMLFormElement;
let joukkueet: Joukkue[];
let sarjat: Sarja[];

class suunnistusApp {
    public static main(): void {
        this.setVariables();
        UI.initHandlers();
        console.log(sarjat);
    }

    static setVariables(): void {
        applicationForm = <HTMLFormElement>document.getElementById("suunnistusForm");
        submitButton = <HTMLButtonElement>document.getElementById("submitFormButton");
        sarjat = data.kisat[0].sarjat.map(
            e => new Sarja(e.nimi, e.kilpailu, e.matka, e.kesto, e.loppuaika, e.altKey, e.id)
        );
        joukkueet = data.joukkueet.map(
            e =>
                new Joukkue(
                    e.nimi,
                    e.jasenet,
                    Util.getSarjaFromCode(e.sarja),
                    e.seura,
                    e.id,
                    e.rastit,
                    e.pisteet,
                    e.matka,
                    e.leimaustapa,
                    e.luontiaika
                )
        );
    }
}

class UI {
    static errorMsgExists = false;

    static initHandlers(): void {
        const teamInput:HTMLInputElement = applicationForm.querySelector("input[name=teamName]");
        const errorDiv: HTMLElement = document.getElementById("teamNameError");
        const nimiRow = document.getElementById("nimiRow");
        applicationForm.addEventListener("submit", Validate.teamInput);
        teamInput.onblur = function () {
            if (Validate.teamUnique(teamInput.value)) {
                teamInput.classList.remove("invalid");
            } else {
                teamInput.classList.add("invalid");
            }
        };
        teamInput.addEventListener("input", () => {
            if (teamInput.value.trim() ===''){
                teamInput.setCustomValidity("Syötä nimi joukkueelle");
            } else {
                teamInput.setCustomValidity('');
            }
        },false);

        teamInput.addEventListener('invalid', function () {
            if (!Validate.teamUnique(teamInput.value)) {
                this.setCustomValidity(`"${teamInput.value}" on jo käytössä, valitse toinen nimi!`);
            }
        }, false);
    }

    static getTeamList(): DocumentFragment {
        const frag = document.createDocumentFragment();
        return frag;
    };
}

class Validate {
    static teamInput(e): boolean {
        if (e.preventDefault) e.preventDefault();
        const teamInput:HTMLInputElement = applicationForm.querySelector("input[name=teamName]"),
            teamName: string = (teamInput as HTMLInputElement).value,
            formValid: boolean = Validate.teamUnique(teamName);

        if (formValid) {
            const newTeam = new Joukkue(
                teamName,
                Validate.getJasenet(),
                Validate.getSarja(),
                null,
                Util.generateID(),
                null,
                0,
                0,
                Validate.getLeimaustapa(),
                Util.getDate(new Date())
            );
            console.log(newTeam);
            joukkueet.push(newTeam);
            applicationForm.reset();
            return true;
        }
        return false;
    }
    
    static teamUnique(name): boolean {
        return !joukkueet.find(joukkue => joukkue.nimi.toLowerCase() === name.trim().toLowerCase());
    }

    static getJasenet(): string[] {
        return Array.from(applicationForm.querySelectorAll("input.jasenField"))
            .map(e => (e as HTMLInputElement).value)
            .filter(e => e.trim() !== "");
    }

    static getSarja(): Sarja {
        const sarjaCode = Array.from(applicationForm.querySelectorAll("input.sarjaRadio")).find(
            e => (e as HTMLInputElement).checked
        ).value;
        return sarjat.find(e => e.nimi === sarjaCode);
    }

    static getLeimaustapa(): string[] {
        return Array.from(applicationForm.querySelectorAll("input[type=checkbox]"))
            .filter(e => (e as HTMLInputElement).checked)
            .map(e => (e as HTMLInputElement).value);
    }
}

class Joukkue {
    public nimi: string;
    public seura: string | null;
    public id: number;
    public rastit: Rastileimaus[] | null;
    public pisteet: number;
    public matka: number;
    public jasenet: string[];
    public sarja: Sarja;
    public leimaustapa: string[];
    public luontiaika: string;

    constructor(
        nimi: string,
        jasenet: string[],
        sarja: Sarja,
        seura: string | null,
        id: number,
        rastit: Object[],
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
        this.rastit = rastit
            ? rastit.map(leimaus => {
                return new Rastileimaus((leimaus as any).aika, (leimaus as any).id);
            })
            : null;
        this.pisteet = pisteet;
        this.matka = matka;
        this.leimaustapa = leimaustapa;
        this.luontiaika = luontiaika;
    }
}

class Rastileimaus {
    public aika: number; //in unix time
    public id: number;

    constructor(aika: string, id: string) {
        this.aika = Date.parse(aika);
        this.id = parseFloat(id);
    }
}

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

class Sarja {
    public nimi: string;
    public kilpailu: number;
    public matka: string;
    public kesto: number;
    public loppuaika: string | null;
    public alkuaika: string | null;
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
        this.loppuaika = loppuaika;
        this.alkuaika = alkuaika;
        this.id = id;
    }
}

class Util {
    static generateID(): number {
        let num: number = parseInt((Math.random() + " ").substring(2, 10) + (Math.random() + " ").substring(2, 10));
        if (!joukkueet.find(joukkue => joukkue.id === num)) {
            return num;
        }
        Util.generateID();
    }

    static getDate(date): string {
        function z(n) {
            return (n < 10 ? "0" : "") + n;
        }

        return (
            date.getFullYear() +
            "-" +
            z(date.getMonth() + 1) +
            "-" +
            z(date.getDate()) +
            " " +
            z(date.getHours()) +
            ":" +
            z(date.getMinutes()) +
            ":" +
            z(date.getSeconds())
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
