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
 * Ensure any classes decorated with @Component have (props, context) as constructor arguments.
 */
module.exports = class ConstructorPropsTransform {
    static apply(path) {
        // Abort if this isn't a constructor.
        if (!(t.isClassMethod(path) && path.node.kind === 'constructor')) {
            return;
        }

        // Abort if this class isn't decorated with @Component.
        const classDeclaration = PathUtils.findParentComponent(path);
        if (!classDeclaration) {
            return;
        }

        const className = classDeclaration.node.id.name;
        const params = path.node.params;

        // Components shouldn't have any arguments -- If they do, this is an error.
        if (params.length > 0 && (params.length !== 2 || params[0].name !== 'props' || params[1].name !== 'context')) {
            PathUtils.warning(path, `Class ${className}'s constructor must have two arguments: (props, context). `
                + `You supplied ${params.length} arguments (${params.map(p => p.name).join(', ')}).`);
        }
        // Otherwise, update the method, and the super() expression, to have (props, context) arguments.
        else {
            path.node.params = [ t.identifier('props'), t.identifier('context') ];

            const superExpression = path.node.body.body.find(
                f => t.isExpressionStatement(f) && f.expression.callee && f.expression.callee.type === 'Super');

            if (superExpression) {
                superExpression.expression.arguments = path.node.params;
            }
            else {
                // They didn't have a super expression? That's weird. It won't compile without one,
                // so let's let something else trigger an error instead.
            }
        }
    }
};
