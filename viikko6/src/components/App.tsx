import * as React from "react";
import {LisaaJoukkue} from "./LisaaJoukkue";
import {ListaaJoukkueet} from "./ListaaJoukkueet";

declare var data: any;

export interface AppState {
    joukkueet: any[];
}

export class App extends React.Component<{}, AppState> {

    createTeam = (teamState: any) => {
        console.log(teamState);
        const uusij: any = {};
        uusij.nimi = teamState.teamNimi;
        uusij.aika = teamState.creationDate;
        uusij.sarja = teamState.sarja;
        uusij.jasenet = teamState.jasenet;
        uusij.leimaustapa = teamState.leimaustavat;
        this.setState(prevState => ({
            joukkueet: [...prevState.joukkueet, uusij]
        }))

    };

    constructor(props: any) {
        super(props);
        let joukkueet = Array.from(data.joukkueet, (j: any) => {
            const uusij: any = {};
            const kentat = ["nimi", "sarja", "seura", "id"];
            for (let i of kentat)
                uusij[i] = j[i];
            const uusijasenet = Array.from(j["jasenet"]);
            const uusirastit = Array.from(j["rastit"]);
            const uusileimaustapa = Array.from(j["leimaustapa"]);
            uusij["jasenet"] = uusijasenet;
            uusij["rastit"] = uusirastit;
            uusij["leimaustapa"] = uusileimaustapa;
            return uusij;
        });
        console.log(joukkueet);
        this.state = {
            joukkueet: joukkueet
        };
    }

    render() {
        return (
            <div>
                <LisaaJoukkue
                    callBack={this.createTeam}>
                </LisaaJoukkue>
                <ListaaJoukkueet
                    joukkueet={this.state.joukkueet}>
                </ListaaJoukkueet>
            </div>
        );
    }
}