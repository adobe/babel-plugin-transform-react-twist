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

/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const TestRenderer = require('react-test-renderer');
const assert = require('assert');

/* global describe, it */

function testStyle(message, jsx, json) {
    it(message, () => {
        assert.deepEqual(TestRenderer.create(jsx).toJSON().props.style, json);
    });
}

describe('style', () => {

    testStyle(
        'only style attribute',
        <div style={{ fontSize: 300, fontWeight: 'bold' }} />,
        { fontSize: 300, fontWeight: 'bold' });

    testStyle(
        'only shorthand properties',
        <div style-font-size={300} style-font-weight="bold" />,
        { fontSize: 300, fontWeight: 'bold' });

    testStyle(
        'shorthand properties with string style attribute',
        <div style="color: blue" style-font-size={300} style-font-weight="bold" />,
        { color: 'blue', fontSize: 300, fontWeight: 'bold' });

    testStyle(
        'shorthand properties override string style attribute',
        <div style="font-size: 10px" style-font-size={300} style-font-weight="bold" />,
        { fontSize: 300, fontWeight: 'bold' });

    testStyle(
        'string style attribute with multiple styles',
        <div style="font-size: 10px; font-weight: bold" />,
        { fontSize: '10px', fontWeight: 'bold' });

    testStyle(
        'shorthand properties with object style attribute',
        <div style={{ color: 'blue' }} style-font-size={300} style-font-weight="bold" />,
        { color: 'blue', fontSize: 300, fontWeight: 'bold' });

    testStyle(
        'shorthand properties override string style attribute',
        <div style={{ fontSize: '10px' }} style-font-size={300} style-font-weight="bold" />,
        { fontSize: 300, fontWeight: 'bold' });

    let s1 = { fontSize: '10px' };
    let s2 = { fontWeight: 'bold' };
    testStyle(
        'merging object properties at runtime',
        <div style={s1} style={s2} />,
        { fontSize: '10px', fontWeight: 'bold' });

    let s3 = 'font-size: 10px';
    let s4 = 'font-weight: bold';
    testStyle(
        'merging string properties at runtime',
        <div style={s3} style={s4} />,
        { fontSize: '10px', fontWeight: 'bold' });

    testStyle(
        'merging properties',
        <div style={{ fontSize: '10px' }} style={{ fontWeight: 'bold' }} />,
        { fontSize: '10px', fontWeight: 'bold' });

    testStyle(
        'merging properties and spreads',
        <div style="color: blue" style={{ fontSize: '10px' }} {...{ style: { fontWeight: 'bold' } }} />,
        { color: 'blue', fontSize: '10px', fontWeight: 'bold' });

    testStyle(
        'parsing CSS with embedded colons and semicolons (data URI case)',
        <div style="background: url(data:image/png;base64,abcde123456); color: red" />,
        { background: 'url(data:image/png;base64,abcde123456)', color: 'red' });
});
