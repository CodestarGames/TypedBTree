import Decorator from './decorator'

/**
 * An ENTRY decorator which defines a blackboard function to call when the decorated node is updated and moves out of running state.
 * @param functionName The name of the blackboard function to call.
 */
export default class Entry extends Decorator {
    private functionName: any;

    constructor(functionName) {
        super();
        this.functionName = functionName;
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
            board[this.functionName].call(board);
        } else {
            throw `cannot call entry decorator function '${this.functionName}' is not defined in the blackboard`;
        }
    };
};
