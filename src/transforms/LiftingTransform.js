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

/**
 * Abstract transform for lifting operations (e.g. arrow functions, object literals etc).
 * Most of the code that checks that it's safe to lift is the same regardless of type of
 * operation.
 */
module.exports = class LiftingTransform {

    constructor(attrValueCheck, hoistTemplate, replaceTemplate) {
        this.attrValueCheck = attrValueCheck;
        this.hoistTemplate = hoistTemplate;
        this.replaceTemplate = replaceTemplate;
    }

    apply(path) {
        const attributes = path.node.openingElement.attributes;
        const parentFunction = path.getFunctionParent();

        // We need to be inside a function - if it's static, hoisting doesn't make any sense
        if (!PathUtils.hasThisContext(parentFunction)) {
            return;
        }

        let modified = false;
        for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i];
            if (t.isJSXExpressionContainer(attr.value) && this.attrValueCheck(attr.value.expression)) {

                // Need to check that it doesn't reference any variables within the function it's in,
                // because we want to hoist the function out of the attribute, and it needs to be safe to do so!
                // We traverse the body to inspect its identifiers.
                let body = path.get('openingElement.attributes.' + i + '.value.expression');
                let canHoist = true;
                body.traverse({
                    ReferencedIdentifier(identifier) {
                        let name = identifier.node.name;

                        // If the variable is bound inside the arrow function (including as a param), or if it's
                        // bound outside of the parent block containing the JSX, it's safe to hoist.
                        // So we just check for identifiers that are in the middle of these scopes (e.g. if you
                        // depend on a variable inside the render function, this isn't safe because it will vary
                        // each time the render happens).
                        if (path.scope.hasBinding(name) && !parentFunction.scope.parent.hasBinding(name)) {
                            canHoist = false;
                        }
                    }
                });

                // We don't transform if there are any identifiers that would make it unsafe to do so.
                if (!canHoist) {
                    continue;
                }

                // We create a new symbol for storing the function on the instance, so we don't recreate it.
                let symbolName = PathUtils.addGlobalSymbol(path, 'handler');

                PathUtils.pushToFunctionBody(parentFunction, this.hoistTemplate({ NAME: symbolName, EXPR: attr.value.expression }));
                attr.value.expression = this.replaceTemplate({ NAME: symbolName }).expression;
                modified = true;
            }
        }

        // Since we hoisted some stuff to the parent block, we need to queue this to be visited again
        if (modified) {
            parentFunction.requeue();
        }
    }
};
