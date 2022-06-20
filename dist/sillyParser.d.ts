import Parser from 'tree-sitter';
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
export declare enum TreeSitterNodeTypes {
    identifier = "identifier",
    memberExpression = "member_expression",
    propertyIdentifier = "property_identifier",
    string = "string"
}
export declare type SillyParserConstructorArgs = {
    verbose?: boolean;
    filePath?: string;
    sourceCode?: string;
};
export default class SillyParser {
    private verbose;
    private identifiers;
    private startNode;
    private sourceLines;
    constructor(args: SillyParserConstructorArgs);
    myLog(...args: (string | Parser.SyntaxNode | Parser.SyntaxNode[] | RequireNode[] | {
        objectName: string;
        propName: string;
        node: Parser.SyntaxNode;
    }[])[]): void;
    setRootNodeFromCode(sourceCode: string): void;
    setRootNodeFromFile(filePath: string): void;
    getAllIdentifiers(): Parser.SyntaxNode[];
    findIdentifierWithText(searchString: string): Parser.SyntaxNode[];
    findAllRequireVariables(): RequireNode[];
    findSpecificRequireVariables(libName: string): RequireNode[];
    findAllObjectPropertyNodes(objectName: string): ObjectPropertyNode[];
    findObjectPropertiesLOC(objectName: string, propertyName: string): string[];
    findRequireObjectPropertiesLOC(libName: string, propertyName: string): string[];
}
