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

const ControlFlowTransform = require('./transforms/ControlFlowTransform');
const ConstructorPropsTransform = require('./transforms/ConstructorPropsTransform');
const StyleAttributeTransform = require('./transforms/StyleAttributeTransform');
const ClassAttributeTransform = require('./transforms/ClassAttributeTransform');
const RefAttributeTransform = require('./transforms/RefAttributeTransform');
const AsAttributeTransform = require('./transforms/AsAttributeTransform');
const BindAttributeTransform = require('./transforms/BindAttributeTransform');
const NamedChildrenTransform = require('./transforms/NamedChildrenTransform');
const ComponentImportTransform = require('@twist/babel-plugin-transform/src/transforms/ComponentImportTransform');
const DecoratorImportTransform = require('@twist/babel-plugin-transform/src/transforms/DecoratorImportTransform');
const ArrowLiftingTransform = require('./transforms/ArrowLiftingTransform');
const ControlledInputTransform = require('./transforms/ControlledInputTransform');

const OPTIONS = {
    refAttribute: true,
    constructorProps: true,
    styleAttribute: true,
    classAttribute: true,
    controlFlow: true,
    namedChildren: true,
    asAttribute: true,
    bindAttribute: true,
    arrowLifting: true,
    controlledInput: true,
    autoImport: {},
    moduleName: '@twist/babel-plugin-transform-react',
};

module.exports = () => ({
    visitor: {
        Program(path, state) {
            const options = state.opts = Object.assign({}, OPTIONS, state.opts);
            // Any plugins which need to run first-ish (before common transpilations) need to traverse the Program
            // node here. Otherwise, other plugins that run in-between these might lose some of the source-code
            // context that we need to apply our own transformations (e.g. arrow functions becoming normal functions
            // without accompanying AST information, or decorators being transpiled out).
            // Since we're a layer on top of several ES6 features, we'll just run everything here first.
            path.traverse(programVisitor(path, state, options), state);
        }
    }
});


const programVisitor = (path, state, options) => ({

    ['ClassExpression|ClassDeclaration|ClassProperty|Method'](path) {
        const decoratorTransform = new DecoratorImportTransform(options.autoImport);
        decoratorTransform.apply(path);
    },

    ClassMethod(path, state) {
        if (options.constructorProps) {
            ConstructorPropsTransform.apply(path, state);
        }
    },

    JSXElement(path, state) {
        if (options.styleAttribute) {
            StyleAttributeTransform.apply(path, state);
        }

        if (options.classAttribute) {
            ClassAttributeTransform.apply(path, state);
        }

        if (options.refAttribute) {
            RefAttributeTransform.apply(path, state);
        }

        if (options.bindAttribute) {
            BindAttributeTransform.apply(path, state);
        }

        if (options.controlledInput) {
            ControlledInputTransform.apply(path, state);
        }

        if (options.arrowLifting) {
            ArrowLiftingTransform.apply(path, state);
        }

        if (options.autoImport) {
            new ComponentImportTransform(options.autoImport).apply(path, state);
        }

        // This must go after auto-import, because we only hoist children that aren't already imported
        if (options.namedChildren) {
            if (NamedChildrenTransform.apply(path, state)) {
                // If we hoist the element, don't continue!
                return;
            }
        }

        // This must go last, because it might transform the element into something else.
        let transformedControlFlow = false;
        if (options.controlFlow) {
            transformedControlFlow = ControlFlowTransform.apply(path, state);
        }

        // Handles 'as' on a normal component (converting children to a function). Note that this
        // has to happen after the control flow transform, because 'as' on a repeat/using is treated
        // differently.
        if (!transformedControlFlow && options.asAttribute) {
            AsAttributeTransform.apply(path, state);
        }
    }
});
