@Component
export class NoArgs {
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
