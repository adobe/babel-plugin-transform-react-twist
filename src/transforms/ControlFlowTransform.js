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

module.exports = class ControlFlowTransform {

    static apply(path) {
        switch (PathUtils.getJSXElementName(path)) {
        case 'if':
        case 'unless':
            this.transformIf(path);
            break;
        case 'elseif':
        case 'else':
            // We handle elseif/else cases within the if/unless blocks. Just remove them here.
            path.remove();
            break;
        case 'switch':
            this.transformSwitch(path);
            break;
        case 'repeat':
            this.transformRepeat(path);
            break;
        case 'using':
            this.transformUsing(path);
            break;
        case 'g':
            this.transformGroup(path);
            break;
        default:
            return false;
        }
        return true;
    }

    static transformIf(path) {
        // Find the subsequent `elseif` and/or `if` blocks. If we encounter any other sibling JSXElement, stop searching.
        let elsePath;
        const conditionPaths = [ path ];
        for (let i = path.key + 1, siblingPath; (siblingPath = path.getSibling(i)) && siblingPath.node; i++) {
            if (siblingPath.node.type === 'JSXElement') {
                const name = PathUtils.getJSXElementName(siblingPath);
                if (name === 'elseif') {
                    conditionPaths.push(siblingPath);
                }
                else if (name === 'else') {
                    elsePath = siblingPath;
                }
                else {
                    break;
                }
            }
        }

        // Get the condition expression, and the children contents, for each case.
        const cases = conditionPaths.map((path) => {
            let condition = PathUtils.getAttributeValue(path, 'condition').expression;
            if (path.node.openingElement.name.name === 'unless') {
                condition = t.unaryExpression('!', condition);
            }
            return {
                condition,
                children: PathUtils.jsxChildrenToJS(path.node.children)
            };
        });

        // In reverse order, merge the cases into a JS expression using ternary operators.
        const expr = cases.reduceRight((expr, { condition, children }) => {
            return t.conditionalExpression(condition, children, expr);
        }, PathUtils.jsxChildrenToJS(elsePath && elsePath.node.children));

        path.replaceWith(PathUtils.maybeWrapJSXExpression(path, expr));
    }

    static transformSwitch(path) {
        // Find the child `case` and/or `default` blocks. If we encounter any other JSXElement, stop searching.
        let defaultNode;
        let caseNodes = [ ];
        const children = path.node.children;
        let i = 0;
        for (let childNode; (childNode = children[i]) && childNode; i++) {
            if (childNode.type === 'JSXElement') {
                const name = PathUtils.getJSXElementName({ node: childNode });
                if (name === 'case') {
                    caseNodes.push(childNode);
                }
                else if (name === 'default') {
                    defaultNode = childNode;
                }
                else {
                    break;
                }
            }
        }

        // Get the condition expression, and the children values//contents, for each case.
        const condition = PathUtils.getAttributeValue(path, 'condition').expression;
        const cases = caseNodes.map((node) => {
            let value = PathUtils.getAttributeValue({ node }, 'value').expression;
            return {
                value,
                children: PathUtils.jsxChildrenToJS(node.children)
            };
        });

        // Merge the cases into a JS expression.
        const arrowFunction = t.arrowFunctionExpression([ ], t.blockStatement([
            t.switchStatement(condition, cases.map(({ value, children }) => {
                return t.switchCase(value, [ t.returnStatement(children) ]);
            })),
            t.returnStatement(defaultNode ? PathUtils.jsxChildrenToJS(defaultNode.children) : t.nullLiteral())
        ]));
        const expr = t.callExpression(arrowFunction, [ ]);

        path.replaceWith(PathUtils.maybeWrapJSXExpression(path, expr));
    }

    static transformRepeat(path) {
        // Grab the collection expression, such as `coll`, and the value expression, such as `(item, index)`,
        // from either the `<repeat for={}>` syntax or the `<repeat collection={} as={}>` syntax.
        let valueExpr, collExpr;
        let forAttr = PathUtils.getAttributeValue(path, 'for');
        if (forAttr) {
            valueExpr = forAttr.expression.left;
            collExpr = forAttr.expression.right;
        }
        else {
            valueExpr = PathUtils.getAttributeValue(path, 'as').expression;
            collExpr = PathUtils.getAttributeValue(path, 'collection').expression;
        }

        // If the user included the `index` attribute, we need two arguments to the `map` function.
        let mapArgs = [];
        if (t.isSequenceExpression(valueExpr)) {
            mapArgs.push(valueExpr.expressions[0]);
            mapArgs.push(valueExpr.expressions[1]);
        }
        else {
            mapArgs.push(valueExpr);
        }

        // React expects a normal array to be returned; we'll use Torq's `mapToArray` if available,
        // otherwise fall back to normal array `map`.
        let mapMemberExpr = t.logicalExpression('||',
            t.memberExpression(collExpr, t.identifier('mapToArray')),
            t.memberExpression(collExpr, t.identifier('map')));

        // Auto-add a key to the children, if it's a single child and it doesn't already have a key
        let elements = path.node.children.filter(t.isJSXElement);
        if (elements.length === 1) {
            let attributes = elements[0].openingElement.attributes;
            let hasKeyAttribute = attributes.some(attr => t.isJSXAttribute(attr) && attr.name && attr.name.name === 'key');
            if (!hasKeyAttribute) {
                // Make sure we have an index:
                if (!mapArgs[1]) {
                    mapArgs.push(t.identifier('index'));
                }
                // Add a key:
                attributes.push(t.jSXAttribute(t.jSXIdentifier('key'), t.jSXExpressionContainer(mapArgs[1])));
                PathUtils.warning(path, 'Added key={ index } attribute to contents of <repeat> - please update with a custom key based on item uniqueness.');
            }
        }

        let expr = t.conditionalExpression(collExpr,
            t.callExpression(t.memberExpression(mapMemberExpr, t.identifier('call')), [
                collExpr,
                t.arrowFunctionExpression(mapArgs, PathUtils.jsxChildrenToJS(path.node.children))
            ]),
            t.nullLiteral()
        );

        path.replaceWith(PathUtils.maybeWrapJSXExpression(path, expr));
    }

    static transformUsing(path) {
        const valueExpr = PathUtils.getAttributeValue(path, 'value').expression;
        const asName = PathUtils.getAttributeValue(path, 'as').expression;

        // TODO: We could probably hoist the variable declaration up, and avoid the extra function call.
        let expr = t.callExpression(t.arrowFunctionExpression([],
            t.blockStatement([
                t.variableDeclaration('const', [ t.variableDeclarator(asName, valueExpr) ]),
                t.returnStatement(t.conditionalExpression(asName, PathUtils.jsxChildrenToJS(path.node.children), t.nullLiteral()))
            ])
        ), []);

        path.replaceWith(PathUtils.maybeWrapJSXExpression(path, expr));
    }

    static transformGroup(path) {
        // A <g> group can just be represented as an array (in React 16+).

        // We add keys to each element in the group, otherwise React will complain.
        let elements = path.node.children.filter(t.isJSXElement);
        for (let i = 0; i < elements.length; i++) {
            let attributes = elements[i].openingElement.attributes;
            let hasKeyAttribute = attributes.some(attr => t.isJSXAttribute(attr) && attr.name && attr.name.name === 'key');
            if (!hasKeyAttribute) {
                attributes.push(t.jSXAttribute(t.jSXIdentifier('key'), t.stringLiteral(String(i))));
            }
        }

        path.replaceWith(PathUtils.maybeWrapJSXExpression(path, PathUtils.jsxChildrenToJS(path.node.children)));
    }
};
