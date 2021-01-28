import React, {FC, useContext, useEffect} from 'react';
import '../style.css';
import {DockContextType, DockLayout} from "rc-dock/lib";
import {LayoutData} from "rc-dock/src/DockData";
import {Directory} from "./features/Directory";
import {BehaviourTreeTab} from "./features/BehaviourTreeTab";
import {BlackboardTab} from "./features/BlackboardTab";
import {DebuggerTab} from "./features/DebuggerTab";
import * as graphVisualizer from '../visualizer/app'
import AppStore from "./stores/AppStore";
import {observer} from "mobx-react";


let cardTab = {
    title: 'card-style',
    content: (
        <div>
            card style
        </div>
    ),
    group: 'card'
};

let count = 0;



export const RcLayout : FC = observer(() => {

    const appStore = useContext(AppStore);

    useEffect(() => {
        graphVisualizer.run(null, graphVisualizer.Mode.Integration);
        appStore.graphVisualizer = graphVisualizer;

        setTimeout(() => {
            appStore.setBlackboard(`{
  "AI.Items.Actions.DelayTestAction": async() => State.SUCCEEDED,
  "AI.Items.Actions.Say": async(args) => {
      alert(args['$data.text']);
      return State.SUCCEEDED;
  },
  "AI.Items.Actions.Prompt": async(args) => {
      var r = confirm(args['$data.text']);
      return r ? State.SUCCEEDED : State.FAILED;
  },
  "AI.Items.Actions.PlayNarration": async() => State.FAILED,
  "AI.Conditions.IsHungry": () => true
}`);
            appStore.reloadVisualiser();
        }, 100);


    }, []);

    let layout: LayoutData = {
        dockbox: {
            mode: 'horizontal',
            children: [
                // {
                //     size: 200,
                //     tabs: [{
                //         ...cardTab,
                //         id: 't8',
                //         title: 'Directory',
                //         content: <Directory></Directory>
                //     }],
                // },
                {
                    size: 800,
                    tabs: [
                        {
                            ...cardTab, id: 'tab-debugger', title: 'Debugger',
                            content: <DebuggerTab></DebuggerTab>
                        },
                        {
                            ...cardTab, id: 't5', title: 'Tree',
                            content: <BehaviourTreeTab></BehaviourTreeTab>
                        },
                        {
                            ...cardTab, id: 'tab-blackboard', title: 'Blackboard',
                            content: <BlackboardTab></BlackboardTab>
                        },
                    ],
                    panelLock: {panelStyle: 'main'},
                },
                // {
                //     size: 200,
                //     tabs: [{...cardTab, id: 't8', title: 'Inspector'}],
                // },
            ]
        }
    }

    return <AppStore.Provider value={appStore}>
            <DockLayout defaultLayout={layout} style={{position: 'absolute', left: 10, top: 10, right: 10, bottom: 10}}/>
        </AppStore.Provider>


});
