import React from 'react';
import {DockContextType, DockLayout} from "rc-dock/lib";
import { Container } from '@playcanvas/pcui/pcui-react';
import {LayoutData} from "rc-dock/src/DockData";


let cardTab = {
    title: 'card-style',
    content: (
        <div>
            card style
        </div>
    ),
    group: 'card'
};



let layout: LayoutData = {
        dockbox: {
            mode: 'horizontal',
            children: [
                {
                    size: 200,
                    tabs: [{
                        ...cardTab,
                        id: 't8',
                        title: 'Tree List',
                        content: <Container>
                            <div>Test</div>
                            </Container>

                    }],
                },
                {
                    size: 800,
                    tabs: [
                        {
                            ...cardTab, id: 't5', title: 'Tree'
                        },
                        {
                            ...cardTab, id: 'tab-graph', title: 'Graph'
                        },
                    ],
                    panelLock: {panelStyle: 'main'},
                },
                {
                    size: 200,
                    tabs: [{...cardTab, id: 't8', title: 'Inspector'}],
                },
            ]
        }
    }
;
if (window.innerWidth < 600) {
    // remove a column for mobile
    layout.dockbox.children.pop();
}

let count = 0;

export class RcLayout extends React.Component {

    onDragNewTab = (e) => {
        let content = `New Tab ${count++}`;
        // DragStore.dragStart(DockContextType, {
        //     tab: {
        //         id: content,
        //         content: <div style={{padding: 20}}>{content}</div>,
        //         title: content,
        //         closable: true,
        //     }
        // }, e.nativeEvent);
    };

    render() {
        return (
            <DockLayout defaultLayout={layout} style={{position: 'absolute', left: 10, top: 10, right: 10, bottom: 10}}/>
        );
    }
}
