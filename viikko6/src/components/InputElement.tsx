import * as React from "react";

export interface InputElementProps {
    label: string;
    inputType: string;
}

export class InputElement extends React.Component<InputElementProps, {}> {

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
                    id={`${this.props.label}input`}
                    name={`${this.props.label}Name`}
                    className="form-input"/>
            </div>
        </div>
    }
}