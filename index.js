#!/usr/bin/env node
var argv = require('yargs/yargs')(process.argv.slice(2))
    .usage('Usage: $0 -f [str] -l [str] -p [str] -v')
    .alias('f', 'file')
    .describe('f', 'Path to a file')
    .alias('l', 'libName')
    .describe('l', 'Lib name')
    .alias('p', 'propName')
    .describe('p', 'Prop name')
    .demandOption(['f', 'l'])
    .example(
        `$0 -f ../examples/example1.js -l fs/promises -p readFile
        will return code lines within example.js for object readFile() files for fs/promises lib`
    )
    .boolean(['v']).argv;

const SillyParser = require('./dist/sillyParser').default;

const parser = new SillyParser({ verbose: argv.v, filePath: argv.f });
const result = !!argv.p ? parser.findRequireObjectPropertiesLOC(argv.l, argv.p) : parser.fin;
console.log(`[]AllOccurrences of ${argv.l} ${!!argv.p ? `referencing ${argv.p}:` : ''}`);
result.forEach(line => console.log(`  ${line}`));
