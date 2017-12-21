var _this = this;
<div>
    <div ref={(el) => _this.el = el} />
    <div ref={el => (typeof _this.myval === 'function' ? _this.myval(el) : _this.myval = el)} />
    <div />
</div>
