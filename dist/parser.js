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
class MyParser {
    constructor(args) {
        this.verbose = args.verbose;
        if (args.filePath) {
            this.setRootNodeFromFile(args.filePath);
        }
        else if (args.sourceCode) {
            this.setRootNodeFromFile(args.sourceCode);
        }
        this.myLog('tree: ', this.startNode.toString());
    }
    // Debug logging function. Mimics console.log
    myLog(...args) {
        if (!this.verbose)
            return;
        console.log(...args);
    }
    treeToString() {
        return this.startNode.toString();
    }
    getCode() {
        return this.sourceLines.join(NEW_LINE);
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
    getIdentifiers() {
        if (this.identifiers)
            return this.identifiers;
        this.identifiers = this.startNode.descendantsOfType(TreeSitterNodeTypes.identifier);
        return this.identifiers;
    }
    findIdentifierWithText(searchString) {
        const identifiers = this.getIdentifiers();
        return identifiers.filter(node => node.text === searchString);
    }
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
                lib: (0, utils_1.stripQuotesInString)(arg),
                node,
            };
        })
            .filter(utils_1.notEmpty);
    }
    findSpecificRequireVariables(libName) {
        const result = this.findAllRequireVariables();
        return result.filter(element => element.lib === libName);
    }
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
    findExecutionObjectProperties(objectName, propertyName, sourceLines) {
        const result = this.findAllObjectPropertyNodes(objectName);
        return result
            .filter(element => element.propName === propertyName)
            .map(element => {
            const rowNum = element.node.startPosition.row;
            const sourceFirstLine = sourceLines[rowNum].trim();
            return `<line ${rowNum}, ${sourceFirstLine}`;
        });
    }
    findFunctionExecution(libName, propertyName) {
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
        return this.findExecutionObjectProperties(specificRequire.varName, propertyName, this.sourceLines);
    }
}
exports.default = MyParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSw0Q0FBb0I7QUFDcEIsOERBQWlDO0FBQ2pDLG9GQUFnRDtBQUNoRCxtQ0FBd0Q7QUFFeEQsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUM7QUFDcEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBY3RCLElBQVksbUJBS1g7QUFMRCxXQUFZLG1CQUFtQjtJQUMzQixnREFBeUIsQ0FBQTtJQUN6Qiw2REFBc0MsQ0FBQTtJQUN0QyxpRUFBMEMsQ0FBQTtJQUMxQyx3Q0FBaUIsQ0FBQTtBQUNyQixDQUFDLEVBTFcsbUJBQW1CLEdBQW5CLDJCQUFtQixLQUFuQiwyQkFBbUIsUUFLOUI7QUFRRCxNQUFxQixRQUFRO0lBTXpCLFlBQVksSUFBNkI7UUFDckMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRTVCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNmLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDM0M7YUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDeEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUM3QztRQUVELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsNkNBQTZDO0lBQzdDLEtBQUssQ0FDRCxHQUFHLElBTUE7UUFFSCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPO1FBRTFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQsWUFBWTtRQUNSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FB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