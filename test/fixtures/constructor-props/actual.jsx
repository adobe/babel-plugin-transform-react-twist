@Component
export class NoArgs {
    constructor() {
        super();
    }
}

@VirtualComponent
export class NoArgsVirtual {
    constructor() {
        super();
    }
}

@LayoutComponent
export class NoArgsLayout {
    constructor() {
        super();
    }
}

@MyDecorator
export class NoArgsNotComponent {
    constructor() {
        super();
    }
}

@Component({ fork: true })
export class NoArgsFork {
    constructor() {
        super();
    }
}

@Component
export class WithArgs {
    constructor(a, b, c) {
        super();
    }
}

export class NotAComponent {
    constructor() {
        super();
    }
}
