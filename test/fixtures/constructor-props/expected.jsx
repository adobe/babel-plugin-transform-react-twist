import { BaseComponent as _BaseComponent } from '@twist/react';
import { Component as _Component } from '@twist/react';
@_Component
export class NoArgs extends _BaseComponent {
    constructor(props, context) {
        super(props, context);
    }
}

@_Component({ fork: true })
export class NoArgsFork extends _BaseComponent {
    constructor(props, context) {
        super(props, context);
    }
}

@_Component
export class WithArgs extends _BaseComponent {
    constructor(a, b, c) {
        super();
    }
}

export class NotAComponent {
    constructor() {
        super();
    }
}
