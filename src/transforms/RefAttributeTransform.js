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
const template = require('babel-template');

const refFunctionTemplate = template(`
(el) => typeof EXPR === 'function' ? EXPR(el) : (EXPR = el)
`);

module.exports = class RefAttributeTransform {
    static apply(path) {

        // It's possible that this node gets revisited again (e.g. due to any functions we inject being hoisted),
        // so we need to be careful to avoid getting into an infinite loop. We mark the node as having had its
        // refs transformed already, so that we guarantee that this transform only ever runs once.
        if (path.getData('refTransformApplied')) {
            return;
        }
        path.setData('refTransformApplied', true);

        const refAttr = PathUtils.getAttribute(path, 'ref');
        if (refAttr) {
            this.transformRef(path, refAttr);
        }
    }

    static transformRef(path, attr) {
        if (t.isStringLiteral(attr.value)) {
            PathUtils.warning(path, `You passed a string ("${attr.value.value}") to a ref attribute; `
                + `this has no effect. It has been stripped out; use a function instead if a ref is needed.`);
            PathUtils.deleteAttribute(path, 'ref');
            return;
        }

        t.assertJSXExpressionContainer(attr.value);
        const value = attr.value.expression;

        const isFunction = (t.isFunctionExpression(value) || t.isArrowFunctionExpression(value));
        if (!isFunction) {
            attr.value.expression = refFunctionTemplate({ EXPR: value }).expression;
        }
    }
};
