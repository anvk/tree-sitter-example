import fs from 'fs';
import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import { notEmpty, stripQuotesInString } from './utils';

const DEFAULT_FILE_FORMAT = 'utf-8';
const NEW_LINE = '\n';

export interface RequireNode {
    varName: string;
    libName: string;
    node: Parser.SyntaxNode;
}

export interface ObjectPropertyNode {
    objectName: string;
    propName: string;
    node: Parser.SyntaxNode;
}

export enum TreeSitterNodeTypes {
    identifier = 'identifier',
    memberExpression = 'member_expression',
    propertyIdentifier = 'property_identifier',
    string = 'string',
}

export type SillyParserConstructorArgs = {
    verbose?: boolean;
    filePath?: string;
    sourceCode?: string;
};

export default class SillyParser {
    private verbose: boolean;
    private identifiers: Parser.SyntaxNode[];
    private startNode: Parser.SyntaxNode;
    private sourceLines: string[];

    constructor(args: SillyParserConstructorArgs) {
        this.verbose = args.verbose;

        if (args.filePath) {
            this.setRootNodeFromFile(args.filePath);
        } else if (args.sourceCode) {
            this.setRootNodeFromCode(args.sourceCode);
        }

        this.myLog('tree: ', this.startNode.toString());
    }

    // Debug logging function. Mimics console.log
    myLog(
        ...args: (
            | string
            | Parser.SyntaxNode
            | Parser.SyntaxNode[]
            | RequireNode[]
            | { objectName: string; propName: string; node: Parser.SyntaxNode }[]
        )[]
    ) {
        if (!this.verbose) return;

        console.log(...args);
    }

    setRootNodeFromCode(sourceCode: string) {
        const parser = new Parser();
        parser.setLanguage(JavaScript);

        const tree = parser.parse(sourceCode);

        this.startNode = tree.rootNode;
        this.sourceLines = sourceCode.split(NEW_LINE);
    }

    setRootNodeFromFile(filePath: string) {
        let sourceCode = fs.readFileSync(filePath, DEFAULT_FILE_FORMAT);
        this.setRootNodeFromCode(sourceCode);
    }

    // Return all identifiers within the code
    getAllIdentifiers() {
        if (this.identifiers) return this.identifiers;
        this.identifiers = this.startNode.descendantsOfType(TreeSitterNodeTypes.identifier);

        return this.identifiers;
    }

    // Find specific identifiers that have a specific name
    findIdentifierWithText(searchString: string) {
        const identifiers = this.getAllIdentifiers();
        return identifiers.filter(node => node.text === searchString);
    }

    // Function that will find all require statements in the code such as <varName> = require(<libName>);
    //
    // Return:
    //  Array of objects that contain varName, libName and node that refers to the Parser.SyntaxNode within the syntax tree
    findAllRequireVariables(): RequireNode[] {
        const searchString = 'require';

        let requireNodes = this.findIdentifierWithText(searchString);

        return requireNodes
            .flatMap(node => {
                if (!node.parent || !node.parent.parent) {
                    return;
                }

                this.myLog(
                    'findAllRequireVariables: ',
                    'node.parent.parent.children: ',
                    node.parent.parent.children
                );

                const names = node.parent.parent
                    .descendantsOfType(TreeSitterNodeTypes.identifier)
                    .flatMap(node => node.text)
                    .filter(name => name !== searchString);
                if (names.length !== 1) {
                    return;
                }

                const [varName] = names;

                const args = node.parent
                    .descendantsOfType(TreeSitterNodeTypes.string)
                    .flatMap(node => node.text);

                if (args.length !== 1) {
                    return;
                }

                const [arg] = args;

                return {
                    varName,
                    libName: stripQuotesInString(arg),
                    node,
                };
            })
            .filter(notEmpty);
    }

    // Function that returns RequireNode for a specific libName
    findSpecificRequireVariables(libName: string): RequireNode[] {
        const result = this.findAllRequireVariables();

        return result.filter(element => element.libName === libName);
    }

    // Function will find all instances of <object>.<prop> in the code
    // Arguments:
    //  objectName - name of the object that will be found in the code with its properties
    //
    // Return:
    //  Array of objects that contain objectName, propName that could be a variable or a function called on the object,
    // and node that refers to the Parser.SyntaxNode within the syntax tree
    findAllObjectPropertyNodes(objectName: string): ObjectPropertyNode[] {
        let identifierNodes = this.findIdentifierWithText(objectName);

        return identifierNodes
            .map(node => {
                if (!node.parent || node.parent.type !== TreeSitterNodeTypes.memberExpression) {
                    return;
                }

                this.myLog('findAllObjectPropertyNodes: ', 'node.parent: ', node.parent);

                const propertyIdentifiers = node.parent.descendantsOfType(
                    TreeSitterNodeTypes.propertyIdentifier
                );
                if (propertyIdentifiers.length !== 1) {
                    return;
                }

                const [propertyIdentifier] = propertyIdentifiers;

                return {
                    objectName,
                    propName: propertyIdentifier.text,
                    node,
                };
            })
            .filter(notEmpty);
    }

    // Returns Line of Code and actual code for every <object>.<propertyName> in code
    findObjectPropertiesLOC(objectName: string, propertyName: string): string[] {
        const result = this.findAllObjectPropertyNodes(objectName);

        return result
            .filter(element => element.propName === propertyName)
            .map(element => {
                const rowNum = element.node.startPosition.row;
                const sourceFirstLine = this.sourceLines[rowNum].trim();

                return `<line ${rowNum}, ${sourceFirstLine}`;
            });
    }

    // Returns Line of Code and actual code for every <object>.<propertyName> in code
    // where object is derived from the require statement of type <object> = require(<libName>)
    findRequireObjectPropertiesLOC(libName: string, propertyName: string): string[] {
        if (!libName) {
            console.error('libName is missing');
            return [];
        }

        if (!propertyName) {
            console.error('propertyName is missing');
            return [];
        }

        const specificRequires = this.findSpecificRequireVariables(libName);
        if (!specificRequires.length) {
            return [];
        }

        const [specificRequire] = specificRequires;

        this.myLog('----> ', specificRequires);

        const nodes = this.findAllObjectPropertyNodes(specificRequire.varName);
        this.myLog('===>', nodes);

        return this.findObjectPropertiesLOC(specificRequire.varName, propertyName);
    }
}
