# tree-sitter-example

![Tree house image](https://tree-sitter.github.io/tree-sitter/assets/images/tree-sitter-small.png 'Tree house image')

Small and silly parser based on the [Tree Sitter](https://tree-sitter.github.io/tree-sitter/)

JavaScript parser implementation

## What does it do

This parser will make an attempt to find a specified lib `require` statement and then will find lines in a code for every variable reference (or a particular one if specified) for the object assigned to the require statement.

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
            publicPath: path.join(configDirs.PUBLIC_PATH, 'public'),
        }),
        new HtmlWebpackInjector(),
    ],
};
```

The following command will find `path` lib `resolve` calls

```
./bin/silly-parser -f ./test.js -l path -p resolve
```

Should produce an output:

```
[]AllOccurrences of path referencing resolve:
  <line 5, path: path.resolve(__dirname, 'bin'),
  <line 11, template: path.resolve(configDirs.APP_DIR_TEMPLATES, './index.prod.html'),
```

The following command will find all `path` lib calls

```
./bin/silly-parser -f ./test.js -l path
```

Should produce an output:

```
[]AllOccurrences of path referencing resolve:
  <line 5, path: path.resolve(__dirname, 'bin'),
  <line 11, template: path.resolve(configDirs.APP_DIR_TEMPLATES, './index.prod.html'),
  <line 13, publicPath: path.join(configDirs.PUBLIC_PATH, 'public'),
```

## Usage:

```bash
Usage: silly-parser -f [str] -l [str] -p [str] -v

Options:
      --help      Show help                                            [boolean]
      --version   Show version number                                  [boolean]
  -f, --file      Path to a file                                      [required]
  -l, --libName   Lib name                                            [required]
  -p, --propName  Prop name

Examples:
  silly-parser -f ../examples/example1.js -l fs/promises -p readFile
  will return code lines within example.js for object readFile() files for
  fs/promises lib
```

## Quick start

Install node modules `npm install`.

```bash
$ ./bin/silly-parser -f ./examples/example1.js -l fs/promises -p readFile
```

## For developers

### Tests

```bash
npm run test
```

### How to run the code without CLI

Install Node dependencies

```bash
$ npm install
```

```bash
$ ts-node ./index.js -f ./examples/example1.js -l fs/promises -p readFile -v
```

### Build command

```bash
npm run build
```

### Using lib in code instead of CLI

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

### Limitations

This is a basic implementation and does not take into consideration if variables are reassigned

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

Calling `./bin/silly-parser -f ../examples/example1.js -l fs/promises -p readFile` would yield no results because of the `const fs1 = fs;` line

Also more tests are required

Also it is not published to NPM. This CLI command cannot be installed using `npm install -g`

## License

MIT license; see [LICENSE](./LICENSE).
