#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
var argv = require('yargs/yargs')(process.argv.slice(2))
    .usage('Usage: $0 -f [str] -l [str] -p [str] -v')
    .alias('f', 'file')
    .describe('f', 'Path to a file')
    .alias('l', 'libName')
    .describe('l', 'Lib name')
    .alias('p', 'propName')
    .describe('p', 'Prop name')
    .demandOption(['f', 'l', 'p'])
    .example(`$0 -f ../examples/example1.js -l fs/promises -p readFile
        will return code lines within example.js for object readFile() files for fs/promises lib`)
    .boolean(['v']).argv;
const sillyParser_1 = __importDefault(require("./sillyParser"));
const filePath = path_1.default.join(__dirname, argv.f);
const parser = new sillyParser_1.default({ verbose: argv.v, filePath });
const result = parser.findRequireObjectPropertiesLOC(argv.l, argv.p);
console.log(`[]AllOccurrences of ${argv.l} calling ${argv.p}: ${result}`);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsZ0RBQXdCO0FBRXhCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNuRCxLQUFLLENBQUMseUNBQXlDLENBQUM7S0FDaEQsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUM7S0FDbEIsUUFBUSxDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQztLQUMvQixLQUFLLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQztLQUNyQixRQUFRLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQztLQUN6QixLQUFLLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQztLQUN0QixRQUFRLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQztLQUMxQixZQUFZLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQzdCLE9BQU8sQ0FDSjtpR0FDeUYsQ0FDNUY7S0FDQSxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUV6QixnRUFBd0M7QUFFeEMsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRTlDLE1BQU0sTUFBTSxHQUFHLElBQUkscUJBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDOUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLElBQUksQ0FBQyxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUMsS0FBSyxNQUFNLEVBQUUsQ0FBQyxDQUFDIn0=