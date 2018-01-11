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

function camelCase(str) {
    return str.replace(/-+([^-]?)/g, function(match, x) {
        return x.toUpperCase();
    });
}

function mergeStyleIntoObject(value, obj) {
    if (typeof value === 'string') {
        value.split(';').forEach(function(item) {
            const kv = item.split(':', 2);
            if (kv.length === 2) {
                obj[camelCase(kv[0].trim())] = kv[1].trim();
            }
        });
    }
    else if (value) {
        for (let key in value) {
            obj[camelCase(key)] = value[key];
        }
    }
}

/**
 * Merge all arguments into one style object. Strings are converted to style objects; object keys are camelCased.
 * @param {...string|object} values
 * @return {object}
 */
module.exports = function styles(...values) {
    let resultObject = {};
    for (let i = 0, len = values.length; i < len; i++) {
        mergeStyleIntoObject(values[i], resultObject);
    }
    return resultObject;
};
