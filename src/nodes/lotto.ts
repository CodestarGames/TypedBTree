import Composite from './composite'
import {State} from "../state";

export default class Lotto extends Composite {
    private readonly _tickets: any;
    private winningChild: any;
    /**
     * A LOTTO node.
     * A winning child is picked on the initial update of this node, based on ticket weighting.
     * The state of this node will match the state of the winning child.
     * @param decorators The node decorators.
     * @param tickets The child node tickets
     * @param children The child nodes.
     */
    constructor(decorators, tickets, children) {
        super("lotto", decorators, children);

        /**
         * The winning child node.
         */
        let winningChild;

        /**
         * Represents a lotto draw.
         */


        this._tickets = tickets;
        this._children = children;
    }



    getName() {
        return this._tickets.length ? `LOTTO [${this._tickets.join(",")}]` : "LOTTO";
    }

    onUpdate(board) {
        // If this node is in the READY state then we need to pick a winning child node.
        if (this.is(State.READY)) {
            // Create a lotto draw.
            const lottoDraw = new LottoDraw();

            // Add each child of this node to a lotto draw, with each child's corresponding ticket weighting, or a single ticket if not defined.
            this._children.forEach((child, index) => lottoDraw.add(child, this._tickets[index] || 1));

            // Randomly pick a child based on ticket weighting.
            this.winningChild = lottoDraw.draw();
        }

        // If the winning child has never been updated or is running then we will need to update it now.
        if (this.winningChild.getState() === State.READY || this.winningChild.getState() === State.RUNNING) {
            this.winningChild.update(board);
        }

        // The state of the lotto node is the state of its winning child.
        this.setState(this.winningChild.getState());
    }

    toJSON() {
        return {
            $type: "AI.Items.Lotto",
            children: this._children,
            state: this.getStateAsString()
        }
    }
};

interface IParticipant {
    participant: any;
    tickets: any
}

class LottoDraw {

    constructor() {

    }
    /**
     * The participants
     */
    participants = new Array<any>();

    /**
     * Add a participant.
     * @param participant The participant.
     * @param tickets The number of tickets held by the participant.
     */
    add(participant, tickets) {
        this.participants.push({ participant, tickets });
        return this;
    };

    /**
     * Draw a winning participant.
     * @returns A winning participant.
     */
    draw() {
        // We cannot do anything if there are no participants.
        if (!this.participants.length) {
            throw "cannot draw a lotto winner when there are no participants";
        }

        const pickable = new Array<any>();

        this.participants.forEach((item : IParticipant) => {
            for (let ticketCount = 0; ticketCount < item.tickets; ticketCount++) {
                pickable.push(item.participant);
            }
        });

        return this.getRandomItem(pickable);
    };

    /**
     * Get a random item form an array.
     * @param items Th array of items.
     * @returns The randomly picked item.
     */
    getRandomItem(items) {
        // We cant pick a random item from an empty array.
        if (!items.length) {
            return undefined;
        }

        // Return a random item.
        return items[Math.floor(Math.random() * items.length)];
    }

}