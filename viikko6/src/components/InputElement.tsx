import * as React from "react";

export interface InputElementProps {
    label: string;
    inputType: string;
    callBack: any;
    valid?: boolean
}

export class InputElement extends React.Component<InputElementProps, { value: any, valid: any }> {

    constructor(props: any) {
        super(props);
        this.state = {
            value: '',
            valid: this.props.valid
        };
    }

    handleChange = (event: any) => {
        this.getValidity(event);
        this.setState({
            value: event.target.value,
        });
        this.props.callBack(this.state.value);
    };

    getValidity(event: any): void {
        console.log(event.target);
        if (event.target.value.length >= 1) {
            this.setState({valid: true});
            event.target.setCustomValidity("");
        } else {
            this.setState({valid: false});
            event.target.setCustomValidity("Syötä joukkueelle nimi");
        }
    }

    render() {
        return <div className="form-row">
            <label
                htmlFor={`${this.props.label}input`}
                className="form-label">
                <span>{this.props.label}</span>
            </label>
            <div className="form-data">
                <input
                    type={this.props.inputType}
                    id={`${this.props.label}Input`}
                    name={`${this.props.label}Name`}
                    className="form-input"
                    onChange={this.handleChange}/>
            </div>
        </div>
    }
}