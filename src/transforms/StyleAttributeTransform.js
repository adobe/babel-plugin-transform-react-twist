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

module.exports = class StyleAttributeTransform {
    static apply(path) {
        let attr = PathUtils.getAttribute(path, 'style');

        // If the user provided a string `style` attribute, parse out the individual properties now. Otherwise,
        // treat the `style` attribute (mainValue) as an opaque value.
        let mainValue;
        const subValues = [];
        if (attr) {
            if (t.isStringLiteral(attr.value)) {
                let obj = this.runtimeTransform(attr.value.value, null);
                for (let key in obj) {
                    subValues.push(t.objectProperty(t.stringLiteral(key), t.stringLiteral(obj[key].trim())));
                }
            }
            else if (t.isJSXExpressionContainer(attr.value)) {
                mainValue = attr.value.expression;
            }
        }

        // Extract any shorthand `style-*` properties.
        const attributes = path.node.openingElement.attributes;
        const spreadStyles = [];
        let styleAttrIndex = attr ? attributes.indexOf(attr) : -1;

        for (let i = 0; i < attributes.length; i++) {
            const subAttr = attributes[i];
            if (t.isJSXAttribute(subAttr)) {
                const subAttrName = PathUtils.getJSXAttributeName(subAttr);
                if (subAttrName.indexOf('style-') === 0) {
                    const key = camelCaseHyphens(subAttrName.slice('style-'.length));
                    const value = t.isJSXExpressionContainer(subAttr.value) ? subAttr.value.expression : subAttr.value;
                    subValues.push(t.objectProperty(t.stringLiteral(key), value));
                    attributes.splice(i--, 1);
                }
            }
            else if (t.isJSXSpreadAttribute(subAttr)) {
                // If we have any spreads, we need to extract the style property
                spreadStyles.push(t.logicalExpression('||', t.memberExpression(subAttr.argument, t.identifier('style')), t.objectExpression([])));
                if (styleAttrIndex >= 0 && i > styleAttrIndex) {
                    // We need the spread to come _before_ the style attribute, otherwise if it specifies a style, this will be overwritten!
                    // So, swap them around (this is safe because we've already visited both, in the loop)
                    attributes[styleAttrIndex] = subAttr;
                    attributes[i] = attr;
                    styleAttrIndex = i;
                }
            }
        }

        // These are the styles we need to combine at runtime
        let numSpreadStyles = spreadStyles.length;
        let stylesToCombine = spreadStyles;
        if (subValues.length) {
            stylesToCombine.unshift(t.objectExpression(subValues));
        }
        if (mainValue) {
            stylesToCombine.unshift(mainValue);
        }

        // Do we need to do anything? If there are no styles to combine, or there's only a single spread style, we can bail now
        if (!stylesToCombine.length || (stylesToCombine.length === 1 && numSpreadStyles === 1)) {
            return;
        }

        // If the user didn't provide a style attribute, add if necessary.
        if (!attr) {
            const attributes = path.node.openingElement.attributes;
            attr = t.jSXAttribute(t.jSXIdentifier('style'), null);
            attributes.push(attr);
        }

        // We need a runtime transform to combine the styles, even if there's only one style to combine,
        // because React does not support passing a string to the style attribute, and some users
        // use style={`some: string`}.
        // TODO: We can be cleverer, and use a template string expression as a special case to avoid the runtime transform.
        const runtimeTransformName = PathUtils.addGlobalOnce(path, 'styleTransform', this.runtimeTransform);
        attr.value = t.jSXExpressionContainer(t.callExpression(runtimeTransformName, stylesToCombine));
    }

    static runtimeTransform(mainValue, ...subValues) {
        function camelCase(str) {
            return str.replace(/-+([^-]?)/g, function(match, x) {
                return x.toUpperCase();
            });
        }

        var key;
        var resultObject = {};
        if (typeof mainValue === 'string') {
            mainValue.split(';').forEach(function(item) {
                const kv = item.split(':', 2);
                if (kv.length === 2) {
                    resultObject[camelCase(kv[0].trim())] = kv[1].trim();
                }
            });
        }
        else if (mainValue) {
            for (key in mainValue) {
                resultObject[camelCase(key)] = mainValue[key];
            }
        }
        // XXX: We can't use Object.assign() here because another babel plugin tries to optimize it out.
        for (let i = 0; i < subValues.length; i++) {
            for (key in subValues[i]) {
                resultObject[camelCase(key)] = subValues[i][key];
            }
        }
        return resultObject;
    }
};
