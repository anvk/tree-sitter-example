# tree-sitter-example

My experimentation with (Tree Sitter)[https://tree-sitter.github.io/tree-sitter/] algorithm in Node.JS

This is a JavaScript parser implementation

## What

This parser will make an attempt to find a specified lib `require` statement and then will find lines in a code for every function execution of the assigned object to the require statement.

For Example if you have file `test.js` in the same folder as the script:

```javascript
const path = require('path');

module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'bin'),
        filename: 'app.bundle.js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: './index.html',
            template: path.resolve(configDirs.APP_DIR_TEMPLATES, './index.prod.html'),
            inject: true,
            publicPath: configDirs.PUBLIC_PATH,
        }),
        new HtmlWebpackInjector(),
    ],
};
```

Calling

```
./parser -f ./test.js -l path -p resolve
```

Should produce an output:

```
[]AllOccurrences of path calling resolve: <line 5, path: path.resolve(__dirname, 'bin'),,<line 11, template: path.resolve(configDirs.APP_DIR_TEMPLATES, './index.prod.html'),
```

## Usage:

```bash
Usage: parser -f [str] -l [str] -p [str] -v

Options:
      --help      Show help                                            [boolean]
      --version   Show version number                                  [boolean]
  -f, --file      Path to a file                                      [required]
  -l, --libName   Lib name                                            [required]
  -p, --propName  Prop name                                           [required]

Examples:
  parser -f ../examples/example1.js -l fs/promises -p readFile
  will return code lines within example.js for object readFile() files for
  fs/promises lib
```

## Quick start

```bash
$ ./bin/parser -f ../examples/example1.js -l fs/promises -p readFile
```

## For developers

### Tests

```
npm run test
```

### Execution

Install Node dependencies

```bash
$ npm install
```

```bash
$ ts-node ./src/index.ts -f ../examples/example1.js -l fs/promises -p readFile -v
```

### Build

```bash
rm -rf dist/ && npm run build
```

### Using lib

```typescript
import SillyParser from './sillyParser';

const sourceCode = `
const path = require('path');

module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'bin'),
        filename: 'app.bundle.js',
    },
};
`;

const parser = new SillyParser({ sourceCode });
const result = parser.findRequireObjectPropertiesLOC('path', 'resolve');

console.log(`[]AllOccurrences of path calling resolve ${result}`);
```

### Limitation

This is a very basic implementation and does not take into consideration if variables are got reassigned or other complicated examples:

Example:

```javascript
'use strict';

const fs = require('fs/promises');
const fs1 = fs;
const app = express();

const router = express.Router();
router.get('/', async (req, res) => {
    const f = await fs1.readFile('/tmp/somefile.txt');
    res.send(f.toString('utf-8'));
});
```

Calling `./bin/parser -f ../examples/example1.js -l fs/promises -p readFile` would yield no results because of the `const fs1 = fs;` line
