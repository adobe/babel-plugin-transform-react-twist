var _S = _interopRequireDefault(require('@twist/babel-plugin-transform-react/src/runtime/styles')).default;

function _interopRequireDefault(obj) {
    return (obj && obj.__esModule ? obj : {
        default: obj
    });
}

<div>
    <div
        style={_S({
            'fontSize': 32,
            'fontWeight': "bold"
        })} />
    <div
        style={_S({ color: 'white' }, {
            'color': "red"
        })} />
    <div
        style={_S({
            'color': 'white',
            'fontWeight': "bold"
        })} />
    <div style={_S('some: string')} />
    <div
        style={_S({ color: 'white' }, {
            'fontWeight': someJsExpression
        })} />
    <div { ...spreadArrayRemainsUnchanged } />
    <div
        { ...spreadArray }
        style={_S({ color: 'white' }, {
            'fontWeight': someJsExpression
        }, spreadArray.style || {})} />
</div>