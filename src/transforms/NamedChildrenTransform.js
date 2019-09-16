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
const PathUtils = require('@twist/babel-plugin-transform/src/PathUtils');

module.exports = class NamedChildrenTransform {
    static apply(path) {
        t.assertJSXElement(path.node);
        const nameRoot = path.node.openingElement.name;
        if (!nameRoot.namespace || !t.isJSXElement(path.parent) || path.parent.openingElement.name.name !== nameRoot.namespace.name) {
            // Only hoist namespaced elements, and only if the parent is a JSX element, and only if namespace is the same as parent tag name
            return false;
        }

        let attrName = nameRoot.namespace.name.toLowerCase() + '_' + nameRoot.name.name;
        let parentAttrs = path.parent.openingElement.attributes;

        // Check to see if we need to convert to a function
        let attrValue = PathUtils.jsxChildrenToJS(path.node.children);
        const args = PathUtils.stripAsIdentifiers(path);
        if (args && attrValue) {
            // Convert <Dialog:title as={ x }>...</Dialog:title> to a function: (x) => ...
            attrValue = t.arrowFunctionExpression(args, attrValue);
        }

        let existingAttr = PathUtils.getAttributeValue(path.parentPath, attrName);
        if (existingAttr && t.isJSXExpressionContainer(existingAttr)) {
            if (!t.isArrayExpression(existingAttr.expression)) {
                existingAttr.expression = t.arrayExpression([ existingAttr.expression ]);
            }
            existingAttr.expression.elements.push(attrValue);
        }
        else {
            parentAttrs.push(t.jSXAttribute(t.jSXIdentifier(attrName), t.jSXExpressionContainer(attrValue)));
        }

        path.remove();
        return true;
    }
};
