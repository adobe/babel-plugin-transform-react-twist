import { Button as _Button } from 'my-ui-library';
import { BaseComponent as _BaseComponent } from '@twist/react';
import { Component as _Component } from '@twist/react';
@_Component
export class MyComponent extends _BaseComponent {
    render() {
        <div>
            <_Button />
            <_Button onClick={ this.handleClick }>My Button</_Button>
        </div>
    }
}
