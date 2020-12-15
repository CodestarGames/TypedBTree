import {observable, action, computed, reaction, makeObservable, makeAutoObservable, autorun} from "mobx"
import {createContext} from "react"
import BehaviourTree from "../../runtime/behaviourtree";
import * as graphVisualizer from "../../visualizer/app";


class AppStore {

    graphVisualizer: any;

    constructor() {
        makeAutoObservable(this);
        reaction(() => this.blackboard && this.definition, _ => this._loadTree());
        reaction(() => this.interval, _ => {
            if(!this.interval)
                return;

            // Check to make sure that the user specified an integer value.
            if (isNaN(Number(this.interval))) {
                alert("step interval must be an integer value");
                return;
            }

            // Create an interval to step the tree until it is finished.
            this.playIntervalId = setInterval(() => {
                // Step the behaviour tree, if anything goes wrong we will stop the tree playback.
                try {
                    this.behaviourTree.step();
                } catch (exception) {
                    // Notify the user of the exception.
                    alert(exception);

                    // Reload the visualiser.
                    this.reloadVisualiser();
                }

                // Rebuild the tree view.
                this.buildTreeView();

                // If the tree root is in a finished state then stop the interval.
                if (!this.behaviourTree.isRunning()) {
                    clearInterval(this.playIntervalId);

                    // Clear the play interval id.
                    this.playIntervalId = null;
                    this.setInterval(null);
                }
            }, parseInt(this.interval, 10));
        });
    }

    @action
    setInterval(val) {
        this.interval = val;
    }

    @observable interval: string = '';

    behaviourTree: BehaviourTree = null;

    @observable definition: string = '';

    playIntervalId: any = null;

    @observable blackboard: string = '';


    @action setBlackboard(value: string) {
        this.blackboard = value;
    }

    @action
    playTree = () => {

        // If there is no behaviour tree then there is nothing to do here.
        if (!this.behaviourTree) {
            return;
        }

        //reset the tree
        this._loadTree();

        // Get an interval duration with which to step the tree.
        let interval = prompt("Please enter a step interval in milliseconds", "100");
        this.setInterval(interval);

    }

    private _onReloadVisualiser() {
        // Stop any tree playback.
        if (this.playIntervalId) {
            clearInterval(this.playIntervalId);

            // Clear the play interval id.
            this.playIntervalId = null;
        }

        this._loadTree();

        // Build the tree view.
        this.buildTreeView();
    };

    reloadVisualiser = () => {
        this._onReloadVisualiser();
    }

    private _loadTree() {

        if (this.graphVisualizer.getCurrentTreeJson()) {
            this.definition = this.graphVisualizer.getCurrentTreeJson();
        }

        // Try to create the behaviour tree.
        if(this.definition && this.blackboard) {
            let statesStr = `
            const State = {
    READY: Symbol("typedBTree.ready"),
    RUNNING: Symbol("typedBTree.running"),
    SUCCEEDED: Symbol("typedBTree.succeeded"),
    FAILED: Symbol("typedBTree.failed")
};
            `;
            this.behaviourTree = new BehaviourTree(this.definition, new Function(statesStr + ' return ' + this.blackboard)());
            this.graphVisualizer.enqueueRuntimeTree(JSON.stringify(this.behaviourTree.rootNode), true);
        }
    }

    private buildTreeView() {
        this.graphVisualizer.enqueueRuntimeTree(JSON.stringify(this.behaviourTree.rootNode), false)
    }
}

export default createContext(new AppStore())
