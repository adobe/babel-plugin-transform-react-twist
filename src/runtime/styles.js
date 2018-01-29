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
        // NOTE: The implementation here is designed to facilitate legacy code that declares inline styles as strings;
        // it does not implement the complete CSS parsing specification. In practice, this implementation covers nearly
        // all cases, including "data:" URI values that would otherwise break when splitting on semicolons only. In the
        // future, we could explore adding a compliant parser. We would need two variants: one that runs at
        // compile-time, and one that is used in the browser. The browser implementation would be straightforward, using
        // an element's style attribute as a conversion interface. For the compiler, as of this writing (Jan 2018), a
        // cursory search doesn't reveal any lightweight more-compliant parsers; it's likely we'd need to use postcss.
        value.split(/;(?!base64)/g).forEach(function(item) {
            const colonIndex = item.indexOf(':');
            if (colonIndex !== -1) {
                const key = item.slice(0, colonIndex).trim();
                const value = item.slice(colonIndex + 1).trim();
                obj[camelCase(key)] = value;
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
 * If only one string was provided, and it doesn't look like a CSS string, we'll return the string directly.
 * @param {...string|object} values
 * @return {object|string}
 */
module.exports = function styles(...values) {
    // Special case: If only one value was provided, and it doesn't look like a CSS string, we'll assume that it's
    // a custom attribute, and pass it through as a string directly.
    // (e.g. react-intl, which uses style="somestring" in a non-CSS context)
    if (values.length === 1 && typeof values[0] === 'string' && values[0].indexOf(':') === -1) {
        return values[0];
    }
    let resultObject = {};
    for (let i = 0, len = values.length; i < len; i++) {
        mergeStyleIntoObject(values[i], resultObject);
    }
    return resultObject;
};
