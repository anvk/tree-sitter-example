"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeSitterNodeTypes = void 0;
const fs_1 = __importDefault(require("fs"));
const tree_sitter_1 = __importDefault(require("tree-sitter"));
const tree_sitter_javascript_1 = __importDefault(require("tree-sitter-javascript"));
const utils_1 = require("./utils");
const DEFAULT_FILE_FORMAT = 'utf-8';
const NEW_LINE = '\n';
var TreeSitterNodeTypes;
(function (TreeSitterNodeTypes) {
    TreeSitterNodeTypes["identifier"] = "identifier";
    TreeSitterNodeTypes["memberExpression"] = "member_expression";
    TreeSitterNodeTypes["propertyIdentifier"] = "property_identifier";
    TreeSitterNodeTypes["string"] = "string";
})(TreeSitterNodeTypes = exports.TreeSitterNodeTypes || (exports.TreeSitterNodeTypes = {}));
class SillyParser {
    constructor(args) {
        this.verbose = args.verbose;
        if (args.filePath) {
            this.setRootNodeFromFile(args.filePath);
        }
        else if (args.sourceCode) {
            this.setRootNodeFromCode(args.sourceCode);
        }
        this.myLog('tree: ', this.startNode.toString());
    }
    // Debug logging function. Mimics console.log
    myLog(...args) {
        if (!this.verbose)
            return;
        console.log(...args);
    }
    setRootNodeFromCode(sourceCode) {
        const parser = new tree_sitter_1.default();
        parser.setLanguage(tree_sitter_javascript_1.default);
        const tree = parser.parse(sourceCode);
        this.startNode = tree.rootNode;
        this.sourceLines = sourceCode.split(NEW_LINE);
    }
    setRootNodeFromFile(filePath) {
        let sourceCode = fs_1.default.readFileSync(filePath, DEFAULT_FILE_FORMAT);
        this.setRootNodeFromCode(sourceCode);
    }
    // Return all identifiers within the code
    getAllIdentifiers() {
        if (this.identifiers)
            return this.identifiers;
        this.identifiers = this.startNode.descendantsOfType(TreeSitterNodeTypes.identifier);
        return this.identifiers;
    }
    // Find specific identifiers that have a specific name
    findIdentifierWithText(searchString) {
        const identifiers = this.getAllIdentifiers();
        return identifiers.filter(node => node.text === searchString);
    }
    // Function that will find all require statements in the code such as <varName> = require(<libName>);
    //
    // Return:
    //  Array of objects that contain varName, libName and node that refers to the Parser.SyntaxNode within the syntax tree
    findAllRequireVariables() {
        const searchString = 'require';
        let requireNodes = this.findIdentifierWithText(searchString);
        return requireNodes
            .flatMap(node => {
            if (!node.parent || !node.parent.parent) {
                return;
            }
            this.myLog('findAllRequireVariables: ', 'node.parent.parent.children: ', node.parent.parent.children);
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
                libName: (0, utils_1.stripQuotesInString)(arg),
                node,
            };
        })
            .filter(utils_1.notEmpty);
    }
    // Function that returns RequireNode for a specific libName
    findSpecificRequireVariables(libName) {
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
    findAllObjectPropertyNodes(objectName) {
        let identifierNodes = this.findIdentifierWithText(objectName);
        return identifierNodes
            .map(node => {
            if (!node.parent || node.parent.type !== TreeSitterNodeTypes.memberExpression) {
                return;
            }
            this.myLog('findAllObjectPropertyNodes: ', 'node.parent: ', node.parent);
            const propertyIdentifiers = node.parent.descendantsOfType(TreeSitterNodeTypes.propertyIdentifier);
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
            .filter(utils_1.notEmpty);
    }
    // Returns Line of Code and actual code for every <object>.<propertyName> in code
    findObjectPropertiesLOC(objectName, propertyName) {
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
    findRequireObjectPropertiesLOC(libName, propertyName) {
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
exports.default = SillyParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lsbHlQYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc2lsbHlQYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsNENBQW9CO0FBQ3BCLDhEQUFpQztBQUNqQyxvRkFBZ0Q7QUFDaEQsbUNBQXdEO0FBRXhELE1BQU0sbUJBQW1CLEdBQUcsT0FBTyxDQUFDO0FBQ3BDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQztBQWN0QixJQUFZLG1CQUtYO0FBTEQsV0FBWSxtQkFBbUI7SUFDM0IsZ0RBQXlCLENBQUE7SUFDekIsNkRBQXNDLENBQUE7SUFDdEMsaUVBQTBDLENBQUE7SUFDMUMsd0NBQWlCLENBQUE7QUFDckIsQ0FBQyxFQUxXLG1CQUFtQixHQUFuQiwyQkFBbUIsS0FBbkIsMkJBQW1CLFFBSzlCO0FBUUQsTUFBcUIsV0FBVztJQU01QixZQUFZLElBQWdDO1FBQ3hDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUU1QixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzNDO2FBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDN0M7UUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELDZDQUE2QztJQUM3QyxLQUFLLENBQ0QsR0FBRyxJQU1BO1FBRUgsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQUUsT0FBTztRQUUxQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVELG1CQUFtQixDQUFDLFVBQWtCO1FBQ2xD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