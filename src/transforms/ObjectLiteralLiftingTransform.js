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

const t = require('babel-types');
const template = require('babel-template');
const LiftingTransform = require('./LiftingTransform');

const isSimpleObjectLiteral = expr => t.isObjectExpression(expr) && expr.properties.every(t.isObjectProperty);
const hoistTemplate = template(`this[NAME] = this[NAME] || {};`);
const replaceTemplate = template(`Object.assign(this[NAME], EXPR)`);

/**
 * Detect attributes that have object literals, and lift them to the parent block
 * This ensures that we only create a single object and update it on each render(),
 * rather than constantly creating a new object (which looks like the prop is changing each time).
 */
module.exports = new LiftingTransform(isSimpleObjectLiteral, hoistTemplate, replaceTemplate);
