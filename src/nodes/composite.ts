import Node from './node'
import {State} from "../state";
import Exit from "../decorators/exit";

export default class Composite extends Node {
    protected _children: any;
    onUpdate(board: any) {
        throw new Error('Method not implemented.');
    }

    /**
     * A composite node that wraps child nodes.
     * @param type The node type.
     * @param decorators The node decorators.
     * @param children The child nodes.
     */
    constructor(type, decorators, children) {
        super(type, decorators);

        this._children = children;
    }

    getChildren() {
        return this._children;
    }

    abort(board) {
        // There is nothing to do if this node is not in the running state.
        if (!this.is(State.RUNNING)) {
            return;
        }

        // Abort any child nodes.
        this.getChildren().forEach((child: Node) => child.abort(board));

        // Reset the state of this node.
        this.reset();

        // Try to get the exit decorator for this node.
        const exitDecorator : Exit = this.getDecorator<Exit>("exit");

        // Call the exit decorator function if it exists.
        if (exitDecorator) {
            exitDecorator.callBlackboardFunction(board, false, true);
        }
    }

    reset() {
        // Reset the state of this node.
        this.setState(State.READY);

        // Reset the state of any child nodes.
        this.getChildren().forEach(child => child.reset());
    }

    isLeafNode() {
        return false;
    }

    getName() {

    }
};

