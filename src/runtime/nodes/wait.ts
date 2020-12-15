import Leaf from './leaf'
import {State} from "../state";

export default class Wait extends Leaf {
    private readonly _duration: any;
    private readonly _longestDuration: any;
    private initialUpdateTime: number;
    private waitDuration: any;
    /**
     * A WAIT node.
     * The state of this node will change to SUCCEEDED after a duration of time.
     * @param decorators The node decorators.
     * @param duration The duration that this node will wait to succeed in milliseconds, or the earliest if longestDuration is defined.
     * @param longestDuration The longest possible duration in milliseconds that this node will wait to succeed.
     */
    constructor(decorators, duration, longestDuration) {
        super("wait", decorators);

        /**
         * The time in milliseconds at which this node was first updated.
         */
        let initialUpdateTime;

        /**
         * The duration in milliseconds that this node will be waiting for.
         */
        let waitDuration;

        this._duration = duration;
        this._longestDuration = longestDuration;
    }

    getName() {
        return `WAIT ${this._longestDuration ? this._duration + "ms-" + this._longestDuration + "ms" : this._duration + "ms"}`;
    }

    onUpdate(board) {
        // If this node is in the READY state then we need to set the initial update time.
        if (this.is(State.READY)) {
            // Set the initial update time.
            this.initialUpdateTime = new Date().getTime();

            // If a longestDuration value was defined then we will be randomly picking a duration between the
            // shortest and longest duration. If it was not defined, then we will be just using the duration.
            this.waitDuration = this._longestDuration ? Math.floor(Math.random() * (this._longestDuration - this._duration + 1) + this._duration) : this._duration;

            // The node is now running until we finish waiting.
            this.setState(State.RUNNING);
        }

        // Have we waited long enough?
        if (new Date().getTime() >= (this.initialUpdateTime + this.waitDuration)) {
            // We have finished waiting!
            this.setState(State.SUCCEEDED);
        }
    }

    toJSON() {
        return {
            hooks: this.getDecorators(),
            $type: "AI.Items.Wait",
            "$data.duration": this._duration,
            state: this.getStateAsString()
        }
    }
};

