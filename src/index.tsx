import React from 'react';
import ReactDOM from 'react-dom';
import {RcLayout} from "./Editor";

class App extends React.Component {
    render() {
        return (
            <RcLayout />
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('app'));

