import * as React from "react";

export interface SarjavalintaProps {
    label: string;
    name: string;
}

export class Sarjavalinta extends React.Component<SarjavalintaProps, {}> {

    render() {
        return <div className="form_row form_row_inner">
            <input type="radio"
                   name={this.props.name}
                   value={this.props.label}
                   id={`radio_${this.props.label}`}
                   className="form_checkbox_leimaus"/>
            <label htmlFor={`radio_${this.props.label}`}
                   className="form_innerLabel form_label">
                <span>{this.props.label}</span>
            </label>
        </div>
    }

}