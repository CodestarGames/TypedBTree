import Action from './nodes/action'
import Condition from './nodes/condition'
import Flip from './nodes/flip'
import Lotto from './nodes/lotto'
import Repeat from './nodes/repeat'
import Root from './nodes/root'
import Selector from './nodes/selector'
import Sequence from './nodes/sequence'
import Parallel from './nodes/parallel'
import Wait from './nodes/wait'
import While from './decorators/guards/while'
import Until from './decorators/guards/until'
import Entry from './decorators/entry'
import Exit from './decorators/exit'
import Step from './decorators/step'
import Leaf from "./nodes/leaf";

/**
 * The node decorator factories.
 */
export const DecoratorFactories = {
    "WHILE": (condition) => new While(condition),
    "UNTIL": (condition) => new Until(condition),
    "ENTRY": (functionName) => new Entry(functionName),
    "EXIT": (functionName) => new Exit(functionName),
    "STEP": (functionName) => new Step(functionName)
};
type ValidatorFunc = (depth: any) => void;
type NodeFunc = (namedRootNodeProvider: any, visitedBranches: any) => (Node | Leaf | null);

interface IAstNode {
    type: string;
    decorators?: any[];
    name?: string | null;
    children: any[];
    validate?: ValidatorFunc;
    createNodeInstance?: NodeFunc;
    props?: {
        [key: string]: any
    };
}

/**
 * The AST node factories.
 */
export const ASTNodeFactories = {
    "ROOT": () : any => ({
        type: "root",
        decorators: [],
        name: null,
        children: [],
        validate: function (depth) {
            // A root node cannot be the child of another node.
            if (depth > 1) {
                throw "a root node cannot be the child of another node";
            }

            // A root node must have a single child node.
            if (this.children.length !== 1) {
                throw "a root node must have a single child";
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new Root(
                this.decorators,
                this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
            );
        }
    }),
    "BRANCH": () : any => ({
        type: "branch",
        props: {
            branchName: ""
        },
        validate: function (depth) {},
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {

            // Try to find the root node with a matching branch name.
            const targetRootNode = namedRootNodeProvider(this.props?.branchName);

            // If we have already visited this branch then we have a circular dependency.
            if (visitedBranches.indexOf(this.props?.branchName) !== -1) {
                throw `circular dependency found in branch node references for branch '${this.props?.branchName}'`;
            }

            // If we have a target root node, then the node instance we want will be the first and only child of the referenced root node.
            if (targetRootNode) {
                return targetRootNode.createNodeInstance(namedRootNodeProvider, visitedBranches.concat(this.props?.branchName)).getChildren()[0];
            } else {
                throw `branch references root node '${this.props?.branchName}' which has not been defined`;
                return null;
            }
        }
    }),
    "SELECTOR": () : IAstNode => ({
        type: "selector",
        decorators: [],
        children: [],
        validate: function (depth) {
            // A selector node must have at least a single node.
            if (this.children.length < 1) {
                throw "a selector node must have at least a single child";
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new Selector(
                this.decorators,
                this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
            );
        }
    }),
    "SEQUENCE": () : IAstNode => ({
        type: "sequence",
        decorators: [],
        children: [],
        validate: function (depth) {
            // A sequence node must have at least a single node.
            if (this.children.length < 1) {
                throw "a sequence node must have at least a single child";
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new Sequence(
                this.decorators,
                this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
            );
        }
    }),
    "PARALLEL": () : IAstNode => ({
        type: "parallel",
        decorators: [],
        children: [],
        validate: function (depth) {
            // A parallel node must have at least a single node.
            if (this.children.length < 1) {
                throw "a parallel node must have at least a single child";
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new Parallel(
                this.decorators,
                this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
            );
        }
    }),
    "LOTTO": () : IAstNode => ({
        type: "lotto",
        decorators: [],
        children: [],
        props: {
            tickets: []
        },
        validate: function (depth) {
            // A lotto node must have at least a single node.
            if (this.children.length < 1) {
                throw "a lotto node must have at least a single child";
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new Lotto(
                this.decorators,
                this.props?.tickets,
                this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
            );
        }
    }),
    "REPEAT": () : any => ({
        type: "repeat",
        decorators: [],
        iterations: null,
        maximumIterations: null,
        children: [],
        validate: function (depth) {
            // A repeat node must have a single node.
            if (this.children.length !== 1) {
                throw "a repeat node must have a single child";
            }

            // A repeat node must have a positive number of iterations if defined.
            if (this.iterations !== null && this.iterations < 0) {
                this.iterations = null;
            }

            // There is validation to carry out if a longest duration was defined.
            if (this.maximumIterations !== null) {
                // A repeat node must have a positive maximum iterations count if defined.
                if (this.maximumIterations < 0) {
                    throw "a repeat node must have a positive maximum iterations count if defined";
                }

                // A repeat node must not have an iteration count that exceeds the maximum iteration count.
                if (this.iterations > this.maximumIterations) {
                    throw "a repeat node must not have an iteration count that exceeds the maximum iteration count";
                }
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new Repeat(
                this.decorators,
                this.iterations,
                this.maximumIterations,
                this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
            );
        }
    }),
    "FLIP": () : IAstNode => ({
        type: "flip",
        decorators: [],
        children: [],
        validate: function (depth) {
            // A flip node must have a single node.
            if (this.children.length !== 1) {
                throw "a flip node must have a single child";
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new Flip(
                this.decorators,
                this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
            );
        }
    }),
    "CONDITION": () : any => ({
        type: "condition",
        decorators: [],
        conditionFunction: "",
        validate: function (depth) {},
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new Condition(
                this.decorators,
                this.conditionFunction
            );
        }
    }),
    "WAIT": () : any => ({
        type: "wait",
        decorators: [],
        duration: null,
        longestDuration: null,
        validate: function (depth) {
            // A wait node must have a positive duration.
            if (this.duration < 0) {
                throw "a wait node must have a positive duration";
            }

            // There is validation to carry out if a longest duration was defined.
            if (this.longestDuration) {
                // A wait node must have a positive longest duration.
                if (this.longestDuration < 0) {
                    throw "a wait node must have a positive longest duration if one is defined";
                }

                // A wait node must not have a duration that exceeds the longest duration.
                if (this.duration > this.longestDuration) {
                    throw "a wait node must not have a shortest duration that exceeds the longest duration";
                }
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new Wait(
                this.decorators,
                this.duration,
                this.longestDuration
            );
        }
    }),
    "ACTION": () : any => ({
        type: "action",
        decorators: [],
        actionName: "",
        props: {},
        validate: function (depth) {},
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new Action(
                this.decorators,
                this.actionName,
                this.props
            );
        }
    })
};