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

module.exports = function styles(mainValue, ...subValues) {
    function camelCase(str) {
        return str.replace(/-+([^-]?)/g, function(match, x) {
            return x.toUpperCase();
        });
    }

    var key;
    var resultObject = {};
    if (typeof mainValue === 'string') {
        mainValue.split(';').forEach(function(item) {
            const kv = item.split(':', 2);
            if (kv.length === 2) {
                resultObject[camelCase(kv[0].trim())] = kv[1].trim();
            }
        });
    }
    else if (mainValue) {
        for (key in mainValue) {
            resultObject[camelCase(key)] = mainValue[key];
        }
    }
    // XXX: We can't use Object.assign() here because another babel plugin tries to optimize it out.
    for (let i = 0; i < subValues.length; i++) {
        for (key in subValues[i]) {
            resultObject[camelCase(key)] = subValues[i][key];
        }
    }
    return resultObject;
};
