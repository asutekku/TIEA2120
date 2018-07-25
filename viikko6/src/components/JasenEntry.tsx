import * as React from "react";

export interface JasenEntryProps {
    jasenNum: number;
}

export class JasenEntry extends React.Component<JasenEntryProps, {}> {

    render() {
        return <div className="form_row">
            <label
                htmlFor={"jasen_input_" + this.props.jasenNum}
                className="form_label">
                <span>Jäsen {this.props.jasenNum}</span></label>
            <div
                className="form_data">
                <input
                    type="text"
                    id={"jasen_input_" + this.props.jasenNum}
                    name={"jasen_input_" + this.props.jasenNum}
                    className="textField jasenField"/>
            </div>
        </div>
    }

}