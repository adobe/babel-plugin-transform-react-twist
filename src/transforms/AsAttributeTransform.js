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

module.exports = class AsAttributeTransform {
    static apply(path) {
        const args = PathUtils.stripAsIdentifiers(path);
        if (!args || !path.node.children) {
            return;
        }

        // We replace <MyComponent as={ x, y }>...</MyComponent> with <MyComponent>(x,y) => ...</MyComponent>
        path.node.children = [ t.arrowFunctionExpression(args, PathUtils.jsxChildrenToJS(path.node.children)) ];
    }
};
