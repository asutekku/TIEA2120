import * as React from "react";
import {JasenEntry} from "./JasenEntry";
import {InputElement} from "./InputElement";
import {Leimaustapa} from "./Leimaustapa";
import {Sarjavalinta} from "./Sarjavalinta";

export class LisaaJoukkue extends React.Component {

    render() {
        return <div>
            <h1>Lisää joukkue</h1>
            <form>
                <fieldset>
                    <legend>Joukkueen tiedot</legend>
                    <InputElement label={"Nimi"} inputType={"text"}/>
                    <InputElement label={"Luontiaika"} inputType={"datetime-local"}/>
                    <div className="form_row" id="leimausRow">
                        <label htmlFor="punchSystem" className="form_label">
                            <span>Leimaustapa</span>
                        </label>
                        <div id="punchSystem" className="form_innerDiv">
                            <Leimaustapa label={"GPS"}/>
                            <Leimaustapa label={"NFC"}/>
                            <Leimaustapa label={"QR"}/>
                            <Leimaustapa label={"Lomake"}/>
                        </div>
                    </div>
                    <div className="form_row" id="sarjaRow">
                        <label htmlFor="series" className="form_label">
                            <span>Sarja</span>
                        </label>
                        <div id="series" className="form_innerDiv">
                            <Sarjavalinta label={"2h"} name={"sarja"}/>
                            <Sarjavalinta label={"4h"} name={"sarja"}/>
                            <Sarjavalinta label={"8h"} name={"sarja"}/>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Jäsenet</legend>
                    <JasenEntry jasenNum={1}/>
                    <JasenEntry jasenNum={2}/>
                    <JasenEntry jasenNum={3}/>
                    <JasenEntry jasenNum={4}/>
                    <JasenEntry jasenNum={5}/>
                </fieldset>
                <input type="submit" className="button" value="Tallenna" id="submitFormButton"/>
            </form>
        </div>
    }
}