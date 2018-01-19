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
const template = require('babel-template');

const checkedTemplate = template(`() => VAR = !VAR`);
const valueTemplate = template(`ev => VAR = ev.target.value`);
const customTemplate = template(`val => VAR = val`);

const getCustomEventName = name => 'on' + name.charAt(0).toUpperCase() + name.slice(1) + 'Change';

module.exports = class BindAttributeTransform {
    static apply(path) {
        const jsxName = PathUtils.getJSXElementName(path);

        // Check for certain special attributes on an input element (value, checked, indeterminate)
        if (jsxName === 'input' || jsxName === 'textarea') {
            let inputType = PathUtils.getAttributeValue(path, 'type');
            inputType = inputType && inputType.value;

            if (inputType === 'radio' || inputType === 'checkbox') {
                this.transformBindAttr(path, 'checked', 'onChange', checkedTemplate);
            }
            else if (inputType !== 'submit' && inputType !== 'reset' && inputType !== 'button') {
                // All the other input fields have a value attribute
                this.transformBindAttr(path, 'value', 'onChange', valueTemplate);
            }

            // TODO: We don't handle indeterminate right now
        }
        else if (jsxName === 'select') {
            this.transformBindAttr(path, 'value', 'onChange', valueTemplate);
        }

        // Handle any custom attributes
        path.node.openingElement.attributes
            .filter(attr => t.isJSXAttribute(attr) && attr.name.namespace && attr.name.namespace.name === 'bind')
            .map(attr => this.transformBindAttr(path, attr.name.name.name, getCustomEventName(attr.name.name.name), customTemplate));
    }

    static transformBindAttr(path, attrName, eventName, eventTemplate) {
        let bindAttrName = 'bind:' + attrName;
        let bindAttr = PathUtils.getAttribute(path, bindAttrName);
        if (!bindAttr) {
            return;
        }

        let eventFunction = eventTemplate({ VAR: bindAttr.value.expression }).expression;

        // Whatever happens, we want to remove the bind attribute
        PathUtils.deleteAttribute(path, bindAttrName);

        // Make sure there are no conflicting attributes
        if (PathUtils.getAttribute(path, attrName)) {
            PathUtils.warning(path, `Cannot use both ${bindAttrName} and ${attrName} attributes on the same element -
                choose either one-way or two-way data binding!`);
            return;
        }
        // If they already had an onChange handler, make our event handler call theirs as well.
        if (PathUtils.getAttribute(path, eventName)) {
            const existingHandler = PathUtils.getAttributeValue(path, eventName).expression;
            if (t.isArrowFunctionExpression(existingHandler) && t.isAssignmentExpression(existingHandler.body)) {
                PathUtils.warning(path, `It looks like you're using both ${bindAttrName} and ${eventName} to assign a value. `
                    + `The 'bind:' attribute automatically adds an ${eventName} handler to save the value; doing both is redundant.`);
            }
            PathUtils.deleteAttribute(path, eventName);
            eventFunction.body = t.sequenceExpression([ eventFunction.body, t.callExpression(existingHandler, eventFunction.params) ]);
        }

        // Check that it's an l-value (identifier or member expression)
        if (!t.isJSXExpressionContainer(bindAttr.value)
            && !t.isIdentifier(bindAttr.value.expression)
            && !t.isMemberExpression(bindAttr.value.expression)) {
            PathUtils.warning(path, `${bindAttrName} must be assignable for two-way data binding!`);
            return;
        }

        let attributes = path.node.openingElement.attributes;

        // Add the normal data binding (data in)
        attributes.push(t.jSXAttribute(t.jSXIdentifier(attrName), t.jSXExpressionContainer(bindAttr.value.expression)));

        // Add the event handler (data out)
        attributes.push(t.jSXAttribute(t.jSXIdentifier(eventName), t.jSXExpressionContainer(eventFunction)));
    }
};
