/**
 * A base node decorator.
 * @param type The node decorator type.
 */
export default abstract class Decorator {

    /**
     * Gets the type of the node.
     */
    getType = () => this.constructor.name;
  
    /**
     * Gets whether the decorator is a guard.
     */
    isGuard = () => false;

    /**
     * Gets the decorator details.
     */
    getDetails = () => ({ type: this.getType() });

};