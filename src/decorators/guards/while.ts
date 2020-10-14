import Decorator from '../decorator'

/**
 * A WHILE guard which is satisfied as long as the given condition remains true.
 * @param condition The name of the condition function that determines whether the guard is satisfied.
 */
export default class While extends Decorator {

    private readonly condition: any;

    constructor(condition) {
        super();
        this.condition = condition;
    }

    /**
     * Gets whether the decorator is a guard.
     */
    isGuard = () => true;

    /**
     * Gets the condition of the guard.
     */
    getCondition = () => this.condition;

    /**
     * Gets the decorator details.
     */
    getDetails = () => {
        return {
            type: this.getType(),
            isGuard: this.isGuard(),
            condition: this.getCondition()
        };
    };

    /**
     * Gets whether the guard is satisfied.
     * @param board The board.
     * @returns Whether the guard is satisfied.
     */
    isSatisfied = (board) => {
        // Call the condition function to determine whether this guard is satisfied.
        if (typeof board[this.condition] === "function") {
            return !!(board[this.condition].call(board));
        } else {
            throw `cannot evaluate node guard as function '${this.condition}' is not defined in the blackboard`;
        }
    };

    toJSON(){
        return {
            "$type": "AI.Hooks.While",
            "condition": this.condition && { $type: this.condition }
        }
    }

};
