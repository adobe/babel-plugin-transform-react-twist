import { BaseComponent as _BaseComponent } from '@twist/react';
import { Component as _Component } from '@twist/react';
var _t = 'throttleUpdates', _handler = Symbol('handler'), _handler2 = Symbol('handler'), _handler3 = Symbol('handler'), _handler4 = Symbol('handler'), _handler5 = Symbol('handler'), _handler6 = Symbol('handler');
@_Component
export class MyComponent extends _BaseComponent {
    render() {
        this[_handler6] = this[_handler6] || (e => (this[_t] = false, (ev => value = ev.target.value)(e), this[_t] = true));
        this[_handler5] = this[_handler5] || (e => (this[_t] = false, (ev => x.value = ev.target.value)(e), this[_t] = true));
        this[_handler4] = this[_handler4] || (e => (this[_t] = false, (ev => (x.value = ev.target.value, (ev => x.value = ev.target.value)(ev)))(e), this[_t] = true));
        this[_handler3] = this[_handler3] || (e => (this[_t] = false, (ev => (x.value = ev.target.value, (() => unrelatedHandler())(ev)))(e), this[_t] = true));
        this[_handler2] = this[_handler2] || (e => (this[_t] = false, (ev => value = ev.target.value)(e), this[_t] = true));
        this[_handler] = this[_handler] || (e => (this[_t] = false, (ev => x.value = ev.target.value)(e), this[_t] = true));
        return (
            <div>
                <input value={ x.value } />
                <input value={x.value} onChange={this[_handler]} />
                <input type="text" value={value} onChange={this[_handler2]} />
                <input value={x.value} onChange={this[_handler3]} />
                <input value={x.value} onChange={this[_handler4]} />
                <textarea value={x.value} onChange={this[_handler5]} />
                <select value={value} onChange={this[_handler6]}>
                    <option value="a">A</option>
                    <option value="b">B</option>
                </select>
            </div>
        );
    }
}
