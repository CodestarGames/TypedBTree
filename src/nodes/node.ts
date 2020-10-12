import GuardUnsatisifedException from '../decorators/guards/guardUnsatisifedException';
import {State} from "../state";
import Entry from "../decorators/entry";
import Exit from "../decorators/exit";
import Step from "../decorators/step";

export default abstract class Node {
  private readonly _type: any;
  private readonly _decorators: any;
  private state: any;
  private guardPath: any;
  private readonly uid: any;
  /**
   * A base node.
   * @param type The node type.
   * @param decorators The node decorators.
   */
  protected constructor(type, decorators) {
    /**
     * The node uid.
     */
    this.uid = createNodeUid();
    /**
     * The node state.
     */
    this.state = State.READY;
    /**
     * The guard path to evaluate as part of a node update.
     */
    this.guardPath = null;

    this._type = type;
    this._decorators = decorators;
  }

  getDecorators() {
    return this._decorators || [];
  }

  getDecorator<T>(type) {
    return this.getDecorators().filter((decorator) => decorator.getType().toUpperCase() === type.toUpperCase())[0] || null;
  }

  update(board) : void {
    // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
    if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
        // We have not changed state.
        return;
    }

    try {
      // Evaluate all of the guard path conditions for the current tree path.
      this.guardPath.evaluate(board);

      // If this node is in the READY state then call the ENTRY decorator for this node if it exists.
      if (this.is(State.READY)) {
        const entryDecorator: Entry = this.getDecorator<Entry>("entry");

        // Call the entry decorator function if it exists.
        if (entryDecorator) {
          entryDecorator.callBlackboardFunction(board);
        }
      }

      // Try to get the step decorator for this node.
      const stepDecorator: Step = this.getDecorator<Step>("step");

      // Call the step decorator function if it exists.
      if (stepDecorator) {
        stepDecorator.callBlackboardFunction(board);
      }

      // Do the actual update.
      this.onUpdate(board);

      // If this node is now in a 'SUCCEEDED' or 'FAILED' state then call the EXIT decorator for this node if it exists.
      if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
        const exitDecorator: Exit = this.getDecorator<Exit>("exit");

        // Call the exit decorator function if it exists.
        if (exitDecorator) {
          exitDecorator.callBlackboardFunction(board, this.is(State.SUCCEEDED), false);
        }
      }
    } catch (error) {
      // If the error is a GuardUnsatisfiedException then we need to determine if this node is the source.
      if (error instanceof GuardUnsatisifedException && error.isSourceNode(this)) {
        // Abort the current node.
        this.abort(board);

        // Any node that is the source of an abort will be a failed node.
        this.setState(State.FAILED);
      } else {
        throw error;
      }
    }
  }

  is(value) {
    return this.state === value;
  }

  hasGuardPath() {
    return !!this.guardPath;
  }

  getUid() {
    return this.uid;
  }

  getState() {
    return this.state;
  }

  getStateAsString() {
    const convertNodeStateToString = (state) => {
      switch (state) {
        case State.RUNNING:
          return "running";
        case State.SUCCEEDED:
          return "succeeded";
        case State.FAILED:
          return "failed";
        default:
          return "ready";
      }
    };

    return convertNodeStateToString(this.state);
  }

  getType() {
    return this._type;
  }

  abstract getName();

  abort(board) {
    // There is nothing to do if this node is not in the running state.
    if (!this.is(State.RUNNING)) {
      return;
    }

    // Reset the state of this node.
    this.reset();

    // Try to get the exit decorator for this node.
    const exitDecorator: Exit = this.getDecorator<Exit>("exit");

    // Call the exit decorator function if it exists.
    if (exitDecorator) {
      exitDecorator.callBlackboardFunction(board, false, true);
    }
  }

  setGuardPath(value) {
    return this.guardPath = value;
  }

  setState(value) {
    return this.state = value;
  }

  reset() {
    // Reset the state of this node.
    this.setState(State.READY);
  }

  getGuardDecorators() {
    return this.getDecorators().filter((decorator) => decorator.isGuard());
  }

  abstract onUpdate(board: any)
  abstract toJSON();
};

/**
 * Create a randomly generated node uid.
 * @returns A randomly generated node uid.
 */
export function createNodeUid() {
  var S4 = function() {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}