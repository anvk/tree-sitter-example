import 'mocha';
import { expect } from 'chai';
import SillyParser from '../src/sillyParser';

const code1 = `const fs = require('fs/promises');
const app = express();

const router = express.Router();
router.get('/', async (req, res) => {
    const f = await fs.readFile('/tmp/somefile.txt');
    res.send(f.toString('utf-8'));
});
app.use(router);

app.listen(3000, async () => {
    console.log('App listening locally at :3000');
});
`;

const code2 = `const path = require('path');

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
};`;

const trickyCode = `const fs = require('fs/promises');
const fs1 = fs;
const app = express();

const router = express.Router();
router.get('/', async (req, res) => {
    const f = await fs1.readFile('/tmp/somefile.txt');
    res.send(f.toString('utf-8'));
});
app.use(router);

app.listen(3000, async () => {
    console.log('App listening locally at :3000');
});
`;

describe('SillyParser tests', () => {
    it('findAllObjectPropertyNodes tests', () => {
        const testCases = [
            {
                code: code1,
                objectName: 'fs',
                output: [
                    {
                        objectName: 'fs',
                        propName: 'readFile',
                    },
                ],
            },
            {
                code: code1,
                objectName: 'app',
                output: [
                    {
                        objectName: 'app',
                        propName: 'use',
                    },
                    {
                        objectName: 'app',
                        propName: 'listen',
                    },
                ],
            },
            {
                code: code2,
                objectName: 'meow',
                output: [],
            },
        ];

        for (const testCase of testCases) {
            const parser = new SillyParser({ sourceCode: testCase.code });
            const result = parser
                .findAllObjectPropertyNodes(testCase.objectName)
                .map(e => ({ objectName: e.objectName, propName: e.propName }));

            expect(result).to.deep.equal(testCase.output);
        }
    });

    it('findAllRequireVariables tests', () => {
        const testCases = [
            {
                code: code1,
                output: [
                    {
                        varName: 'fs',
                        libName: 'fs/promises',
                    },
                ],
            },
            {
                code: code2,
                output: [
                    {
                        varName: 'path',
                        libName: 'path',
                    },
                ],
            },
        ];

        for (const testCase of testCases) {
            const parser = new SillyParser({ sourceCode: testCase.code });
            const result = parser
                .findAllRequireVariables()
                .map(e => ({ varName: e.varName, libName: e.libName }));

            expect(result).to.deep.equal(testCase.output);
        }
    });

    it('findSpecificRequireVariables tests', () => {
        const testCases = [
            {
                code: code1,
                libName: 'fs/promises',
                output: [
                    {
                        varName: 'fs',
                        libName: 'fs/promises',
                    },
                ],
            },
            {
                code: code1,
                libName: 'meow',
                output: [],
            },
            {
                code: code2,
                libName: 'path',
                output: [
                    {
                        varName: 'path',
                        libName: 'path',
                    },
                ],
            },
        ];

        for (const testCase of testCases) {
            const parser = new SillyParser({ sourceCode: testCase.code });
            const result = parser
                .findSpecificRequireVariables(testCase.libName)
                .map(e => ({ varName: e.varName, libName: e.libName }));

            expect(result).to.deep.equal(testCase.output);
        }
    });

    it('findObjectPropertiesLOC tests', () => {
        const testCases = [
            {
                code: code1,
                objectName: 'meow',
                propertyName: 'blah',
                output: [],
            },
            {
                code: code1,
                objectName: 'fs',
                propertyName: 'readFile',
                output: ["<line 5, const f = await fs.readFile('/tmp/somefile.txt');"],
            },
            {
                code: code1,
                objectName: 'f',
                propertyName: 'toString',
                output: ["<line 6, res.send(f.toString('utf-8'));"],
            },
            {
                code: code2,
                objectName: 'path',
                propertyName: 'resolve',
                output: [
                    "<line 5, path: path.resolve(__dirname, 'bin'),",
                    "<line 11, template: path.resolve(configDirs.APP_DIR_TEMPLATES, './index.prod.html'),",
                ],
            },
            {
                code: code2,
                objectName: 'path',
                propertyName: undefined,
                output: [
                    "<line 5, path: path.resolve(__dirname, 'bin'),",
                    "<line 11, template: path.resolve(configDirs.APP_DIR_TEMPLATES, './index.prod.html'),",
                    "<line 13, publicPath: path.join(configDirs.PUBLIC_PATH, 'public'),",
                ],
            },
            {
                code: code2,
                objectName: 'configDirs',
                propertyName: undefined,
                output: [
                    "<line 11, template: path.resolve(configDirs.APP_DIR_TEMPLATES, './index.prod.html'),",
                    "<line 13, publicPath: path.join(configDirs.PUBLIC_PATH, 'public'),",
                ],
            },
        ];

        for (const testCase of testCases) {
            const parser = new SillyParser({ sourceCode: testCase.code });
            const result = parser.findObjectPropertiesLOC(
                testCase.objectName,
                testCase.propertyName
            );

            expect(result).to.deep.equal(testCase.output);
        }
    });

    it('findRequireObjectPropertiesLOC tests', () => {
        const testCases = [
            {
                code: code1,
                libName: 'meow',
                propertyName: 'blah',
                output: [],
            },
            {
                code: code1,
                libName: 'fs/promises',
                propertyName: 'readFile',
                output: ["<line 5, const f = await fs.readFile('/tmp/somefile.txt');"],
            },
            {
                code: trickyCode,
                libName: 'fs/promises',
                propertyName: 'readFile',
                output: [],
            },
            {
                code: code2,
                libName: 'path',
                propertyName: 'resolve',
                output: [
                    "<line 5, path: path.resolve(__dirname, 'bin'),",
                    "<line 11, template: path.resolve(configDirs.APP_DIR_TEMPLATES, './index.prod.html'),",
                ],
            },
            {
                code: code2,
                libName: 'path',
                propertyName: undefined,
                output: [
                    "<line 5, path: path.resolve(__dirname, 'bin'),",
                    "<line 11, template: path.resolve(configDirs.APP_DIR_TEMPLATES, './index.prod.html'),",
                    "<line 13, publicPath: path.join(configDirs.PUBLIC_PATH, 'public'),",
                ],
            },
        ];

        for (const testCase of testCases) {
            const parser = new SillyParser({ sourceCode: testCase.code });
            const result = parser.findRequireObjectPropertiesLOC(
                testCase.libName,
                testCase.propertyName
            );

            expect(result).to.deep.equal(testCase.output);
        }
    });

    it('getAllIdentifiers tests', () => {
        const testCases = [
            {
                code: code1,
                output: [
                    'fs',
                    'require',
                    'app',
                    'express',
                    'router',
                    'express',
                    'router',
                    'req',
                    'res',
                    'f',
                    'fs',
                    'res',
                    'f',
                    'app',
                    'router',
                    'app',
                    'console',
                ],
            },
        ];

        for (const testCase of testCases) {
            const parser = new SillyParser({ sourceCode: testCase.code });
            const result = parser.getAllIdentifiers().map(e => e.text);
            expect(result).to.deep.equal(testCase.output);
        }
    });

    it('findIdentifierWithText tests', () => {
        const testCases = [
            {
                code: code1,
                output: 3,
            },
        ];

        for (const testCase of testCases) {
            const parser = new SillyParser({ sourceCode: testCase.code });
            const result = parser.findIdentifierWithText('app').map(e => e.text);
            expect(result).to.have.lengthOf(testCase.output);
        }
    });
});
