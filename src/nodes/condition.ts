import Leaf from './leaf'
import {State} from "../state";

export default class Condition extends Leaf {
    private readonly _condition: any;
    /**
     * A Condition leaf node.
     * This will succeed or fail immediately based on a board predicate, without moving to the 'RUNNING' state.
     * @param decorators The node decorators.
     * @param condition The name of the condition function.
     */
    constructor(decorators, condition) {
        super("condition", decorators);

        this._condition = condition;
    }

    getName() {
        return this._condition;
    }

    onUpdate(board) {
        // Call the condition function to determine the state of this node, but it must exist in the blackboard.
        if (typeof board[this._condition] === "function") {
            this.setState(!!(board[this._condition].call(board)) ? State.SUCCEEDED : State.FAILED);
        } else {
            throw `cannot update condition node as function '${this._condition}' is not defined in the blackboard`;
        }
    }
};

