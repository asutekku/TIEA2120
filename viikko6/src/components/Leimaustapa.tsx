import * as React from "react";

export interface LeimaustapaProps {
    label: string;
}

export class Leimaustapa extends React.Component<LeimaustapaProps, {}> {

    render() {
        return <div className="form_row form_row_inner">
            <input type="checkbox"
                   name="punchType"
                   value={this.props.label}
                   id={`punch_${this.props.label}`}
                   className="form_checkbox_leimaus"/>
            <label htmlFor={`punch_${this.props.label}`}
                   className="form_innerLabel form_label">
                <span>{this.props.label}</span>
            </label>
        </div>
    }

}