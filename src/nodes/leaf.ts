import Node from './node'
import Decorator from "../decorators/decorator";

export default abstract class Leaf extends Node {
    /**
     * A leaf node.
     * @param type The node type.
     * @param decorators The node decorators.
     */
    protected constructor(type, decorators : Decorator[]) {
        super(type, decorators);

    }

    isLeafNode() {
        return true;
    }

    onUpdate(board: any) {
    }
};

