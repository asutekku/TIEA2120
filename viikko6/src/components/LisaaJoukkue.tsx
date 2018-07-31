import * as React from "react";

export interface JoukkueProps {
    callBack: any;
}

export interface JoukkueState {
    nimi: string,
    luontiaika: string,
    leimaustavat: string[],
    sarja: string,
    jasenCount: number,
    jasenet: string[],
}

export class LisaaJoukkue extends React.Component<JoukkueProps, JoukkueState> {
    private teamFormRef: any;

    constructor(props: any) {
        super(props);
        this.state = {
            nimi: '',
            luontiaika: '',
            leimaustavat: [],
            sarja: '',
            jasenCount: 0,
            jasenet: [],
        };
        this.teamFormRef = React.createRef();
    }

    errors = {
        name: false,
        members: false,
    };

    isEnabled = false;

    handleSubmit = (event: any) => {
        event.preventDefault();
        this.props.callBack(this.state);
        this.isEnabled = true;
        //Resets the state
        this.setState({
            nimi: '',
            luontiaika: '',
            leimaustavat: [],
            sarja: '',
            jasenCount: 0,
            jasenet: []
        });
        event.target.reset();
    };
    handleName = (event: any) => {
        this.setState({nimi: event.target.value});
        if (event.target.value == '') {
            event.target.setCustomValidity('Syötä joukkueelle nimi');
        } else {
            event.target.setCustomValidity("");
        }
    };
    handleDate = (event: any) => this.setState({luontiaika: event.target.value});
    handleSarjaChange = (event: any) => this.setState({sarja: event.target.value});
    handleChecks = (event: any) => {
        const checkName = event.target.value;
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
        const memberName = event.target.value,
            index = parseInt(event.target.id.replace(/[^\d.]/g, ''), 10);
        if (event.target.value.length == 0) {
            const arr = [...this.state.jasenet];
            arr.splice(index, 1);
            this.setState({jasenet: arr});
            event.target.setCustomValidity('Syötä vähintään kaksi jäsentä');
        } else {
            const arr = [...this.state.jasenet];
            arr[index] = memberName;
            this.setState({jasenet: arr});
            event.target.classList.remove('error');
            event.target.setCustomValidity('');
        }
        this.errors.members = this.state.jasenet.length < 2;
        this.state.jasenet.filter(n => true);

    };

    validate = (nimi: string, jasenet: string[]) => {
        return {
            name: nimi.length === 0,
            members: jasenet.length < 2,
        };
    };


    render(): any {
        this.errors = this.validate(this.state.nimi, this.state.jasenet);
        this.isEnabled = !Object.keys(this.errors).some((x: any) => (this.errors as any)[x]);
        return <div className={"joukkueForm"}>
            <h1>Lisää joukkue</h1>
            <form ref={(el) => this.teamFormRef = el!} onSubmit={this.handleSubmit}>
                <fieldset>
                    <legend>Joukkueen tiedot</legend>
                    <div className={'form-row'}>
                        <label>
                            Joukkueen Nimi:
                            <input type={'text'}
                                   value={this.state.nimi}
                                   onChange={this.handleName}
                                   required={true}/>
                        </label>
                    </div>
                    <div className={'form-row'}>
                        <label>
                            Luontiaika:
                            <input type={'datetime-local'} value={this.state.luontiaika} onChange={this.handleDate}/>
                        </label>
                    </div>
                    <div className="form-row" id="leimausRow">
                        <label htmlFor="punchSystem" className="form_label">
                            <span>Leimaustapa</span>
                        </label>
                        <div id="radioButtons" className="form_innerDiv">
                            <div className="checkBox">
                                <label>
                                    GPS
                                    <input type={'checkbox'} value={'GPS'}
                                           onChange={this.handleChecks}
                                           checked={!!this.state.leimaustavat.find(e => e === 'GPS')}/>
                                </label>
                            </div>
                            <div className="checkBox">
                                <label>
                                    NFC
                                    <input type={'checkbox'} value={'NFC'}
                                           onChange={this.handleChecks}
                                           checked={!!this.state.leimaustavat.find(e => e === 'NFC')}/>
                                </label>
                            </div>
                            <div className="checkBox">
                                <label>
                                    QR
                                    <input type={'checkbox'} value={'QR'}
                                           onChange={this.handleChecks}
                                           checked={!!this.state.leimaustavat.find(e => e === 'QR')}/>
                                </label>
                            </div>
                            <div className="checkBox">
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
                            <div className={'radio'}>
                                <label>
                                    2h
                                    <input type={'radio'} value={'2h'} name={'2h'}
                                           checked={this.state.sarja === '2h'}
                                           onChange={this.handleSarjaChange}/>
                                </label>
                            </div>
                            <div className={'radio'}>
                                <label>
                                    4h
                                    <input type={'radio'} value={'4h'} name={'4h'}
                                           checked={this.state.sarja === '4h'}
                                           onChange={this.handleSarjaChange}/>
                                </label>
                            </div>
                            <div className={'radio'}>
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
                            <input type={'text'} id={'m0'}
                                   onChange={this.handleMembers}/>
                        </label>
                    </div>
                    <div className={'form-row'}>
                        <label>
                            Jäsen 2
                            <input type={'text'} id={'m1'}
                                   onChange={this.handleMembers}/>
                        </label>
                    </div>
                    <div className={'form-row'}>
                        <label>
                            Jäsen 3
                            <input type={'text'} id={'m2'}
                                   onChange={this.handleMembers}/>
                        </label>
                    </div>
                    <div className={'form-row'}>
                        <label>
                            Jäsen 4
                            <input type={'text'} id={'m3'}
                                   onChange={this.handleMembers}/>
                        </label>
                    </div>
                    <div className={'form-row'}>
                        <label>
                            Jäsen 5
                            <input type={'text'} id={'m4'}
                                   onChange={this.handleMembers}/>
                        </label>
                    </div>
                </fieldset>
                <input type="submit"
                       value="Tallenna joukkue"
                       disabled={!this.isEnabled}/>
            </form>
        </div>
    }
}