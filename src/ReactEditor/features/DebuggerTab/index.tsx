import React, {Component, FC, useContext, useEffect} from "react";
import * as Display from '../../../visualizer/display'
import {enqueueLoadSchemeFromUrlOrFile, enqueueLoadTreeFromUrlOrFile} from "../../../visualizer/app";
import AppStore from "../../stores/AppStore";

export const DebuggerTab : FC = () => {
    const appStore = useContext(AppStore);

    useEffect(() => {
        Display.Svg.initialize();
        enqueueLoadSchemeFromUrlOrFile("assets/example.treescheme.json");
        enqueueLoadTreeFromUrlOrFile("assets/example.tree.json");
    }, []);

    return (
        <>
            <button type="button" className="control-element" id="play-toggle" onClick={appStore.playTree}>Play</button>
            <button type="button" className="control-element" id="reload-toggle" onClick={appStore.reloadVisualiser}>Reload</button>
            <div id='svg-display'></div>
            <div id="input-blocker" className="order-back"></div>

            <button type="button" className="control-element" id="share-button">Share 📋</button>

            {/*<button type="button" className="control-element" id="play-toggle" onclick={this.props.onPlayButtonPressed()}>Play</button>*/}
            {/*<button type="button" className="control-element" id="reload-toggle" onclick={this.props.reloadVisualiser()}>Reload</button>*/}

            <button type="button" className="control-element" id="focus-button">Focus</button>

            <div className="control-element" id="zoomcontrols-container">
                Zoom
                <button type="button" id="zoomout-button">Out (-)</button>
                <button type="button" id="zoomin-button">In (+)</button>
                <label htmlFor="zoomspeed">Speed</label>
                <input type="range" id="zoomspeed-slider" name="zoomspeed" min="0" max="1" step="any" />
            </div>

            <button type="button" className="control-element" id="undo-button">Undo</button>
            <button type="button" className="control-element" id="redo-button">Redo</button>

        </>)

};
//
// export class DebuggerTab extends Component {
//
//
//     constructor(props, context) {
//         super(props, context);
//
//         this.onChange = this.onChange.bind(this);
//     }
//
//     componentDidMount(): void {
//
//         setTimeout(() => {
//             enqueueLoadSchemeFromUrlOrFile("assets/example.treescheme.json");
//             enqueueLoadTreeFromUrlOrFile("assets/example.tree.json");
//             Display.Svg.initialize()
//         }, 2000)
//
//         //Display.TreeScheme.initialize();
//     }
//
//     onChange(newValue) {
//         console.log('change', newValue);
//     }
//
//     render() {
//         return (
//            <div>
//                <div id='svg-display'></div>
//                <div id="input-blocker" className="order-back"></div>
//
//                <button type="button" className="control-element" id="share-button">Share 📋</button>
//
//                {/*<button type="button" className="control-element" id="play-toggle" onclick={this.props.onPlayButtonPressed()}>Play</button>*/}
//                {/*<button type="button" className="control-element" id="reload-toggle" onclick={this.props.reloadVisualiser()}>Reload</button>*/}
//
//                <button type="button" className="control-element" id="focus-button">Focus</button>
//
//                <div className="control-element" id="zoomcontrols-container">
//                    Zoom
//                    <button type="button" id="zoomout-button">Out (-)</button>
//                    <button type="button" id="zoomin-button">In (+)</button>
//                    <label htmlFor="zoomspeed">Speed</label>
//                    <input type="range" id="zoomspeed-slider" name="zoomspeed" min="0" max="1" step="any" />
//                </div>
//
//                <button type="button" className="control-element" id="undo-button">Undo</button>
//                <button type="button" className="control-element" id="redo-button">Redo</button>
//
//            </div>)
//     }
// }

