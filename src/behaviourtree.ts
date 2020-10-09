import {GuardPath} from './decorators/guards/guardPath';
import buildRootASTNodes from './rootASTNodesBuilder';
import {State} from "./state";
import Root from "./nodes/root";
import Composite from "./nodes/composite";
import composite from "./nodes/composite";
import Node from "./nodes/node";
import {RootNodesBuilder} from "./rootNodesBuilder";

/**
 * The behaviour tree.
 * @param definition The tree definition.
 * @param board The board.
 */
export default class BehaviourTree {

    private readonly _blackboard: unknown;
    private _rootNode: Root;
    private rootNodeMap: any;
    private rootASTNodes: any[];

    constructor(definition: unknown, board: unknown) {
        this._blackboard = board;

        // Call init logic.
        this._init(definition, board);
    }



    /**
     * Initialise the BehaviourTree instance.
     */
    _init(definition, board) {
        // The tree definition must be defined and a valid string.
        if (typeof definition !== "string") {
            throw new Error("the tree definition must be a string");
        }

        // The blackboard must be defined.
        if (typeof board !== 'object' || board === null) {
            throw new Error("the blackboard must be defined");
        }

        try {

            this.rootASTNodes = new RootNodesBuilder().TraverseContent([JSON.parse(definition)]);

            // Try to create the behaviour tree AST from tokens, this could fail if the definition is invalid.
            //this.rootASTNodes = buildRootASTNodes(tokens);

            // Create a symbol to use as the main root key in our root node mapping.
            const mainRootNodeKey = Symbol("__root__");

            // Create a mapping of root node names to root AST tokens. The main root node will have a key of Symbol("__root__").
            this.rootNodeMap = {};
            for (const rootASTNode of this.rootASTNodes) {
                this.rootNodeMap[rootASTNode.name === null ? mainRootNodeKey : rootASTNode.name] = rootASTNode;
            }

            // Create a provider for named root nodes.
            const namedRootNodeProvider = (name) =>  this.rootNodeMap[name];

            // Convert the AST to our actual tree.
            this._rootNode = this.rootNodeMap[mainRootNodeKey].createNodeInstance(namedRootNodeProvider, []);

            // Set a guard path on every leaf of the tree to evaluate as part of its update.
            this._applyLeafNodeGuardPaths();
        } catch (exception) {
            // There was an issue in trying to parse and build the tree definition.
            throw new Error(`error parsing tree: ${exception}`);
        }
    };

    /**
     * Parse the BT tree definition into an array of raw tokens.
     * @returns An array of tokens parsed from the definition.
     */
    _parseTokensFromDefinition(definition) {
        // Firstly, create a copy of the raw definition.
        let cleansedDefinition = definition;

        // Add some space around various important characters so that they can be plucked out easier as individual tokens.
        cleansedDefinition = cleansedDefinition.replace(/\(/g, " ( ");
        cleansedDefinition = cleansedDefinition.replace(/\)/g, " ) ");
        cleansedDefinition = cleansedDefinition.replace(/\{/g, " { ");
        cleansedDefinition = cleansedDefinition.replace(/\}/g, " } ");
        cleansedDefinition = cleansedDefinition.replace(/\]/g, " ] ");
        cleansedDefinition = cleansedDefinition.replace(/\[/g, " [ ");
        cleansedDefinition = cleansedDefinition.replace(/\,/g, " , ");

        // Split the definition into raw token form and return it.
        return cleansedDefinition.replace(/\s+/g, " ").trim().split(" ");
    };

    /**
     * Apply guard paths for every leaf node in the behaviour tree.
     */
    _applyLeafNodeGuardPaths() {
        this._getAllNodePaths().forEach((path : any) => {
            // Each node in the current path will have to be assigned a guard path, working from the root outwards.
            for (let depth = 0; depth < path.length; depth++) {
                // Get the node in the path at the current depth.
                const currentNode = path[depth];

                // The node may already have been assigned a guard path, if so just skip it.
                if (currentNode.hasGuardPath()) {
                    continue;
                }

                // Create the guard path for the current node.
                const guardPath = new GuardPath(
                    path
                        .slice(0, depth + 1)
                        .map((node : Node) => ({ node, guards: node.getGuardDecorators() }))
                        .filter((details) => details.guards.length > 0)
                )

                // Assign the guard path to the current node.
                currentNode.setGuardPath(guardPath);
            }
        });
    };

    /**
     * Gets a multi-dimensional array of root->leaf node paths.
     * @returns A multi-dimensional array of root->leaf node paths.
     */
    _getAllNodePaths() : unknown[] {
        const nodePaths = new Array<any>();

        const findLeafNodes = (path : any, node: Composite) => {
            // Add the current node to the path.
            path = path.concat(node);

            // Check whether the current node is a leaf node. 
            if (node.isLeafNode()) {
                nodePaths.push(path);
            } else {
                node.getChildren().forEach((child: composite) => findLeafNodes(path, child));
            }
        };

        // Find all leaf node paths, starting from the root.
        findLeafNodes([], this._rootNode);

        return nodePaths;
    };


    /**
     * Gets the root node.
     * @returns The root node.
     */
    getRootNode() {
        return this._rootNode;
    };

    /**
     * Gets the flattened details of every node in the tree.
     * @returns The flattened details of every node in the tree.
     */
    getFlattenedNodeDetails() {
        // Create an empty flattened array of tree nodes.
        const flattenedTreeNodes = new Array<any>();

        /**
         * Helper function to process a node instance and push details into the flattened tree nodes array.
         * @param node The current node.
         * @param parentUid The UID of the node parent, or null if the node is the main root node.
         */
        const processNode = (node: Node, parentUid) => {
            /**
             * Helper function to get details for all node decorators.
             * @param decorators The node decorators.
             * @returns The decorator details for a node.
             */
            const getDecoratorDetails = (decorators) =>
                decorators.length > 0 ? decorators.map((decorator) => decorator.getDetails()) : null;

            // Push the current node into the flattened nodes array.
            flattenedTreeNodes.push({
                id: node.getUid(),
                type: node.getType(),
                caption: node.getName(),
                state: node.getState(),
                decorators: getDecoratorDetails(node.getDecorators()),
                parentId: parentUid
            });

            if(node instanceof Composite) {
                // Process each of the nodes children if it is not a leaf node.
                if (!node.isLeafNode()) {
                    node.getChildren().forEach((child) => processNode(child, node.getUid()));
                }
            }
        };

        // Convert the nested node structure into a flattened array of node details.
        processNode(this._rootNode, null);

        return flattenedTreeNodes;
    };

    /**
     * Gets whether the tree is in the running state.
     * @returns Whether the tree is in the running state.
     */
    isRunning() {
        return this._rootNode.getState() === State.RUNNING;
    };

    /**
     * Gets the current tree state.
     * @returns The current tree state.
     */
    getState() {
        return this._rootNode.getState();
    };

    /**
     * Step the tree.
     */
    step() {
        // If the root node has already been stepped to completion then we need to reset it.
        if (this._rootNode.getState() === State.SUCCEEDED || this._rootNode.getState() === State.FAILED) {
            this._rootNode.reset();
        }

        try {
            this._rootNode.update(this._blackboard);
        } catch (exception) {
            throw new Error(`error stepping tree: ${exception}`);
        }
    };

    /**
     * Reset the tree from the root.
     */
    reset() {
        this._rootNode.reset();
    };

}

