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

function testClass(message, jsx, json) {
    it(message, () => {
        assert.deepEqual(TestRenderer.create(jsx).toJSON().props, json);
    });
}

describe('class', () => {

    testClass(
        'plain class attribute',
        <div class="foo bar" />,
        { className: 'foo bar' });

    testClass(
        'multiple class attributes',
        <div class="foo" class="bar" />,
        { className: 'foo bar' });

    testClass(
        'string class attribute with shorthands',
        <div class="foo bar" class-baz-baz={true} class-bat-bat={false} />,
        { className: 'foo bar baz-baz' });

    testClass(
        'array class attribute with shorthands',
        <div class={[ 'foo', 'bar' ]} class-baz={true} class-bat={false} />,
        { className: 'foo bar baz' });

    testClass(
        'object class attribute with shorthands',
        <div class={{ foo: true, bar: true, tow: false }} class-baz={true} class-bat={false} />,
        { className: 'foo bar baz' });

    testClass(
        'className attribute works too',
        <div className={{ foo: true, bar: true, tow: false }} class-baz={true} class-bat={false} />,
        { className: 'foo bar baz' });
});
