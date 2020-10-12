import * as ace from 'ace-builds/src-noconflict/ace.js'
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-twilight';



/** Initialize the display, needs to be done once. */
export function initialize(): void {

    let editor = ace.edit("blackboard", {
        theme: "ace/theme/twilight",
        mode: "ace/mode/javascript",
    });
    editor.setOption("showPrintMargin", false)
}