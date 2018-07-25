import * as React from "react";

export interface ListaaJoukkueetProps {
    joukkueet: any[];
}

export class ListaaJoukkueet extends React.Component<ListaaJoukkueetProps, {}> {

    render() {
        return <div className="form_row form_row_inner">
            <h2>Joukkueet</h2>
            <ul>
                {this.props.joukkueet.map((object, i) => <ObjectRow obj={object} key={i}/>)}
            </ul>
        </div>
    }
}

export interface ObjectRowProps {
    obj: any;
}

class ObjectRow extends React.Component<ObjectRowProps, {}> {
    render() {
        return <li>
            {this.props.obj.nimi}
        </li>
    }
}