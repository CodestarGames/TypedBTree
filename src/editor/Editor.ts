import * as Display from "../treevis/display";
import {TreeVis} from "../index";
import {SignalSingleton} from "../treevis/signalSingleton";
import {Panel} from "./LiteGui/src/panel";
import {Tabs} from "./LiteGui/src/tabs";
import {Area} from "./LiteGui/src/area";
import {Menubar} from "./LiteGui/src/menubar";
import {Tree} from "./LiteGui/src/tree";
import {Inspector} from "./LiteGui/src/inspector";
import {LiteGUI} from "./LiteGui/src/core";
import * as ace from 'ace-builds/src-noconflict/ace.js'
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-twilight';

const toolbarHTML = `
    <div id="input-blocker" class="order-back"></div>


  <!-- Button to copy sharable link to clipboard -->
  <button type="button" class="control-element" id="share-button">Share 📋</button>

  <!-- Button to toggle the toolbox -->
  <button type="button" class="control-element" id="toolbox-toggle">Toolbox (t)</button>

  <!-- Button to focus the view -->
  <button type="button" class="control-element" id="focus-button">Focus (f)</button>

  <!-- Zoom controls -->
  <div class="control-element" id="zoomcontrols-container">
    Zoom
    <button type="button" id="zoomout-button">Out (-)</button>
    <button type="button" id="zoomin-button">In (+)</button>
    <label for="zoomspeed">Speed</label>
    <input type="range" id="zoomspeed-slider" name="zoomspeed" min="0" max="1" step="any">
  </div>

  <!-- Buttons for undo / redo -->
  <button type="button" class="control-element" id="undo-button">Undo (z)</button>
  <button type="button" class="control-element" id="redo-button">Redo (shift-z)</button>

  <!-- Toolbox containing the main ways to interact with the app -->
  <div id="toolbox">
    <div class="header">Scheme</div>
    <div class="element" id="openscheme-container">
      <input type="file" id="openscheme-file" accept=".json" />
      <button type="button" id="exportscheme-button">Export</button>
    </div>
    <div id="scheme-display"></div>

    <div class="header">Tree</div>
    <div class="element" id="opentree-container">
      <button type="button" id="newtree-button">New</button>
      <input type="file" id="opentree-file" accept=".json" />
      <button type="button" id="pastetree-button">Paste 📋</button>
    </div>
    <div class="element" id="exporttree-container">
      <button type="button" id="exporttree-button">Export (e)</button>
      <button type="button" id="copytree-button">Copy 📋</button>
    </div>

    <div class="header">Pack</div>
    <div class="element" id="pack-container">
      <input type="file" id="openpack-file" accept=".json" />
      <button type="button" id="exportpack-button">Export</button>
    </div>
  </div>
    `


export class Editor {

    mainArea: any = null;
    treeTreeview: any;
    aliasTreeview: any;
    enumTreeview: any;
    nodesTreeview: any;

    //listeners
    onSetScheme({id, children}) {
        switch (id) {
            case "Nodes":
                this.nodesTreeview.updateTree({id, children});
                break;
            case "Aliases":

                this.aliasTreeview.updateTree({id, children});
                break;
            case "Enums":
                this.enumTreeview.updateTree({id, children});
                break;
        }
    };

    onOpenTree(completeTree) {
        this.treeTreeview.updateTree(completeTree);
    };

    onSetTree(newTree) {
        this.treeTreeview.updateTree(newTree);
    };

    constructor() {

    }


    init() {
        LiteGUI.init();

        var mainmenu = new Menubar("mainmenubar");
        LiteGUI.add(mainmenu);


        this.mainArea = new Area({
            id: "mainarea",
            content_id: "canvasarea",
            height: "calc( 100% - 20px )",
            main: true,
            immediateResize: true
        });
        LiteGUI.add(this.mainArea);

        //create main canvas to test redraw
        var canvas = document.createElement("div");
        canvas.id = "svg-display";
        canvas.innerHTML = toolbarHTML;
        // canvas.width = canvas.height = 100;
        // canvas.times = 0;
        // canvas.redraw = function() {
        //     var rect = canvas.parentNode.getClientRects()[0];
        //     canvas.width = rect.width;
        //     canvas.height = rect.height;
        //     var ctx = canvas.getContext("2d");
        //     ctx.clearRect(0,0,this.width,this.height);
        //     ctx.lineWidth = 1;
        //     ctx.strokeStyle = "#AAF";
        //     ctx.strokeRect(10.5,10.5,this.width-20,this.height-20);
        //     ctx.strokeText("Times: " + this.times,20.5,30.5);
        //     this.times += 1;
        // }
        // this.mainArea.onresize = function() { canvas.redraw(); };

        let mainTabs = new Tabs({width: "100%", height: "calc( 100% - 20px )"});
        mainTabs.addTab("Main", {selected: true, width: "100%", height: "100%"});
        mainTabs.addTab("Blackboard", {selected: false, width: "100%", height: "100%"});

        this.mainArea.content.appendChild(mainTabs.root);

        let mainTabContent = mainTabs.getTabContent("Main");
        mainTabContent.appendChild(canvas);

        let aceDiv = document.createElement("div");
        aceDiv.id = "ace-container";
        aceDiv.style.height = 'calc( 100% - 20px )';
        aceDiv.style.width = '100%';

        let blackboardTabContent = mainTabs.getTabContent("Blackboard");
        blackboardTabContent.appendChild(aceDiv);

        let editor = ace.edit("ace-container", {
            theme: "ace/theme/twilight",
            mode: "ace/mode/javascript",
        });
editor.setValue(`{
    DoorIsOpen: () => false,
    DoorIsSmashed: () => true,  

    WalkToDoor: () => TypedBTree.State.SUCCEEDED,
    OpenDoor: () => TypedBTree.State.FAILED,
    UnlockDoor: () => TypedBTree.State.FAILED,
    SmashDoor: () => {},
    WalkThroughDoor: () => TypedBTree.State.SUCCEEDED,
    CloseDoor: () => TypedBTree.State.SUCCEEDED,
    ScreamLoudly: () => TypedBTree.State.SUCCEEDED,
    MutterAngrily: () => TypedBTree.State.SUCCEEDED
}`);
        //split mainarea
        this.createSidePanel();

        this.mainArea.getSection(0).split("vertical", [null, "100px"], true);
        // mainarea.getSection(0).onresize = function() {
        //     canvas.redraw();
        // };
        //mainarea.resize();

        mainmenu.add("file/new");
        mainmenu.add("file/open");
        mainmenu.add("file/save");
        mainmenu.add("edit/undo");
        mainmenu.add("edit/redo");
        mainmenu.add("edit/");
        mainmenu.add("edit/copy", {
            callback: function () {
                console.log("COPY");
            }
        });
        mainmenu.add("edit/paste");
        mainmenu.add("edit/clear");

        mainmenu.add("view/fixed size", {
            callback: function () {
                LiteGUI.setWindowSize(1000, 600);
            }
        });
        mainmenu.add("view/");
        mainmenu.add("view/side panel", {
            callback: () => {
                this.createSidePanel();
            }
        });
        mainmenu.add("view/maximize", {
            callback: function () {
                LiteGUI.setWindowSize();
            }
        });

        mainmenu.add("debug/dialog", {
            callback: function () {
                //createDialog();
            }
        });

        mainmenu.add("debug/message", {
            callback: function () {
                LiteGUI.showMessage("This is an example of message");
            }
        });

        let signalSingletonInst = SignalSingleton.getInstance();
        signalSingletonInst.onSetScheme.add(this.onSetScheme, this);
        signalSingletonInst.onOpenTree.add(this.onOpenTree, this);
        signalSingletonInst.onSetTree.add(this.onSetTree, this);

        TreeVis();

    }


    createSidePanel() {
        this.mainArea.split("horizontal", [null, 340], true);

        var docked = new Panel("right_panel", {title: 'Docked panel', close: true});

        this.mainArea.getSection(1).add(docked);

        //docked.dockTo( mainarea.getSection(1).content,"full");
        //docked.show();
        LiteGUI.bind(docked, "closed", () => {
            this.mainArea.merge();
        });

        (window as any).sidepanel = docked;

        this.updateSidePanel(docked);
    }

    updateSidePanel(root?) {
        root = root || (window as any).sidepanel;
        root.content.innerHTML = "";

        //tabs
        var tabs_widget = new Tabs();
        tabs_widget.addTab("Aliases", {selected: true, width: "100%", height: 200});
        tabs_widget.addTab("Enums", {selected: true, width: "100%", height: 200});
        tabs_widget.addTab("Nodes", {selected: true, width: "100%", height: 200});
        tabs_widget.addTab("Tree", {selected: true, width: "100%", height: 200});

        //tree
        var mytree = {};

        this.treeTreeview = new Tree(mytree, {collapsed_depth: 10, allow_rename: false});
        this.aliasTreeview = new Tree(mytree, {allow_rename: true});
        this.enumTreeview = new Tree(mytree, {allow_rename: false});
        this.nodesTreeview = new Tree(mytree, {allow_rename: false});
        LiteGUI.bind(this.treeTreeview.root, "item_selected", function (e) {
            console.log("Node selected: ", e.detail);
        });
        var tree_tab_content = tabs_widget.getTabContent("Tree");
        tree_tab_content.appendChild(this.treeTreeview.root);

        tabs_widget.getTabContent("Aliases").appendChild(this.aliasTreeview.root);
        LiteGUI.bind(this.aliasTreeview.root, "item_selected", function (e) {
            console.log("Node selected: ", e.detail);
        });

        tabs_widget.getTabContent("Enums").appendChild(this.enumTreeview.root);
        LiteGUI.bind(this.enumTreeview.root, "item_selected", function (e) {
            console.log("Node selected: ", e.detail);
        });

        tabs_widget.getTabContent("Nodes").appendChild(this.nodesTreeview.root);
        LiteGUI.bind(this.nodesTreeview.root, "item_selected", function (e) {
            console.log("Node selected: ", e.detail);
        });


        root.add(tabs_widget);

        //side panel widget
        var widgets = new Inspector();
        widgets.onchange = function (name, value, widget) {
            console.log("Widget change: " + name + " -> " + value);
        };
        root.content.appendChild(widgets.root);

        //mainarea.resize();
    }
}