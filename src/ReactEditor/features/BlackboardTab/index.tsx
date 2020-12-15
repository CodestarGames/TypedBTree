import React, {Component, FC, useContext} from "react";
import AceEditor from "react-ace";
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-twilight';
import AppStore from "../../stores/AppStore";
import {observer} from "mobx-react";


export const BlackboardTab: FC = observer(() => {
    const appStore = useContext(AppStore);

    return (
            <AceEditor
                style={{
                    width: '100%',
                    height: '100%',
                    fontSize: '12px',
                    padding: 0,
                    margin: 0
                }}
                theme="twilight"
                mode="javascript"
                onChange={(val) => appStore.setBlackboard(val)}
                value={appStore.blackboard}
            />);

})

