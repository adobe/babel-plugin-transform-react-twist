function _styleTransform(mainValue, ...subValues) {
    function camelCase(str) {
        return str.replace(/-+([^-]?)/g, function(match, x) {
            return x.toUpperCase();
        });
    }

    var key;
    var resultObject = {};

    if (typeof mainValue === 'string') {
        mainValue.split(';').forEach(function(item) {
            const kv = item.split(':', 2);

            if (kv.length === 2) {
                resultObject[camelCase(kv[0].trim())] = kv[1].trim();
            }
        });
    } else if (mainValue) {
        for (key in mainValue) {
            resultObject[camelCase(key)] = mainValue[key];
        }
    }

    for (let i = 0; i < subValues.length; i++) {
        for (key in subValues[i]) {
            resultObject[camelCase(key)] = subValues[i][key];
        }
    }

    return resultObject;
}

<div>
    <div
        style={_styleTransform({
            'fontSize': 32,
            'fontWeight': "bold"
        })} />
    <div
        style={_styleTransform({ color: 'white' }, {
            'color': "red"
        })} />
    <div
        style={_styleTransform({
            'color': 'white',
            'fontWeight': "bold"
        })} />
    <div style={_styleTransform('some: string')} />
    <div
        style={_styleTransform({ color: 'white' }, {
            'fontWeight': someJsExpression
        })} />
    <div { ...spreadArrayRemainsUnchanged } />
    <div
        { ...spreadArray }
        style={_styleTransform({ color: 'white' }, {
            'fontWeight': someJsExpression
        }, spreadArray.style || {})} />
</div>
