#!/usr/bin/env node
import path from 'path';

var argv = require('yargs/yargs')(process.argv.slice(2))
    .usage('Usage: $0 -f [str] -l [str] -p [str] -v')
    .alias('f', 'file')
    .describe('f', 'Path to a file')
    .alias('l', 'libName')
    .describe('l', 'Lib name')
    .alias('p', 'propName')
    .describe('p', 'Prop name')
    .demandOption(['f', 'l', 'p'])
    .example(
        `$0 -f ../examples/example1.js -l fs/promises -p readFile
        will return code lines within example.js for object readFile() files for fs/promises lib`
    )
    .boolean(['v']).argv;

import SillyParser from './sillyParser';

const filePath = path.join(__dirname, argv.f);

const parser = new SillyParser({ verbose: argv.v, filePath });
const result = parser.findRequireObjectPropertiesLOC(argv.l, argv.p);
console.log(`[]AllOccurrences of ${argv.l} calling ${argv.p}: ${result}`);
