import * as React from "react";

export interface SarjavalintaProps {
    label: string;
    name: string;
    callBack: any;
}

export interface SarjavalintaState {
    value: string,
    selected: string
}

export class Sarjavalinta extends React.Component<SarjavalintaProps, SarjavalintaState> {
    constructor(props: any) {
        super(props);
        this.state = {
            selected: '',
            value: '',
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange = (event: any) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            selected: value
        });
        this.props.callBack(event.target.value);
    };


    render() {
        return <div className="form_row form_row_inner">
            <input type="radio"
                   name={this.props.name}
                   value={this.props.label}
                   id={`radio_${this.props.label}`}
                   onChange={this.handleInputChange}
                   className="form_checkbox_leimaus"/>
            <label htmlFor={`radio_${this.props.label}`}
                   className="form_innerLabel form_label">
                <span>{this.props.label}</span>
            </label>
        </div>
    }

}