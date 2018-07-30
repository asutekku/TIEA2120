import * as React from "react";

export interface JoukkueProps {
    callBack: any;
}

export interface JoukkueState {
    teamNimi: string,
    creationDate: string,
    leimaustavat: string[],
    sarja: string,
    jasenet: string[],
    jasenetValid: boolean,
    nameValid: boolean,
    valid: boolean
}

export class LisaaJoukkue extends React.Component<JoukkueProps, JoukkueState> {
    private teamFormRef: any;

    constructor(props: any) {
        super(props);
        this.state = {
            teamNimi: '',
            creationDate: '',
            leimaustavat: [],
            sarja: '',
            jasenet: [],
            jasenetValid: false,
            nameValid: false,
            valid: false
        };
        this.teamFormRef = React.createRef();
    }

    handleSubmit = (event: any) => {
        event.preventDefault();
        console.log(this.state);
    };

    handleName = (event: any) => {
        this.setState({teamNimi: event.target.value});
        if (event.target.value == '') {
            console.log(":(");
            event.target.setCustomValidity('Syötä joukkueelle nimi');
        } else {
            console.log(":)");
            event.target.setCustomValidity("");
        }
    };
    handleDate = (event: any) => this.setState({creationDate: event.target.value});
    handleSarjaChange = (event: any) => this.setState({sarja: event.target.value});
    handleChecks = (event: any) => {
        const checkName = event.target.value;
        console.log(checkName);
        if (this.state.leimaustavat.indexOf(checkName) <= -1) {
            this.setState(prevState => ({
                leimaustavat: [...prevState.leimaustavat, checkName]
            }));
        } else {
            const arr = [...this.state.leimaustavat];
            arr.splice(this.state.leimaustavat.indexOf(checkName), 1);
            this.setState({leimaustavat: arr});
        }
    };
    handleMembers = (event: any) => {
        const memberName = event.target.value;
        //this.state.jasenet.filter(n => true);
        if (this.state.jasenet.indexOf(memberName) <= -1) {
            this.setState(prevState => ({
                jasenet: [...prevState.jasenet, memberName]
            }));
        } else {
            const arr = [...this.state.jasenet];
            arr.splice(this.state.jasenet.indexOf(memberName), 1);
            this.setState({jasenet: arr});
        }
        if (this.state.jasenet.length >= 2) {
            this.setState({jasenetValid: true})
        } else {
            this.setState({jasenetValid: false})
        }
    };


    render(): any {
        return <div className={"joukkueForm"}>
            <h1>Lisää joukkue</h1>
            <form ref={(el) => this.teamFormRef = el!} onSubmit={this.handleSubmit}>
                <fieldset>
                    <legend>Joukkueen tiedot</legend>
                    <div className={'formRow'}>
                        <label>
                            Joukkueen Nimi:
                            <input type={'text'} value={this.state.teamNimi} onChange={this.handleName}/>
                        </label>
                    </div>
                    <div className={'formRow'}>
                        <label>
                            Luontiaika:
                            <input type={'datetime-local'} value={this.state.creationDate} onChange={this.handleDate}/>
                        </label>
                    </div>
                    <div className="form-row" id="leimausRow">
                        <label htmlFor="punchSystem" className="form_label">
                            <span>Leimaustapa</span>
                        </label>
                        <div id="radioButtons" className="form_innerDiv">
                            <div className="radio">
                                <label>
                                    GPS
                                    <input type={'checkbox'} value={'GPS'}
                                           onChange={this.handleChecks}
                                           checked={!!this.state.leimaustavat.find(e => e === 'GPS')}/>
                                </label>
                            </div>
                            <div className="radio">
                                <label>
                                    NFC
                                    <input type={'checkbox'} value={'NFC'}
                                           onChange={this.handleChecks}
                                           checked={!!this.state.leimaustavat.find(e => e === 'NFC')}/>
                                </label>
                            </div>
                            <div className="radio">
                                <label>
                                    QR
                                    <input type={'checkbox'} value={'QR'}
                                           onChange={this.handleChecks}
                                           checked={!!this.state.leimaustavat.find(e => e === 'QR')}/>
                                </label>
                            </div>
                            <div className="radio">
                                <label>
                                    Lomake
                                    <input type={'checkbox'} value={'Lomake'}
                                           onChange={this.handleChecks}
                                           checked={!!this.state.leimaustavat.find(e => e === 'Lomake')}/>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="form-row" id="sarjaRow">
                        <label htmlFor="series" className="form_label">
                            <span>Sarja</span>
                        </label>
                        <div id="series" className="form_innerDiv">
                            <div className={'checkBox'}>
                                <label>
                                    2h
                                    <input type={'radio'} value={'2h'} name={'2h'}
                                           checked={this.state.sarja === '2h'}
                                           onChange={this.handleSarjaChange}/>
                                </label>
                            </div>
                            <div className={'checkBox'}>
                                <label>
                                    4h
                                    <input type={'radio'} value={'4h'} name={'4h'}
                                           checked={this.state.sarja === '4h'}
                                           onChange={this.handleSarjaChange}/>
                                </label>
                            </div>
                            <div className={'checkBox'}>
                                <label>
                                    8h
                                    <input type={'radio'} value={'8h'} name={'8h'}
                                           checked={this.state.sarja === '8h'}
                                           onChange={this.handleSarjaChange}/>
                                </label>
                            </div>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Jäsenet</legend>
                    <div className={'form-row'}>
                        <label>
                            Jäsen 1
                            <input type={'text'}
                                   onBlur={this.handleMembers}/>
                        </label>
                    </div>
                    <div className={'form-row'}
                         onChange={this.handleMembers}>
                        <label>
                            Jäsen 2
                            <input type={'text'}
                                   onBlur={this.handleMembers}/>
                        </label>
                    </div>
                    <div className={'form-row'}>
                        <label>
                            Jäsen 3
                            <input type={'text'}
                                   onBlur={this.handleMembers}/>
                        </label>
                    </div>
                    <div className={'form-row'}>
                        <label>
                            Jäsen 4
                            <input type={'text'}
                                   onBlur={this.handleMembers}/>
                        </label>
                    </div>
                    <div className={'form-row'}>
                        <label>
                            Jäsen 5
                            <input type={'text'}
                                   onBlur={this.handleMembers}/>
                        </label>
                    </div>
                </fieldset>
                <input type="submit"
                       value="Tallenna joukkue"
                       onClick={this.handleSubmit}/>
            </form>
        </div>
    }
}