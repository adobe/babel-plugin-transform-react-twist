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

const PathUtils = require('@twist/babel-plugin-transform/src/PathUtils');
const t = require('babel-types');
const camelCaseHyphens = require('@twist/babel-plugin-transform/src/camelCaseHyphens');
const styles = require('../runtime/styles');

/**
 * Enable string style attributes, style shorthand attributes, and multiple style attributes.
 *
 * 1. String Attributes: React only allows objects as style attribute values (e.g. `{ color: 'red' }`).
 *    This allows the style attribute to be specified as a string (like in plain HTML).
 * 2. Style Shorthand: `<div style-background-color="red" />` === `<div style={{ backgroundColor: 'red' }} />`.
 * 3. Multiple Style Attributes: `<div style={A} style={B} />` is roughly equivalent to `<div style={merge(A, B)}>`.
 *
 * Whenever possible, we perform these conversions statically, avoiding any runtime overhead. At compile-time, we:
 *
 *  - parse style strings (including `style="..."`, `style={'...'}`, and `style={`...`}`) into objects;
 *  - combine multiple style attributes and/or shorthands together
 *
 * Styles are combined at runtime only when necessary (using the "styles" runtime helper). This happens when:
 *
 *  - styles are specified as opaque JS expressions, or interpolated template strings;
 *  - spread attributes are included along with styles (spreads might include a "style" property).
 *
 * As in React, style attributes and shorthands are evaluated left-to-right. We take care to ensure this order
 * is preserved, even in the presence of spread attributes.
 */
module.exports = class StyleAttributeTransform {

    static apply(path, state) {
        const runtimeModule = `${state.opts.moduleName}/src/runtime/styles`;
        const attributes = path.node.openingElement.attributes;
        const styleItems = [];

        // There are three types of relevant attributes: "style", "style-*", and spreads. All of these might include
        // styles we must combine together. At the end of this transform, we must have only one "style" attribute, so
        // we remove any "style" and "style-*" attributes here (spread attributes must remain intact).
        for (let i = 0; i < attributes.length; i++) {
            const styleItem = StyleItem.fromAttribute(attributes[i], i);
            if (styleItem) {
                styleItems.push(styleItem);
                if (!styleItem.isSpread) {
                    attributes.splice(i--, 1);
                }
            }
        }

        // If there weren't any styles, or we only had one spread, leave the element as-is (we haven't changed it).
        if (styleItems.length === 0 || (styleItems.length === 1 && styleItems[0].isSpread)) {
            return;
        }

        // Combine styles into as few items as possible (e.g. multiple shorthands can be combined into one object).
        // NOTE: We cannot merge anything out-of-order, so a simple pairwise iteration is optimal.
        for (let i = 1; i < styleItems.length; i++) {
            if (styleItems[i - 1].tryToMerge(styleItems[i])) {
                styleItems.splice(i--, 1);
            }
        }

        // If only one object-literal style item is left, we can just include a style attribute with that object.
        // Otherwise, we need the runtime transform to combine the style items.
        const value = styleItems.length === 1 && t.isObjectExpression(styleItems[0].value)
            ? styleItems[0].value
            : t.callExpression(PathUtils.addImportOnce(path, 'default', runtimeModule, { nameHint: 'S' }), styleItems.map(s => s.value));

        // Insert the new style attribute in the same position as the first original style attribute.
        attributes.splice(styleItems[0].index, 0,
            t.jSXAttribute(t.jSXIdentifier('style'), t.jSXExpressionContainer(value)));
    }
};

/**
 * A container representing one user-specified attribute related to styles. This includes "style", "style-*", and spreads.
 */
class StyleItem {

    /** @private */
    constructor(value, index, isSpread) {
        this.value = value;
        this.index = index;
        this.isSpread = isSpread;
    }

    /**
     * If `attr` is a style-related attribute, return a new StyleItem representing the attribute. Otherwise return null.
     * @param {JSXAttribute|JSXSpreadAttribute} attr
     * @param {number} index
     * @return {StyleItem|null}
     */
    static fromAttribute(attr, index) {
        // Spreads might contain a ".style" property, which we must extract.
        if (t.isJSXSpreadAttribute(attr)) {
            return new StyleItem(t.logicalExpression('||', t.memberExpression(attr.argument, t.identifier('style')), t.objectExpression([])), index, true);
        }
        const name = PathUtils.getJSXAttributeName(attr);
        if (name === 'style') {
            return new StyleItem(StyleItem.convertStringsToStyleObjects(StyleItem.simplifyStringLiteral(attr.value)), index);
        }
        // Expand `style-foo={...}` shorthands into `style={{ foo: ... }}` for simplicity.
        else if (name.startsWith('style-')) {
            const key = t.stringLiteral(camelCaseHyphens(name.slice(6)));
            const value = t.objectExpression([ t.objectProperty(key, StyleItem.simplifyStringLiteral(attr.value)) ]);
            return new StyleItem(value, index);
        }
        else {
            return null;
        }
    }

    /**
     * Attempt to merge another StyleItem's value into this one. We can do this if both are ObjectExpressions whose keys
     * are simple strings or identifiers. Return true if `other` was merged into this.
     * @param {StyleItem} other
     * @return {boolean}
     */
    tryToMerge(other) {
        // We can only combine these if they are both object literals (and not spreads).
        if (this.isSpread || other.isSpread || !t.isObjectExpression(this.value) || !t.isObjectExpression(other.value)) {
            return false;
        }
        // Start combining the objects. If we run into object keys that aren't strings/identifiers, we must abort, since
        // we can't safely merge them.
        let result = new Map();
        for (let prop of this.value.properties) {
            if (!(t.isStringLiteral(prop.key) || t.isIdentifier(prop.key))) {
                return false;
            }
            result.set(prop.key.name || prop.key.value, prop);
        }
        for (let prop of other.value.properties) {
            if (!(t.isStringLiteral(prop.key) || t.isIdentifier(prop.key))) {
                return false;
            }
            result.set(prop.key.name || prop.key.value, prop);
        }
        // If we've made it this far, the objects are safe to merge.
        this.value.properties = Array.from(result.values());
        return true;
    }

    /**
     * If given a string or StringLiteral, parse it as a CSS string and transform it into an ObjectExpression,
     * returning other nodes unchanged.
     * @param {Node} s
     * @return {Node|ObjectExpression}
     */
    static convertStringsToStyleObjects(s) {
        if (t.isStringLiteral(s)) {
            s = s.value;
        }
        if (typeof s !== 'string') {
            return s;
        }
        const properties = [];
        const obj = styles(s);
        for (let key in obj) {
            properties.push(t.objectProperty(t.stringLiteral(key), t.stringLiteral(obj[key].trim())));
        }
        return t.objectExpression(properties);
    }

    /**
     * If possible, simplify an expression containing a statically-determinable string
     * into a plain StringLiteral node. Otherwise return the original node.
     *
     * @param {Node} node
     * @return {Node} A node that is more likely to be a StringLiteral.
     */
    static simplifyStringLiteral(node) {
        if (t.isJSXExpressionContainer(node)) {
            node = node.expression;
        }
        // Template strings can be converted if they don't perform any interpolation.
        if (t.isTemplateLiteral(node) && node.expressions.length === 0) {
            return t.stringLiteral(node.quasis[0].value.cooked);
        }
        return node;
    }
}
