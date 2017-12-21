# babel-plugin-transform-react-twist

This babel plugin enhances React-compatible JSX with additional features, including structural components, style and class attribute shorthands, and shorthand for two-way data binding. This is intended to be used as part of [React-Twist](https://github.com/adobe/react-twist), but it can also be used as a standalone Babel plugin with React.

It also implements various optimizations on top of React, such as automatically hoisting arrow functions from the render function, if safe to do so.

## Quick Reference

The plugin options are as follows. If you're using this as part of React-Twist, we recommend using [@twist/react-webpack-plugin](https://github.com/adobe/react-twist-webpack-plugin), which configures this for you. In particular, each Twist library comes with a configuration file that defines its auto-imports, so you don't need to manually add this.

```js
{
    autoImport: {            // Components and decorators to be automatically imported (if they're not already).
        'ui:button': {
            module: 'my-ui-library',
            export: 'SpectrumButton'
        }
    },
    refAttribute: true,      // Support ref={ this.element } syntax (can specify a variable/property, doesn't have to be a function).
    constructorProps: true,  // Add props,context to super() call.
    styleAttribute: true,    // Support style-backround-color={ ... } syntax, and multiple style attributes.
    classAttribute: true,    // Support class-selected={ this.isSelected } syntax, and multiple class attributes.
    controlFlow: true,       // Support structural JSX components: <if>, <else>, <elseif>, <unless>, <repeat>, <using>
    namedChildren: true,     // Support named children, e.g. <Dialog><dialog:header>My Header</dialog:header>{ contents }</Dialog>
    asAttribute: true,       // Support the "as" attribute as a means of providing parameters via JSX (e.g. <route:provider as={route}>...)
    bindAttribute: true,     // Support bind:value={ this.value } as a shorthand for adding an event listener to update this.value.
    arrowLifting: true,      // Automatically lift arrow functions in JSX, so they don't get recreated every time the component is rendered.
}
```

### Structural Components

React-Twist provides a set of *structural components* that allow you to write more declarative JSX, to describe the rendering of a component. These structural components, such as `<if>`, `<repeat>`, and `<using>`, provide basic control-flow constructs. Right now these map onto fairly basic JavaScript equivalents, but we'll be adding further optimizations to React-Twist in the future (e.g. automatically creating sub-components to improve rendering performance).

As an example, consider the following render function:

```javascript
render() {
    return <div>
        <h1>My Items</h1>
        <repeat for={ item in this.items }>
            <if condition={ item.onsale }>
                <div>Fantastic Sale Price!</div>
            </if>
            <div>{ item.name }</div>
        </repeat>
    </div>;
}
```

This is equivalent to:

```javascript
render() {
    return <div>
        <h1>My Items</h1>
        {
            this.items.map(item => {
                return [
                    item.onsale && <div>{ item.name }</div>,
                    <div>Secret Item</div>
                ].filter(x => x);
            })
        }
    </div>;
}
```

The amount of code is very similar, but the declarative style is sometimes easier to read, since it looks closer to an HTML template. React-Twist JSX transforms happen _before_ the React JSX transform, so they're completely optional, and the code they generate is 100% compatible with plain React.

> Note: The `<g></g>` element will soon be deprecated in favor of JSX fragments (`<></>`), which is soon landing in React.

Some more examples of the syntax:

```jsx
// Use if/elseif/else:
<if condition={isEnglish}>
    hello!
</if>
<elseif condition={isFrench}>
    bonjour!
</elseif>
<else>
    :wave:
</else>

// Iterate over items in a collection:
<repeat for={item in collection}>
    <Item item={item} />
</repeat>

// The opposite of <if>:
<unless condition={dontSayHi}>
    Hi
</unless>

// Alias variables with <using>:
<using value={this.long.path.to.item} as={item}>
    {item}
</using>

// Use <g> to group items without wrapping them in a real DOM element:
render() {
    return <g>
        <div>One</div>
        <div>Two</div>
    <g>;
}
```

### Enhanced Class and Style Attributes

The built in support for `class` and `style` attributes in React is somewhat limited - the `className` attribute can only take a string, and the `style` attribute can only take an object. Furthermore, you can only have one of each attribute on an element - if you have multiple attributes with the same name, all except the last will be ignored.

React-Twist provides some enhancements over React, that make CSS much easier to handle:

* Multiple class attributes: `<div class="x" class={ this.y }>` maps to `<div className={ 'x ' + this.y }>`.
* Boolean class attributes: `<div class-selected={ this.selected }>` maps to `<div className={ selected ? 'selected' : '' }>`.
* Class attributes as an array: `<div class={ ['class1', 'class2'] }>` maps to `<div className="class1 class2">`.
* Individual style attributes: `<div style-background-color="red">` maps to `<div style={{backgroundColor: 'red'}}>`. (Note that for measurements, React automatically adds "px" if necessary).
* Style attributes as strings: `<div style="background-color: red">` maps to `<div style={{backgroundColor: 'red'}}>`.

Note that these shorthands become increasingly useful the more you use on the same element - e.g. it saves you having to write complicated string expressions to construct the `className` attribute.

Some examples:

```jsx
// Use "style-" shorthand, in addition to React's style object:
<div style={{ color: 'white' }} style-font-size={32} style-font-weight="bold" />

// Use "class-" shorthand:
<button class-primary={true} class-large={isLarge} />

// Pass an array to className (or "class", which is also converted to className):
<button className={[ 'class1', 'class2' ]} />
```

### Two-Way Data Binding

React doesn't provide any primitives for two-way data binding - you have to register an event listener to detect changes, before you can. Here's an example of what this looks like when binding to the input of a text field (assuming that `this.value` is observable):

```javascript
<input value={ this.value } onChange={ ev => this.value = ev.target.value }/>
```

Since this pattern is very common, React-Twist comes with a handy shorthand - simply prefix the attribute you want to do two-way data binding on with `bind:`. For example, the following is equivalent to the above:

```javascript
<input bind:value={ this.value } />
```

This works for the `value` attribute on input fields, and the `checked` attribute on checkboxes and radio buttons. For the `checked` attribute, the following two lines of code are equivalent:

```javascript
<input type="checkbox" bind:checked={ this.value } />
<input type="checkbox" checked={ this.value } onChange={ () => this.value = !this.value }/>
```

You can do two-way binding when passing data into custom components as well - other than the special cases of `value` and `checked` on `<input/>` elements, all `bind:xxx` attributes are treated as follows:

```javascript
<MyComponent bind:data={ this.data } />
<MyComponent data={ this.data } onDataChange={ val => this.data = val } />
```

Note that this is really just a naming convention - when you modify an `@Attribute`, it checks to see if an `on<attr>Change` prop was passed in, and if so it'll call it with the new attribute value. You can use `bind:<attr>` to get two-way binding automatically, or you can implement this function yourself if you want more control.

> Note: Right now, `@Attribute` always checks for the `on<attr>Change` prop in its setter, but we want to change this so the component has to explicitly opt into it. Ideally we'd like to do this via a prop-types extension, e.g. `PropTypes.string.isWritable` (similar to `isRequired`), but that would require changes to prop-types, so we'll likely take a different approach.

### Named Children

TODO

### Performance Optimizations

In React, the `render()` function of a component runs every time the component changes, and needs to re-render. This has an implication for event handlers - for example, if you write the following:

```javascript
render() {
    return <button onClick={ () => this.clickCount++ }>My Button</button>;
}
```

Then every time the component re-renders, a new closure is created for the arrow function in the `onClick` handler. From React's perspective, it's impossible to know that the function does the same thing, so it has to remove and re-add the event handler. This can lead to performance problems and GC pressure.

The solution to this is to "hoist" the function out of render, namely:

```javascript
@Bind
handleClick() {
    this.clickCount++
}

render() {
    return <button onClick={ this.handleClick }>My Button</button>;
}
```

But it's easy to forget to do this. React-Twist makes life easier by doing this hoisting for you - so long as it's safe to do so (e.g. if the arrow function references other variables that were defined inside of `render()`, then there's no way around recreating it each time, since these variables could change).
