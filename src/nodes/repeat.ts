import Composite from './composite'
import {State} from "../state";

export default class Repeat extends Composite {
    private readonly _iterations: any;
    private readonly _maximumIterations: any;
    private _child: any;
    private currentIterationCount: number;
    private targetIterationCount: number | null;
    /**
     * A REPEAT node.
     * The node has a single child which can have:
     * -- A number of iterations for which to repeat the child node.
     * -- An infinite repeat loop if neither an iteration count or a condition function is defined.
     * The REPEAT node will stop and have a 'FAILED' state if its child is ever in a 'FAILED' state after an update.
     * The REPEAT node will attempt to move on to the next iteration if its child is ever in a 'SUCCEEDED' state.
     * @param decorators The node decorators.
     * @param iterations The number of iterations to repeat the child node, or the minimum number of iterations if maximumIterations is defined.
     * @param maximumIterations The maximum number of iterations to repeat the child node.
     * @param child The child node.
     */
    constructor(decorators, iterations, maximumIterations, child) {
        super("repeat", decorators, [child]);

        /**
         * The number of target iterations to make.
         */
        this.targetIterationCount = null;

        /**
         * The current iteration count.
         */
        this.currentIterationCount = 0;

        this._iterations = iterations;
        this._maximumIterations = maximumIterations;
        this._child = child;
    }

    getName() {
        if (this._iterations !== null) {
            return `REPEAT ${ this._maximumIterations ? this._iterations + "x-" + this._maximumIterations + "x" : this._iterations + "x" }`;
        }

        // Return the default repeat node name.
        return "REPEAT";
    }

    reset() {
        // Reset the state of this node.
        this.setState(State.READY);

        // Reset the current iteration count.
        this.currentIterationCount = 0;

        // Reset the child node.
        this._child.reset();
    }

    _canIterate() {
        if (this.targetIterationCount !== null) {
            // We can iterate as long as we have not reached our target iteration count.
            return this.currentIterationCount < this.targetIterationCount;
        }

        // If neither an iteration count or a condition function were defined then we can iterate indefinitely.
        return true;
    }

    onUpdate(board) {
        // If this node is in the READY state then we need to reset the child and the target iteration count.
        if (this.is(State.READY)) {
            // Reset the child node.
            this._child.reset();

            // Set the target iteration count.
            this._setTargetIterationCount();
        }

        // Do a check to see if we can iterate. If we can then this node will move into the 'RUNNING' state.
        // If we cannot iterate then we have hit our target iteration count, which means that the node has succeeded.
        if (this._canIterate()) {
            // This node is in the running state and can do its initial iteration.
            this.setState(State.RUNNING);

            // We may have already completed an iteration, meaning that the child node will be in the SUCCEEDED state.
            // If this is the case then we will have to reset the child node now.
            if (this._child.getState() === State.SUCCEEDED) {
                this._child.reset();
            }

            // Update the child of this node.
            this._child.update(board);

            // If the child moved into the FAILED state when we updated it then there is nothing left to do and this node has also failed.
            // If it has moved into the SUCCEEDED state then we have completed the current iteration.
            if (this._child.getState() === State.FAILED) {
                // The child has failed, meaning that this node has failed.
                this.setState(State.FAILED);

                return;
            } else if (this._child.getState() === State.SUCCEEDED) {
                // We have completed an iteration.
                this.currentIterationCount += 1;
            }
        } else {
            // This node is in the 'SUCCEEDED' state as we cannot iterate any more.
            this.setState(State.SUCCEEDED);
        }
    }

    _setTargetIterationCount() {
        // Are we dealing with a finite number of iterations?
        if (typeof this._iterations === "number") {
            // If we have maximumIterations defined then we will want a random iteration count bounded by iterations and maximumIterations.
            this.targetIterationCount = (typeof this._maximumIterations === "number") ?
                Math.floor(Math.random() * (this._maximumIterations - this._iterations + 1) + this._iterations) :
                this._iterations;
        } else {
            this.targetIterationCount = null;
        }
    }

    toJSON() {
        return {
            $type: "AI.Items.Repeat",
            times: this._iterations,
            children: this._children,
            state: this.getStateAsString()
        }
    }
};

