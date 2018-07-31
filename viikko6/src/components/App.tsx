import * as React from "react";
import {LisaaJoukkue} from "./LisaaJoukkue";
import {ListaaJoukkueet} from "./ListaaJoukkueet";

declare var data: any;

export interface AppState {
    joukkueet: any[];
}

export class App extends React.Component<{}, AppState> {

    createTeam = (teamState: any) => {
        const uusij: any = {};
        uusij.nimi = teamState.nimi;
        uusij.aika = teamState.luontiaika ? teamState.luontiaika : null;
        uusij.sarja = teamState.sarja ? teamState.sarja : null;
        uusij.jasenet = teamState.jasenet;
        uusij.leimaustapa = teamState.leimaustavat ? teamState.leimaustavat : null;
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
                <div className={'smallContainer'}>
                    <ListaaJoukkueet
                        joukkueet={this.state.joukkueet}>
                    </ListaaJoukkueet>
                </div>
                <div className={'smallContainer'}>
                    <LisaaJoukkue
                        callBack={this.createTeam}>
                    </LisaaJoukkue>
                </div>
            </div>
        );
    }
}