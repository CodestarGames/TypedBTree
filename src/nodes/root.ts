import Composite from './composite'
import {State} from "../state";

export default class Root extends Composite {
    private _child: any;
    /**
     * A Root node.
     * The root node will have a single child.
     * @param decorators The node decorators.
     * @param child The child node.
     */
    constructor(decorators, child) {
        super("root", decorators, [child]);

        this._child = child;
    }

    getName() {
        return "ROOT";
    }

    onUpdate(board) {
        // If the child has never been updated or is running then we will need to update it now.
        if (this._child.getState() === State.READY || this._child.getState() === State.RUNNING) {
            // Update the child of this node.
            this._child.update(board);
        }

        // The state of the root node is the state of its child.
        this.setState(this._child.getState());
    }
};

