import * as React from "react";

export interface JasenEntryProps {
    jasenNum: number;
    callBack: any;
    valid: boolean;
}

export interface JasenEntryState {
    value: string;
    valid: boolean;
}

export class JasenEntry extends React.Component<JasenEntryProps, JasenEntryState> {

    constructor(props: any) {
        super(props);
        this.state = {
            value: '',
            valid: false
        };
    }

    handleChange = (event: any) => {
        this.getValidity(event);
        this.setState({
            value: event.target.value.toString(),
        });
        this.props.callBack(event.target.value);
    };

    getValidity(event: any): void {
        console.log(this.state);
        if (this.props.valid) {
            event.target.setCustomValidity("");
            this.setState({valid: true});
        } else {
            event.target.setCustomValidity("Syötä vähintään kaksi jäsentä");
            this.setState({valid: false});
        }
    }

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
                    className="textField jasenField"
                    onBlur={this.handleChange}/>
            </div>
        </div>
    }

}