/**
 * @file Responsible for displaying tree nodes.
 */

import * as Tree from "../tree";
import * as TreeScheme from "../treescheme";
import * as Utils from "../utils";
import { Vector } from "../utils";
import * as Svg from "./svg";
import {FieldValueType} from "../treescheme/treescheme";
import {nodeWidth} from "../tree/positionlookup";
import {getParent} from "../tree/path";
import {svgRoot} from "./svg";

/** Callback for when a tree is changed, returns a new immutable tree. */
export type treeChangedCallback = (newTree: Tree.INode) => void;

/**
 * Draw the given tree.
 * @param scheme Scheme that the given tree follows.
 * @param root Root node for the tree to draw.
 * @param changed Callback that is invoked when the user changes the tree.
 */
export function setTree(
    scheme: TreeScheme.IScheme,
    root: Tree.INode | undefined,
    changed: treeChangedCallback | undefined): void {

    if (root === undefined) {
        Svg.setContent(undefined);
        svgRoot.insertAdjacentHTML('beforebegin', `<defs>
      <pattern id="smallGrid" width="8" height="8" patternUnits="userSpaceOnUse">
        <path d="M 8 0 L 0 0 0 8" fill="none" stroke="gray" stroke-width="0.5"/>
      </pattern>
      <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
        <rect width="100" height="100" fill="url(#smallGrid)"/>
        <path d="M 80 0 L 0 0 0 80" fill="none" stroke="gray" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />`);
        return;
    }

    root.collapsed = false;

    const typeLookup = TreeScheme.TypeLookup.createTypeLookup(scheme, root);
    const positionLookup = Tree.PositionLookup.createPositionLookup(root);

    Svg.setContent(b => {
        positionLookup.nodes.forEach(node => {
            createNode(b, node, typeLookup, positionLookup, newNode => {
                if (changed !== undefined) {
                    changed(Tree.Modifications.treeWithReplacedNode(root, node, newNode));
                }
            });
        // positionLookup.nodes.forEach((node, index) => {
        //     if(index === 0){
        //         createNode(b, node, typeLookup, positionLookup, newNode => {
        //             if (changed !== undefined) {
        //                 changed(Tree.Modifications.treeWithReplacedNode(root, node, newNode));
        //             }
        //         });
        //     }
        //     else
        //     if(getParent(root, node).node.collapsed === false) {
        //         createNode(b, node, typeLookup, positionLookup, newNode => {
        //             if (changed !== undefined) {
        //                 changed(Tree.Modifications.treeWithReplacedNode(root, node, newNode));
        //             }
        //         });
        //     }
         });
    });
    Svg.setContentOffset(positionLookup.rootOffset);
}

/** Focus the given tree on the display. */
export function focusTree(maxScale?: number): void {
    Svg.focusContent(maxScale);
}

/**
 * Zoom on the tree, use positive delta for zooming-in and negative delta for zooming-out.
 * @param delta Number indicating how far to zoom. (Use negative numbers for zooming out)
 */
export function zoom(delta: number = 0.1): void {
    Svg.zoom(delta);
}

const nodeHeaderHeight = Tree.PositionLookup.nodeHeaderHeight;
const halfNodeHeaderHeight = nodeHeaderHeight * .5;
const nodeFieldHeight = Tree.PositionLookup.nodeFieldHeight;
const nodeInputSlotOffset: Vector.IVector2 = { x: 0, y: 12.5 };
const nodeTooltipSize: Vector.IVector2 = { x: 450, y: 75 };
const nodeConnectionCurviness = .7;

type nodeChangedCallback = (newNode: Tree.INode) => void;

function createNode(
    builder: Svg.IBuilder,
    node: Tree.INode,
    typeLookup: TreeScheme.TypeLookup.ITypeLookup,
    positionLookup: Tree.PositionLookup.IPositionLookup,
    changed: nodeChangedCallback): void {

    let definition: TreeScheme.INodeDefinition | undefined;
    if (node.type !== Tree.noneNodeType) {
        definition = typeLookup.getDefinition(node);
    }
    const typeOptions = getTypeOptions(typeLookup, node);
    const typeOptionsIndex = typeOptions.findIndex(a => a === node.type);
    const size = positionLookup.getSize(node);
    const nodeElement = builder.addElement("node", positionLookup.getPosition(node));
    let backgroundClass = node.type === Tree.noneNodeType ? "nonenode-background" : "node-background";

    if(definition) {

        if(node.state !== 'ready'){
            backgroundClass += ' ' + node.state;
        }
        else {
            if (definition.nodeType.indexOf('$$.Root') > -1)
                backgroundClass += ' tree-view-icon-root';

            if (definition.nodeType.indexOf('$$.Actions') > -1)
                backgroundClass += ' tree-view-icon-action';

            if (definition.nodeType.indexOf('$$.Repeat') > -1)
                backgroundClass += ' tree-view-icon-repeat';

            if (definition.nodeType.indexOf('$$.Sequence') > -1)
                backgroundClass += ' tree-view-icon-sequence';

            if (definition.nodeType.indexOf('$$.Selector') > -1)
                backgroundClass += ' tree-view-icon-selector';

            if (definition.nodeType.indexOf('$$.Wait') > -1)
                backgroundClass += ' tree-view-icon-wait';

            if (definition.nodeType.indexOf('$$.Condition') > -1)
                backgroundClass += ' tree-view-icon-condition';

            if (definition.nodeType.indexOf('$$.Parallel') > -1)
                backgroundClass += ' tree-view-icon-parallel';

            if (definition.nodeType.indexOf('$$.Lotto') > -1)
                backgroundClass += ' tree-view-icon-lotto';

            if (definition.nodeType.indexOf('$$.Flip') > -1)
                backgroundClass += ' tree-view-icon-flip';
        }
    }

    nodeElement.addRect(backgroundClass, size, Vector.zeroVector);

    if(definition && definition.comment) {
        const descElement = nodeElement.addElement("node-info-1", {x: 0, y: -32});
        descElement.addRect("node-description-rect", {x: nodeWidth * .75, y: 32}, {x: 0, y: 0});
        descElement.addText(
            "node-description-text",
            definition ? definition.comment || '' : '',
            {x: 8, y: 16},
            {x: nodeWidth * .75, y: 32});
    }
    nodeElement.addDropdown(
        "node-type",
        typeOptionsIndex,
        typeOptions,
        /* Ugly offsets to compensate for styling of select elements */
        { x: 10, y:16 },
        { x: size.x - 10, y: 36  },
        newIndex => {
            const newNodeType = typeOptions[newIndex];
            const newNode = TreeScheme.Instantiator.changeNodeType(typeLookup.scheme, node, newNodeType);
            changed(newNode);
        });
    nodeElement.addButton(
        "node-collapse",
        node.collapsed ? '+' : "-",
        { x: nodeWidth - 48, y: halfNodeHeaderHeight - 3 },
        { x: 40, y: 40 },
        newIndex => {
            node.collapsed = !node.collapsed;
            changed(node);
        })

    let yOffset = nodeHeaderHeight;
    if(node.collapsed === false) {
        node.fieldNames.forEach(fieldName => {
            yOffset += createField(node, definition, fieldName, nodeElement, positionLookup, yOffset, newField => {
                changed(Tree.Modifications.nodeWithField(node, newField));
            });
        });
    }
    else {
            //
            // node.children && node.children.forEach(child => {
            //     addConnection(nodeElement, {x: nodeWidth, y: halfNodeHeaderHeight}, getRelativeVector(node, child, positionLookup));
            // })


    }

    if (definition !== undefined && definition.comment !== undefined) {
        const infoElement = nodeElement.addElement("node-info", Vector.zeroVector);
        infoElement.addGraphics("node-info-button", "info", { x: 12, y: halfNodeHeaderHeight });

        const toolTipElement = infoElement.addElement("node-tooltip", { x: 25, y: -26 });
        toolTipElement.addRect("node-tooltip-background", nodeTooltipSize, Vector.zeroVector);
        toolTipElement.addText(
            "node-tooltip-text",
            definition.comment,
            { x: 0, y: Utils.half(nodeTooltipSize.y) },
            nodeTooltipSize);
    }
}

type fieldChangedCallback<T extends Tree.Field> = (newField: T) => void;

function createField(
    node: Tree.INode,
    nodeDefinition: TreeScheme.INodeDefinition | undefined,
    fieldName: string,
    parent: Svg.IElement,
    positionLookup: Tree.PositionLookup.IPositionLookup,
    yOffset: number,
    changed: fieldChangedCallback<Tree.Field>): number {

    const field = node.getField(fieldName);
    if (field === undefined) {
        return 0;
    }
    let fieldDefinition: TreeScheme.IFieldDefinition | undefined;
    if (nodeDefinition !== undefined) {
        fieldDefinition = nodeDefinition.getField(fieldName);
    }
    const fieldSize = { x: positionLookup.getSize(node).x, y: Tree.PositionLookup.getFieldHeight(field) };
    const centeredYOffset = yOffset + Utils.half(nodeFieldHeight);
    const nameWidth = Utils.half(fieldSize.x) + 20;

    parent.addRect(`${field.kind}-value-background`, fieldSize, { x: 0, y: yOffset });
    parent.addText(
        "fieldname",
        `${field.name}:`,
        { x: 10, y: centeredYOffset },
        { x: nameWidth - 45, y: nodeFieldHeight });

    // Value
    switch (field.kind) {
        case "stringArray":
        case "jsonArray":
        case "numberArray":
        case "booleanArray":
        case "nodeArray":
            createArrayFieldValue(field, changed);
            break;
        default:
            createNonArrayFieldValue(field, changed);
            break;
    }
    return fieldSize.y;

    function createNonArrayFieldValue<T extends Tree.NonArrayField>(
        field: T,
        changed: fieldChangedCallback<T>): void {

        createElementValue(field.value, 0, 0, newElement => {
            changed(Tree.Modifications.fieldWithValue(field, newElement as Tree.FieldValueType<T>));
        }, field.kind === 'json');
    }

    function createArrayFieldValue<T extends Tree.ArrayField>(
        field: T,
        changed: fieldChangedCallback<T>): void {

        const array = field.value as ReadonlyArray<Tree.FieldElementType<T>>;

        /* NOTE: There are some ugly casts here because the type-system cannot quite follow what
        we are doing here. */

        // Add element button.
        parent.addGraphics("fieldvalue-button", "arrayAdd", { x: nameWidth - 30, y: centeredYOffset }, () => {
            if (fieldDefinition === undefined) {
                throw new Error("Unable to create a new element without a FieldDefinition");
            }
            const newElement = TreeScheme.Instantiator.createNewElement(fieldDefinition.valueType);
            const newArray = array.concat(newElement as Tree.FieldElementType<T>);
            changed(Tree.Modifications.fieldWithValue(field, newArray as unknown as Tree.FieldValueType<T>));
        });

        for (let i = 0; i < field.value.length; i++) {
            const element = array[i];
            const yOffset = i * nodeFieldHeight;
            const yPos = centeredYOffset + yOffset;

            // Element deletion button.
            parent.addGraphics("fieldvalue-button", "arrayDelete", { x: nameWidth - 15, y: yPos }, () => {
                const newArray = Utils.withoutElement(array, i)
                changed(Tree.Modifications.fieldWithValue(field, newArray as unknown as Tree.FieldValueType<T>));
            });

            // Element duplicate button.
            parent.addGraphics("fieldvalue-button", "arrayDuplicate", { x: nameWidth, y: yPos }, () => {
                const newArray = Utils.withExtraElement(array, i,
                    field.kind === "nodeArray" ? Tree.Modifications.cloneNode(element as Tree.INode) : element);
                changed(Tree.Modifications.fieldWithValue(field, newArray as unknown as Tree.FieldValueType<T>));
            });

            // Reorder buttons.
            parent.addGraphics("fieldvalue-button", "arrayOrderUp", { x: nameWidth + 13, y: yPos - 5 }, () => {
                // If item is the first then move it to the end, otherwise move it one toward the front.
                const newArray = i === 0 ?
                    Utils.withExtraElement(Utils.withoutElement(array, i), array.length - 1, array[0]) :
                    Utils.withSwappedElements(array, i, i - 1);
                changed(Tree.Modifications.fieldWithValue(field, newArray as unknown as Tree.FieldValueType<T>));
            });
            parent.addGraphics("fieldvalue-button", "arrayOrderDown", { x: nameWidth + 13, y: yPos + 5 }, () => {
                // If the item is the last then move it to the front, otherwise move it one toward to end.
                const newArray = i === array.length - 1 ?
                    Utils.withExtraElement(Utils.withoutElement(array, i), 0, array[array.length - 1]) :
                    Utils.withSwappedElements(array, i, i + 1);
                changed(Tree.Modifications.fieldWithValue(field, newArray as unknown as Tree.FieldValueType<T>));
            });

            // Element value.
            createElementValue(element, 20, yOffset, newElement => {
                changed(Tree.Modifications.fieldWithElement(field, newElement, i));
            });
        }
    }

    type elementChangedCallback<T extends Tree.FieldElement> = (newText: T) => void;

    function createElementValue<T extends Tree.FieldElement>(
        element: T,
        xOffset: number,
        yOffset: number,
        changed: elementChangedCallback<T>,
        isJson?: boolean
    ): void {

        const pos: Vector.Position = { x: nameWidth + xOffset, y: centeredYOffset + yOffset } //+ (Tree.PositionLookup.getFieldHeight(field) / 2) - 16};
        const size: Vector.Size = { x: fieldSize.x - pos.x, y: nodeFieldHeight };
        if(isJson) {
            createStringValue(JSON.stringify(element, null, 2), pos, size, ((newVal) => {
                newVal = JSON.parse(newVal);
                changed(newVal);
            }) as elementChangedCallback<any>);
            return;
        }
        switch (typeof element) {
            case "string": createStringValue(element, pos, size, changed as elementChangedCallback<string>); break;
            case "number": createNumberValue(element, pos, size, changed as elementChangedCallback<number>); break;
            case "boolean": createBooleanValue(element, pos, size, changed as elementChangedCallback<boolean>); break;
            default: createNodeValue(element as Tree.INode, pos, size); break;
        }

    }

    function createStringValue(
        value: string,
        pos: Vector.Position,
        size: Vector.Size,
        changed: elementChangedCallback<string>): void {

        // If the number is an listItem then display it as a dropdown.
        if (fieldDefinition !== undefined) {
            const listItem = TreeScheme.validateListItemType(fieldDefinition.valueType);
            if (listItem !== undefined) {
                const currentIndex = listItem.values.findIndex(entry => entry.name === value);
                const options = listItem.values.map(entry => `${entry.name}`);
                parent.addDropdown("list-item-value", currentIndex, options, pos, size, newIndex => {
                    changed(listItem.values[newIndex].name);
                });
                return;
            }
        }

        parent.addEditableText("string-value", value, pos, size, changed);
    }

    function createNumberValue(
        value: number,
        pos: Vector.Position,
        size: Vector.Size,
        changed: elementChangedCallback<number>): void {

        // If the number is an enumeration then display it as a dropdown.
        if (fieldDefinition !== undefined) {
            const enumeration = TreeScheme.validateEnumType(fieldDefinition.valueType);
            if (enumeration !== undefined) {
                const currentIndex = enumeration.values.findIndex(entry => entry.value === value);
                const options = enumeration.values.map(entry => `${entry.value}: ${entry.name}`);
                parent.addDropdown("enum-value", currentIndex, options, pos, size, newIndex => {
                    changed(enumeration.values[newIndex].value);
                });
                return;
            }
        }

        // Otherwise display it as a number input.
        parent.addEditableNumber("number-value", value, pos, size, changed);
    }

    // function createCondValue(
    //     value: string,
    //     pos: Vector.Position,
    //     size: Vector.Size,
    //     changed: elementChangedCallback<string>): void {
    //
    //     // If the number is an enumeration then display it as a dropdown.
    //     if (fieldDefinition !== undefined) {
    //         const listItem = TreeScheme.validateListItemType(fieldDefinition.valueType);
    //         if (listItem !== undefined) {
    //             const currentIndex = listItem.values.findIndex(entry => entry.name === value);
    //             const options = listItem.values.map(entry => `${entry.name}: ${entry.name}`);
    //             parent.addDropdown("listItem-value", currentIndex, options, pos, size, newIndex => {
    //                 changed(listItem.values[newIndex].name);
    //             });
    //             return;
    //         }
    //     }
    //
    //     // Otherwise display it as a number input.
    //     parent.addEditableText("string-value", value, pos, size, changed);
    // }

    function createBooleanValue(
        value: boolean,
        pos: Vector.Position,
        size: Vector.Size,
        changed: elementChangedCallback<boolean>): void {

        parent.addEditableBoolean("boolean-value", value, pos, size, changed);
    }

    function createNodeValue(
        value: Tree.INode,
        pos: Vector.Position,
        size: Vector.Size): void {

        addConnection(parent, { x: fieldSize.x - 12, y: pos.y }, getRelativeVector(node, value, positionLookup));
    }
}

function addConnection(parent: Svg.IElement, from: Vector.Position, to: Vector.Position): void {
    parent.addGraphics("nodeOutput", "nodeConnector", from);

    const target = Vector.add(to, nodeInputSlotOffset);
    const c1 = { x: Utils.lerp(from.x, target.x, nodeConnectionCurviness), y: from.y };
    const c2 = { x: Utils.lerp(target.x, from.x, nodeConnectionCurviness), y: target.y };
    parent.addBezier("connection", from, c1, c2, target);
}

function getRelativeVector(
    from: Tree.INode,
    to: Tree.INode,
    positionLookup: Tree.PositionLookup.IPositionLookup): Vector.IVector2 {

    return Vector.subtract(positionLookup.getPosition(to), positionLookup.getPosition(from));
}

function getTypeOptions(typeLookup: TreeScheme.TypeLookup.ITypeLookup, node: Tree.INode): Tree.NodeType[] {
    const alias = typeLookup.getAlias(node);
    const result = alias.values.slice();
    // Add the none-type
    result.unshift(Tree.noneNodeType);
    return result;
}
