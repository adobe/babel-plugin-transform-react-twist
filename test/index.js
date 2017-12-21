/*
 *  Copyright 2017 Adobe Systems Incorporated. All rights reserved.
 *  This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License. You may obtain a copy
 *  of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under
 *  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *  OF ANY KIND, either express or implied. See the License for the specific language
 *  governing permissions and limitations under the License.
 *
 */

/* global describe it */
/* eslint no-console: "off" */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const Transformer = require('../src/Transformer');

describe('babel-plugin-torq-react', () => {
    const fixtures = fs.readdirSync(path.join(__dirname, 'fixtures'));

    const transformer = new Transformer({
        autoImport: {
            'ui:button': {
                module: 'my-ui-library',
                export: 'Button'
            },
            'Component' : {
                module: '@twist/react',
                export: 'Component',
                inherits: {
                    module: '@twist/react',
                    export: 'BaseComponent'
                }
            }
        }
    });

    fixtures.forEach((fixture) => {
        const dir = path.join(__dirname, 'fixtures', fixture);
        try {
            if (!fs.statSync(dir).isDirectory()) {
                return;
            }
        }
        catch (e) {
            return;
        }

        it(fixture, () => {
            let expectedFile = path.join(dir, 'expected.jsx');
            let expectedCode = '';
            try {
                expectedCode = fs.readFileSync(expectedFile, 'utf8').trim();
            }
            catch (e) {
                // ignore
            }

            const generatedCode = transformer.transformFile(path.join(dir, 'actual.jsx'), dir).trim();

            if (process.env.UPDATE_KNOWN_GOODS) {
                if (expectedCode !== generatedCode) {
                    console.log('Updating: ' + fixture);
                    fs.writeFileSync(expectedFile, generatedCode, 'utf8');
                }
            }
            else {
                assert.equal(generatedCode, expectedCode);
            }
        });
    });
});
