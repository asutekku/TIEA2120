import * as React from "react";

export interface LeimausProps {
    label: string;
    callBack: any;
}

export interface LeimausState {
    value: string,
    checked: boolean
}


export class Leimaustapa extends React.Component<LeimausProps, LeimausState> {

    constructor(props: any) {
        super(props);
        this.state = {
            checked: false,
            value: '',
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange = (event: any) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            checked: value
        });
        this.props.callBack([event.target.checked, event.target.value]);
    };

    render() {
        return <div className="form_row form_row_inner">
            <input type="checkbox"
                   name="punchType"
                   value={this.props.label}
                   id={`punch_${this.props.label}`}
                   checked={this.state.checked}
                   onChange={this.handleInputChange}
                   className="form_checkbox_leimaus"/>
            <label htmlFor={`punch_${this.props.label}`}
                   className="form_innerLabel form_label">
                <span>{this.props.label}</span>
            </label>
        </div>
    }

}