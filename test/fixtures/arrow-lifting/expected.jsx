var _handler = Symbol('handler'), _handler2 = Symbol('handler'), _handler3 = Symbol('handler'), _handler4 = Symbol('handler'), _handler5 = Symbol('handler'), _handler6 = Symbol('handler'), _handler7 = Symbol('handler');
let a = 3;
class X {
    render() {
        this[_handler4] = this[_handler4] || (ev => this.handle(this.f(ev)));
        this[_handler3] = this[_handler3] || (ev => this.handle(this.f(a)));
        this[_handler2] = this[_handler2] || (ev => this.handle(a));
        this[_handler] = this[_handler] || (ev => this.handle());
        let x = 2;
        return (
            <div>
                <button onClick={ this[_handler] }>Button 1</button>
                <button onClick={ ev => this.handle(x) }>Button 2</button>
                <button onClick={ this[_handler2] }>Button 3</button>
                <button onClick={ ev => this.handle(this.f(x)) }>Button 4</button>
                <button onClick={ this[_handler3] }>Button 5</button>
                <button onClick={ this[_handler4] }>Button 6</button>
            </div>
        );
    }
    test1() {
        this[_handler5] = this[_handler5] || (ev => this.handle());
        if (condition) {
            <button onClick={ this[_handler5] }>Button</button>
        }
    }
    test2() {
        let fn = () => {
            this[_handler6] = this[_handler6] || (ev => this.handle());
            return <button onClick={ this[_handler6] }>Button</button>;
        };
        return fn();
    }
    test3() {
        this[_handler7] = this[_handler7] || (ev => this.handle(a));
        let x = 2;
        return <button onClick={ ev => this.handle(x) } onKeyPress={ this[_handler7] }>Button</button>;
    }
    test4() {
        function f() {
            <button onClick={ ev => handle() }>Button 1</button>;
        }
    }
}

if (true) {
    <button onClick={ ev => handle() }>Button 1</button>
    let fn = () => <button onClick={ ev => handle() }>Button 2</button>;
    function f() {
        <button onClick={ ev => handle() }>Button 1</button>;
    }
}
