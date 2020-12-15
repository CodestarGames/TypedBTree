import GuardUnsatisifedException from './guardUnsatisifedException'

/**
 * Represents a path of node guards along a root-to-leaf tree path.
 * @param nodes An array of objects defining a node instance -> guard link, ordered by node depth.
 */
export class GuardPath {

    private readonly nodes : any;

    constructor(nodes) {
        this.nodes = nodes;
    }

    /**
     * Evaluate guard conditions for all guards in the tree path, moving outwards from the root.
     * @param board The blackboard, required for guard evaluation.
     * @returns An evaluation results object.
     */
    evaluate(board) {
        // We need to evaluate guard conditions for nodes up the tree, moving outwards from the root.
        for (const details of this.nodes) {
            // There can be multiple guards per node.
            for (const guard of details.guards) {
                // Check whether the guard condition passes, and throw an exception if not.
                if (!guard.isSatisfied(board)) {
                    throw new GuardUnsatisifedException(details.node);
                }
            }
        }
    };
};