/**
 * @file Responsible for parsing tree-scheme's from json.
 */

import * as Utils from "../utils";
import * as TreeScheme from "./treescheme";
import { schemas, rootAlias, baseItemAliases } from 'TypedBTreeRuntime/src';

/**
 * Load a scheme as json from the given file or url.
 * @param source Source to get the json from (Can be a file or a url).
 * @returns Scheme or parse failure.
 */
export async function load(source: File | string): Promise<Utils.Parser.ParseResult<TreeScheme.IScheme>> {
    const loadTextResult = await (typeof source === "string" ?
        Utils.Parser.loadTextFromUrl(source) :
        Utils.Parser.loadTextFromFile(source));

    if (loadTextResult.kind === "error") {
        return loadTextResult;
    }
    return parseJson(loadTextResult.value);
}

/**
 * Parse a scheme from a json string.
 * @param jsonString Json to parse.
 * @returns Tree or parse failure.
 */
export function parseJson(jsonString: string): Utils.Parser.ParseResult<TreeScheme.IScheme> {
    let jsonObj: any;
    try {
        jsonObj = JSON.parse(jsonString);

        //TODO: write the base typedbtree schema nodes here. iterate through all the base classes for this.

    } catch (e) {
        return Utils.Parser.createError(`Parsing failed: ${e}`);
    }

    try {
        return Utils.Parser.createSuccess(parseScheme(jsonObj));
    } catch (e) {
        return Utils.Parser.createError(`Parsing failed: ${e}`);
    }
}

/**
 * Parse a scheme from a object.
 * @param object Object to parse.
 * @returns Scheme or parse failure.
 */
export function parseObject(object: any): Utils.Parser.ParseResult<TreeScheme.IScheme> {
    try {
        return Utils.Parser.createSuccess(parseScheme(object));
    } catch (e) {
        return Utils.Parser.createError(`Parsing failed: ${e}`);
    }
}

function parseScheme(obj: any): TreeScheme.IScheme {
    if (obj === undefined || obj === null || typeof obj !== "object") {
        throw new Error("Invalid input obj");
    }

    //append base fields to json.
    obj = Object.assign(obj, rootAlias);
    obj.nodes = obj.nodes.concat(Object.values(schemas));
    let itemIndex = obj.aliases.findIndex(item => item.identifier === '$$.Item');
    let baseItemIndex = baseItemAliases.findIndex(item => item.identifier === '$$.Item');
    baseItemAliases[baseItemIndex].values = baseItemAliases[baseItemIndex].values.concat(obj.aliases[itemIndex].values);

    let actionIndex = obj.aliases.findIndex(item => item.identifier === '$$.Action');
    let baseActionIndex = baseItemAliases.findIndex(item => item.identifier === '$$.Action');
    baseItemAliases[baseActionIndex].values = baseItemAliases[baseActionIndex].values.concat(obj.aliases[actionIndex].values);

    obj.aliases = baseItemAliases;


    const rootAliasIdentifier = Utils.Parser.validateString(obj.rootAlias);
    if (rootAliasIdentifier === undefined) {
        throw new Error(`Root-alias identifier '${obj.rootAlias}' of scheme is invalid`);
    }

    return TreeScheme.createScheme(rootAliasIdentifier, schemeBuilder => {
        parseAliases(schemeBuilder, obj);
        parseEnums(schemeBuilder, obj);
        parseListItems(schemeBuilder, obj);
        parseNodes(schemeBuilder, obj);
    });
}

function parseAliases(schemeBuilder: TreeScheme.ISchemeBuilder, obj: any): void {
    if (!Utils.Parser.isArray(obj.aliases)) {
        return;
    }

    (obj.aliases as any[]).forEach(aliasObj => {

        // Parse identifier
        const identifier = Utils.Parser.validateString(aliasObj.identifier);
        if (identifier === undefined) {
            throw new Error(`Identifier '${identifier}' of alias is invalid`);
        }

        // Parse values
        const values = Utils.Parser.validateStringArray(aliasObj.values);
        if (values === undefined) {
            throw new Error(`Values array '${values}' of alias is invalid`);
        }

        // Add to scheme
        if (schemeBuilder.pushAlias(identifier, values) === undefined) {
            throw new Error(`Unable to push alias '${identifier}', is it a duplicate?`);
        }
    });
}

function parseListItems(schemeBuilder: TreeScheme.ISchemeBuilder, obj: any): void {
    if (!Utils.Parser.isArray(obj.listItems)) {
        return;
    }

    (obj.listItems as any[]).forEach(listItemObj => {

        // Parse identifier
        const identifier = Utils.Parser.validateString(listItemObj.identifier);
        if (identifier === undefined) {
            throw new Error(`Identifier '${identifier}' of listItem is invalid`);
        }

        // Parse values
        const values: TreeScheme.IListItemEntry[] = [];
        if (!Utils.Parser.isArray(listItemObj.values)) {
            throw new Error(`ListItem '${identifier}' has no values`);
        }

        (listItemObj.values as any[]).forEach(valueObj => {
            const name = Utils.Parser.validateString(valueObj.name);
            if (name === undefined) {
                throw new Error(`ListItem '${identifier}' has a entry that is missing a 'name' field`);
            }
            values.push({ name });
        });

        // Add to scheme
        if (schemeBuilder.pushListItem(identifier, values) === undefined) {
            throw new Error(`Unable to push listItem '${identifier}', is it a duplicate?`);
        }
    });
}

function parseEnums(schemeBuilder: TreeScheme.ISchemeBuilder, obj: any): void {
    if (!Utils.Parser.isArray(obj.enums)) {
        return;
    }

    (obj.enums as any[]).forEach(enumObj => {

        // Parse identifier
        const identifier = Utils.Parser.validateString(enumObj.identifier);
        if (identifier === undefined) {
            throw new Error(`Identifier '${identifier}' of enum is invalid`);
        }

        // Parse values
        const values: TreeScheme.IEnumEntry[] = [];
        if (!Utils.Parser.isArray(enumObj.values)) {
            throw new Error(`Enum '${identifier}' has no values`);
        }
        (enumObj.values as any[]).forEach(valueObj => {
            const value = Utils.Parser.validateNumber(valueObj.value);
            if (value === undefined) {
                throw new Error(`Enum '${identifier}' has a entry that is missing a 'value' field`);
            }
            const name = Utils.Parser.validateString(valueObj.name);
            if (name === undefined) {
                throw new Error(`Enum '${identifier}' has a entry that is missing a 'name' field`);
            }
            values.push({ value, name });
        });

        // Add to scheme
        if (schemeBuilder.pushEnum(identifier, values) === undefined) {
            throw new Error(`Unable to push enum '${identifier}', is it a duplicate?`);
        }
    });
}

function parseNodes(schemeBuilder: TreeScheme.ISchemeBuilder, obj: any): void {
    if (!Utils.Parser.isArray(obj.nodes)) {
        return;
    }

    (obj.nodes as any[]).forEach(nodeObj => {

        // Parse identifier
        const nodeType = Utils.Parser.validateString(nodeObj.nodeType);
        if (nodeType === undefined) {
            throw new Error(`NodeType '${nodeType}' of node is invalid`);
        }

        schemeBuilder.pushNodeDefinition(nodeType, nodeBuilder => {
            // Parse optional comment
            nodeBuilder.comment = Utils.Parser.validateString(nodeObj.comment);

            // Parse fields
            if (!Utils.Parser.isArray(nodeObj.fields)) {
                return;
            }
            (nodeObj.fields as any[]).forEach(fieldObj => {
                const name = Utils.Parser.validateString(fieldObj.name);
                if (name === undefined) {
                    throw new Error(`Node '${nodeType}' has field that is missing a name`);
                }

                const valueType = parseValueType(schemeBuilder, fieldObj.valueType);
                const isArray = Utils.Parser.isBoolean(fieldObj.isArray) ? fieldObj.isArray as boolean : false;

                if (!nodeBuilder.pushField(name, valueType, isArray)) {
                    throw new Error(`Unable to push field '${name}' on node '${nodeType}', is it a duplicate?`);
                }
            });
        });
    });
}

function parseValueType(schemeBuilder: TreeScheme.ISchemeBuilder, obj: any): TreeScheme.FieldValueType {
    const str = Utils.Parser.validateString(obj);
    if (str === undefined) {
        throw new Error("Invalid value type");
    }
    switch (str) {
        case "string":
        case "json":
        case "number":
        case "boolean":
            return str;
        default:
            const aliasOrEnumOrListItem = schemeBuilder.getAliasOrEnumOrListItem(str);
            if (aliasOrEnumOrListItem === undefined) {
                throw new Error(`No alias/enum/listItem found with identifier: '${str}'`);
            }
            return aliasOrEnumOrListItem;
    }
}
