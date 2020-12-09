import {ASTNodeFactories, DecoratorFactories} from "./rootASTNodesBuilder";
import Decorator from "./decorators/decorator";

export class RootNodesBuilder {

    //used for reference storage
    stack = [[]];

    TraverseContent(contentItem: Array<any>) {
        contentItem.forEach((item, index, array) => {

            let node;

            if (item['$type'] === "AI.Items.Root") {
                node = ASTNodeFactories.ROOT();

                this.stack[this.stack.length - 1].push(node);

                this.stack.push(node.children);

                // Try to pick any decorators off of the token stack.
                //node.decorators = this.getDecorators(item.hooks);
                node.decorators = this.getDecorators(item.hooks);

                // recursively process nested objects
                if (item.children) {
                    this.TraverseContent([item.children]);
                    this.stack.pop();
                }

                return;
            }

            if (item['$type'] === "AI.Items.Selector") {
                node = ASTNodeFactories.SELECTOR();
                this.handleChildren(node, item);
                node.decorators = this.getDecorators(item.hooks);
                return;
            }

            if (item['$type'] === "AI.Items.Sequence") {
                node = ASTNodeFactories.SEQUENCE();
                this.handleChildren(node, item);
                node.decorators = this.getDecorators(item.hooks);
                return;
            }

            if (item['$type'] === "AI.Items.Repeat") {
                node = ASTNodeFactories.REPEAT();
                //TODO: set props
                node.iterations = item[`$data.times`];
                this.handleChildren(node, item);
                node.decorators = this.getDecorators(item.hooks);
                return;
            }

            if (item['$type'] === "AI.Items.Lotto") {
                node = ASTNodeFactories.LOTTO();
                //TODO: set props
                node.props = {tickets: item[`$data.tickets`]};
                this.handleChildren(node, item);
                node.decorators = this.getDecorators(item.hooks);
                return;
            }

            if (item['$type'] === "AI.Items.Flip") {
                node = ASTNodeFactories.FLIP();

                this.handleChildren(node, item);
                node.decorators = this.getDecorators(item.hooks);

                return;
            }

            if (item['$type'] === "AI.Items.Parallel") {
                node = ASTNodeFactories.PARALLEL();

                this.handleChildren(node, item);
                node.decorators = this.getDecorators(item.hooks);
                return;
            }

            if (item['$type'].indexOf('AI.Items.Actions')  > -1) {
                node = ASTNodeFactories.ACTION();
                this.stack[this.stack.length-1].push(node);

                node.actionName = item['$type'];//.split(".").reverse()[0];
                let {$type, ...theRest} = item;
                node.props = theRest;

                // Try to pick any decorators off of the token stack.
                node.decorators = this.getDecorators(item.hooks);

            }

            if (item['$type'].indexOf('AI.Items.Condition')  > -1) {
                node = ASTNodeFactories.CONDITION();
                this.stack[this.stack.length-1].push(node);

                node.conditionFunction = item['condition']['$type'];

                // Try to pick any decorators off of the token stack.
                node.decorators = this.getDecorators(item.hooks);

            }

            if (item['$type'].indexOf('AI.Items.Wait')  > -1) {
                node = ASTNodeFactories.WAIT();
                this.stack[this.stack.length-1].push(node);
                node.duration = item[`$data.duration`];
                // Try to pick any decorators off of the token stack.
                node.decorators = this.getDecorators(item.hooks);

            }


        });

        return this.stack[0];
    }

    private handleChildren(node: any, item: any) {
        this.stack[this.stack.length - 1].push(node);

        if(typeof item.children === 'object' && Array.isArray(item.children) === false){
            item.children = [item.children];
        }

        this.stack.push(node.children);

        // Try to pick any decorators off of the token stack.
        //node.decorators = this.getDecorators(item.hooks);

        // recursively process nested objects
        if (item.children && item.children.length > 0) {
            this.TraverseContent(item.children);
            this.stack.pop();
        }
    }

    private getDecorators(hooks: Array<any>) {
        let decorators: Decorator[] = [];
        hooks && hooks.forEach(hook => {
            let decorator;
            switch (hook.$type) {
                case "AI.Hooks.Until":
                    decorator = DecoratorFactories.UNTIL(hook.condition.$type);
                    decorators.push(decorator);
                    break;
                case "AI.Hooks.While":
                    decorator = DecoratorFactories.WHILE(hook.condition.$type);
                    decorators.push(decorator);
                    break;
                case "AI.Hooks.Entry":
                    var {$type, ...theRest} = hook.action;
                    decorator = DecoratorFactories.ENTRY($type, theRest);
                    decorators.push(decorator);
                    break;
                case "AI.Hooks.Step":
                    var {$type, ...theRest} = hook.action;
                    decorator = DecoratorFactories.STEP($type, theRest);
                    decorators.push(decorator);
                    break;
                case "AI.Hooks.Exit":
                    var {$type, ...theRest} = hook.action;
                    decorator = DecoratorFactories.EXIT($type, theRest);
                    decorators.push(decorator);
                    break;
                }

        })
        return decorators;
    }

}
