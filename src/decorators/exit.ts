import Decorator from './decorator'

/**
 * An EXIT decorator which defines a blackboard function to call when the decorated node is updated and moves to a finished state or is aborted.
 * @param functionName The name of the blackboard function to call.
 */
export default class Exit extends Decorator {
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
     * @param isSuccess Whether the decorated node was left with a success state.
     * @param isAborted Whether the decorated node was aborted.
     */
    callBlackboardFunction = (board, isSuccess, isAborted) => {
        // Call the blackboard function if it exists.
        if (typeof board[this.functionName] === "function") {
            board[this.functionName].call(board, this._fnData, { succeeded: isSuccess, aborted: isAborted });
        } else {
            throw `cannot call exit decorator function '${this.functionName}' is not defined in the blackboard`;
        }
    };
};
