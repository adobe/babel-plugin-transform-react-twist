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

// For now, we just call the function inside the new function. We could be cleverer in the
// case where it's an arrow function, so that we combine the two functions together.
const handlerTemplate = template(`e => (this[NAME]=false, FN(e), this[NAME]=true)`);
const elementsToTransform = [ 'input', 'select', 'textarea' ];

module.exports = class ControlledInputTransform {
    static apply(path) {

        // It's possible that this node gets revisited again (e.g. due to any functions we inject being hoisted),
        // so we need to be careful to avoid getting into an infinite loop. We mark the node as having had its
        // refs transformed already, so that we guarantee that this transform only ever runs once.
        if (path.getData('controlledInputTransformApplied')) {
            return;
        }
        path.setData('controlledInputTransformApplied', true);

        // Abort if this class isn't decorated with a decorator that ends with Component (e.g. @Component or @VirtualComponent)
        let classDeclaration = PathUtils.findParentClassWithDecorator(path, /Component$/);
        if (!classDeclaration) {
            return;
        }

        const jsxName = PathUtils.getJSXElementName(path);
        const onChangeAttribute = PathUtils.getAttributeValue(path, 'onChange');

        // Check for an onChange event listener for controlled form elements.
        // These need to tell React-Twist to immediately update during the onChange event,
        // otherwise React will re-render with the old value before rendering again with the
        // new (which throws off a lot of stuff like the cursor position).
        if (elementsToTransform.includes(jsxName) && onChangeAttribute) {
            let fn = onChangeAttribute.expression;
            onChangeAttribute.expression = handlerTemplate({
                FN: fn,
                NAME: this.addForceUpdateProperty(path)
            }).expression;
        }
    }

    static addForceUpdateProperty(path) {
        // Note: We're using throttleUpdates as the property name for now - we could change that
        // later to a symbol, e.g. using Symbol.for('throttleUpdates').
        const parent = path.scope.getProgramParent().path;
        let localName = parent.scope.getData('throttleUpdatesProperty');
        if (!localName) {
            localName = path.scope.generateUidIdentifier('t');
            parent.scope.push({ id: localName, init: t.stringLiteral('throttleUpdates') });
            parent.scope.setData('throttleUpdatesProperty', localName);
        }
        return localName;
    }
};
