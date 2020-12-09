import Decorator from './decorator'

/**
 * An ENTRY decorator which defines a blackboard function to call when the decorated node is updated and moves out of running state.
 * @param functionName The name of the blackboard function to call.
 */
export default class Entry extends Decorator {
    private functionName: any;
    private _fnData: any;

    constructor(functionName, fnData) {
        super();
        this.functionName = functionName;
        this._fnData = fnData;
    }

    /**
     * Gets the function name.
     */
    getFunctionName = () => this.functionName;

    /**
     * Gets the decorator details.
     */
    getDetails = () => {
        return {
            type: this.getType(),
            isGuard: this.isGuard(),
            functionName: this.getFunctionName()
        };
    };

    /**
     * Attempt to call the blackboard function that this decorator refers to.
     * @param board The board.
     */
    callBlackboardFunction = (board) => {
        // Call the blackboard function if it exists.
        if (typeof board[this.functionName] === "function") {
            board[this.functionName].call(board, this._fnData);
        } else {
            throw `cannot call entry decorator function '${this.functionName}' is not defined in the blackboard`;
        }
    };

    //TODO: come back to these
    toJSON(){
        return {
            "$type": "AI.Hooks.Entry",
            "action": this.getFunctionName()
        }
    }
};
