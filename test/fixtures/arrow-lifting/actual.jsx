let a = 3;
class X {
    render() {
        let x = 2;
        return <div>
            <button onClick={ ev => this.handle() }>Button 1</button>
            <button onClick={ ev => this.handle(x) }>Button 2</button>
            <button onClick={ ev => this.handle(a) }>Button 3</button>
            <button onClick={ ev => this.handle(this.f(x)) }>Button 4</button>
            <button onClick={ ev => this.handle(this.f(a)) }>Button 5</button>
            <button onClick={ ev => this.handle(this.f(ev)) }>Button 6</button>
        </div>;
    }
    test1() {
        if (condition) {
            <button onClick={ ev => this.handle() }>Button</button>
        }
    }
    test2() {
        let fn = () => <button onClick={ ev => this.handle() }>Button</button>;
        return fn();
    }
    test3() {
        let x = 2;
        return <button onClick={ ev => this.handle(x) } onKeyPress={ ev => this.handle(a) }>Button</button>;
    }
}

if (true) {
    <button onClick={ ev => handle() }>Button 1</button>
    let fn = () => <button onClick={ ev => handle() }>Button 2</button>;
}
