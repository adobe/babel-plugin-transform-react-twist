var _C = _interopRequireDefault(require('@twist/babel-plugin-transform-react/src/runtime/classes')).default;

function _interopRequireDefault(obj) {
    return (obj && obj.__esModule ? obj : {
        default: obj
    });
}

<div>
    <div className={_C([ ['array-one', 'array-two'] ])} />
    <div className={_C([ "one-class two-class" ])} />
    <div className={_C([ expr && 'one-class', expr && 'two-class' ])} />
    <div
        className={_C([ "three four", expr && 'two-class', expr && 'one-class' ])} />
    <div className={_C([ ['array-one', 'array-two'], expr && 'three' ])} />
    <div className={_C([ "string-one string-two", expr && 'three' ])} />
    <div no-class-attribute { ...spreadArrayRemainsUnchanged } />
    <div
        { ...spreadArray }
        className={_C([ "string-one string-two", expr && 'three', spreadArray.className || '' ])} />
</div>