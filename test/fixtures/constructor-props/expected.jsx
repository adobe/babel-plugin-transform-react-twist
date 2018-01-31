import { BaseComponent as _BaseComponent } from '@twist/react';
import { Component as _Component } from '@twist/react';
@_Component
export class NoArgs extends _BaseComponent {
    constructor(props, context) {
        super(props, context);
    }
}

@VirtualComponent
export class NoArgsVirtual {
    constructor(props, context) {
        super(props, context);
    }
}

@LayoutComponent
export class NoArgsLayout {
    constructor(props, context) {
        super(props, context);
    }
}

@MyDecorator
export class NoArgsNotComponent {
    constructor() {
        super();
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
