import 'mocha';
import { expect } from 'chai';
import { notEmpty, stripQuotesInString } from '../src/utils';

describe('utils tests', () => {
    it('notEmpty', () => {
        const testCases = [
            {
                input: 'str',
                output: true,
            },
            {
                input: 1,
                output: true,
            },
            {
                input: {},
                output: true,
            },
            {
                input: [],
                output: true,
            },
            {
                input: {},
                output: true,
            },
            {
                input: NaN,
                output: true,
            },
            {
                input: null,
                output: false,
            },
            {
                input: undefined,
                output: false,
            },
        ];

        for (const testCase of testCases) {
            expect(notEmpty(testCase.input)).to.equal(testCase.output);
        }
    });

    it('stripQuotesInString', () => {
        const testCases = [
            {
                input: 'blah',
                output: 'blah',
            },
            {
                input: 'blah"',
                output: 'blah',
            },
            {
                input: '"blah',
                output: 'blah',
            },
            {
                input: '"blah"',
                output: 'blah',
            },
            {
                input: "'blah'",
                output: 'blah',
            },
        ];

        for (const testCase of testCases) {
            expect(stripQuotesInString(testCase.input)).to.equal(testCase.output);
        }
    });
});
