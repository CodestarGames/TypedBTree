#TypedBTree

A tool to declaratively define and generate behaviour trees in JavaScript. Behaviour trees are used to create complex AI via the modular heirarchical composition of individual tasks.

Using this tool, trees can be defined with a simple and minimal built-in DSL, avoiding the need to write verbose definitions in JSON.


## Install

```sh
$ npm install --save typedBTree
```

# Example
```js
import { State, BehaviourTree } from "typedBTree";

/** Define some behaviour for an entity. */
const definition = `root {
    sequence {
        action [Walk]
        action [Fall]
        action [Laugh]
    }
}`;

/** Create the blackboard, the object to hold tasks and state for a tree instance. */
const board = {
    Walk: () => {
        console.log("walking!");
        return State.SUCCEEDED;
    },
    Fall: () => {
        console.log("falling!");
        return State.SUCCEEDED;
    },
    Laugh: () => {
        console.log("laughing!");
        return State.SUCCEEDED;
    },
};

/** Create the behaviour tree. */
const behaviourTree = new BehaviourTree(definition, board);

/** Step the tree. */
behaviourTree.step();

// 'walking!'
// 'falling!
// 'laughing!'
```

# Behaviour Tree Methods

#### .isRunning()
Returns `true` if the tree is in the `RUNNING` state, otherwise `false`.

#### .getState()
Gets the current tree state of `SUCCEEDED`, `FAILED` or `RUNNING`.

#### .step()
Carries out a node update that traverses the tree from the root node outwards to any child nodes, skipping those that are already in a resolved state of `SUCCEEDED` or `FAILED`. After being updated, leaf nodes will have a state of `SUCCEEDED`, `FAILED` or `RUNNING`. Leaf nodes that are left in the `RUNNING` state as part of a tree step will be revisited each subsequent step until they move into a resolved state of either `SUCCEEDED` or `FAILED`, after which execution will move through the tree to the next node with a state of `READY`.

Calling this method when the tree is already in a resolved state of `SUCCEEDED` or `FAILED` will cause it to be reset before tree traversal begins.

#### .reset()
Resets the tree from the root node outwards to each nested node, giving each a state of `READY`.


# Nodes

## States
Behaviour tree nodes can be in one of the following states:
- **READY** A node is in a ready state when it has not been visited yet in the execution of the tree.
- **RUNNING** A node is in a running state when it is is still being processed, these nodes will usually represent or encompass a long running action.
- **SUCCEEDED** A node is in a succeeded state when it is no longer being processed and has succeeded.
- **FAILED** A node is in a failed state when it is no longer being processed but has failed.

