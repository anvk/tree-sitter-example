import Parser from 'tree-sitter';
export interface RequireNode {
    varName: string;
    lib: string;
    node: Parser.SyntaxNode;
}
export interface ObjectPropertyNode {
    objectName: string;
    propName: string;
    node: Parser.SyntaxNode;
}
export declare enum TreeSitterNodeTypes {
    identifier = "identifier",
    memberExpression = "member_expression",
    propertyIdentifier = "property_identifier",
    string = "string"
}
export declare type MyParserConstructorArgs = {
    verbose?: boolean;
    filePath?: string;
    sourceCode?: string;
};
export default class MyParser {
    private verbose;
    private identifiers;
    private startNode;
    private sourceLines;
    constructor(args: MyParserConstructorArgs);
    myLog(...args: (string | Parser.SyntaxNode | Parser.SyntaxNode[] | RequireNode[] | {
        objectName: string;
        propName: string;
        node: Parser.SyntaxNode;
    }[])[]): void;
    treeToString(): string;
    getCode(): string;
    setRootNodeFromCode(sourceCode: string): void;
    setRootNodeFromFile(filePath: string): void;
    getIdentifiers(): Parser.SyntaxNode[];
    findIdentifierWithText(searchString: string): Parser.SyntaxNode[];
    findAllRequireVariables(): RequireNode[];
    findSpecificRequireVariables(libName: string): RequireNode[];
    findAllObjectPropertyNodes(objectName: string): ObjectPropertyNode[];
    findExecutionObjectProperties(objectName: string, propertyName: string, sourceLines: string[]): string[];
    findFunctionExecution(libName: string, propertyName: string): string[];
}
