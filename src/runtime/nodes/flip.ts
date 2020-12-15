import Composite from './composite'
import {State} from "../state";

export default class Flip extends Composite {
    private _child: any;
    /**
     * A Flip node.
     * This node wraps a single child and will flip the state of the child state.
     * @param decorators The node decorators.
     * @param child The child node.
     */
    constructor(decorators, child) {
        super("flip", decorators, [child]);

        this._child = child;
    }

    getName() {
        return "FLIP";
    }

    onUpdate(board) {
        // If the child has never been updated or is running then we will need to update it now.
        if (this._child.getState() === State.READY || this._child.getState() === State.RUNNING) {
            this._child.update(board);
        }

        // The state of this node will depend in the state of its child.
        switch (this._child.getState()) {
            case State.RUNNING:
                this.setState(State.RUNNING);
                break;

            case State.SUCCEEDED:
                this.setState(State.FAILED);
                break;

            case State.FAILED:
                this.setState(State.SUCCEEDED);
                break;

            default:
                this.setState(State.READY);
        }
    }

    toJSON() {
        return {
            hooks: this.getDecorators(),
            $type: "AI.Items.Flip",
            children: this._child,
            state: this.getStateAsString()
        }
    }
};

