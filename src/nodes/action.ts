import Leaf from './leaf';
import {State} from "../state";
import Decorator from "../decorators/decorator";

export default class Action extends Leaf {
    toJSON(){
        return {
            $type: this._actionName,
            ...this._actionData,
            state: this.getStateAsString()
        }
    };

    private readonly _actionName: any;
    private readonly _actionData: any;
    private updatePromiseStateResult: null;
    private isUsingUpdatePromise: boolean;
    /**
     * An Action leaf node.
     * This represents an immediate or ongoing state of behaviour.
     * @param decorators The node decorators.
     * @param actionName The action name.
     */
    constructor(decorators : Decorator[], actionName, actionData? : any) {
        super("action", decorators);

        /**
         * Whether there is a pending update promise.
         */
        let isUsingUpdatePromise = false;

        /**
         * The finished state result of an update promise.
         */
        let updatePromiseStateResult = null;

        this._actionName = actionName;
        this._actionData = actionData;
    }

    _validateUpdateResult(result) {
        switch (result) {
            case State.SUCCEEDED:
            case State.FAILED:
            case undefined:
                return;
            default:
                throw `action '${this._actionName}' 'onUpdate' returned an invalid response, expected an optional State.SUCCEEDED or State.FAILED value to be returned`;
        }
    }

    getName() {
        return this._actionName;
    }

    _validateAction(action) : void {
        // The action should be defined.
        if (!action) {
            throw `cannot update action node as action '${this._actionName}' is not defined in the blackboard`;
        }

        // The action will need to be a function or an object, anything else is not valid.
        if (typeof action !== "function") {
            throw `action '${this._actionName}' must be a function`;
        }
    }

    reset() {
        // Reset the state of this node.
        this.setState(State.READY);

        // There is no longer an update promise that we care about.
        this.isUsingUpdatePromise     = false;
        this.updatePromiseStateResult = null;
    }

    onUpdate(board) {
        // Get the corresponding action object or function.
        const action = board[this._actionName];


        // If the result of this action depends on an update promise then there is nothing to do until
        // it resolves, unless there has been a value set as a result of the update promise resolving.
        if (this.isUsingUpdatePromise) {
            // Check whether the update promise has resolved with a state value.
            if (this.updatePromiseStateResult) {
                // Set the state of this node to match the state returned by the promise.
                this.setState(this.updatePromiseStateResult);
            }

            return;
        }

        // Validate the action.
        this._validateAction(action);

        // Call the action 'onUpdate' function, the result of which may be:
        // - The finished state of this action node.
        // - A promise to return a finished node state.
        // - Undefined if the node should remain in the running state.
        let updateResult;
        if(this._actionData)
            updateResult = action.call(board, this._actionData);
        else
            updateResult = action.call(board);

        if (updateResult instanceof Promise) {
            updateResult.then(
                (result) => {
                    // If 'isUpdatePromisePending' is null then the promise was cleared as it was resolving, probably via an abort of reset.
                    if (!this.isUsingUpdatePromise) {
                        return;
                    }

                    // Check to make sure the result is a valid finished state.
                    if (result !== State.SUCCEEDED && result !== State.FAILED) {
                        throw "action node promise resolved with an invalid value, expected a State.SUCCEEDED or State.FAILED value to be returned";
                    }

                    // Set pending update promise state result to be processed on next update.
                    this.updatePromiseStateResult = result;
                },
                (reason) => {
                    // If 'isUpdatePromisePending' is null then the promise was cleared as it was resolving, probably via an abort of reset.
                    if (!this.isUsingUpdatePromise) {
                        return;
                    }

                    // Just throw whatever was returned as the rejection argument.
                    throw reason;
                }
            );

            // This node will be in the 'RUNNING' state until the update promise resolves.
            this.setState(State.RUNNING);

            // We are now waiting for the promise returned by the use to resolve before we know what state this node is in.
            this.isUsingUpdatePromise = true;
        } else {
            // Validate the returned value.
            this._validateUpdateResult(updateResult);

            // Set the state of this node, this may be undefined, which just means that the node is still in the 'RUNNING' state.
            this.setState(updateResult || State.RUNNING);
        }
    }
};

