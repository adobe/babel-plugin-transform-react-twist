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

module.exports = class ClassAttributeTransform {
    static apply(path, state) {
        const attributes = path.node.openingElement.attributes;
        const classExpressions = [];
        let numSpreads = 0;

        for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i];
            if (t.isJSXAttribute(attr)) {
                const name = PathUtils.getJSXAttributeName(attr);
                const expr = t.isJSXExpressionContainer(attr.value) ? attr.value.expression : attr.value;
                if (name === 'class' || name === 'className') {
                    classExpressions.push(expr);
                    attributes.splice(i--, 1);
                }
                else if (name.indexOf('class-') === 0) {
                    const singleClassName = name.slice('class-'.length);
                    attributes.splice(i--, 1);
                    classExpressions.push(t.logicalExpression('&&', expr, t.stringLiteral(singleClassName)));
                }
            }
            else if (t.isJSXSpreadAttribute(attr)) {
                // There could be a className in the spread, so need to combine this too!
                classExpressions.push(t.logicalExpression('||', t.memberExpression(attr.argument, t.identifier('className')), t.stringLiteral('')));
                numSpreads++;
            }
        }

        if (classExpressions.length && !(classExpressions.length === 1 && numSpreads === 1)) {
            const runtimeTransformName = PathUtils.addImportOnce(path,
                'default', `${state.opts.moduleName}/src/runtime/classes`, { nameHint: 'C' });
            attributes.push(t.jSXAttribute(t.jSXIdentifier('className'),
                t.jSXExpressionContainer(t.callExpression(runtimeTransformName, [ t.arrayExpression(classExpressions) ]))));
        }
    }

};
