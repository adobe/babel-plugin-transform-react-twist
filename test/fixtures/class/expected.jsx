function _classAttributeTransform(expressions) {
    var classes = [  ], expr, key;

    for (var i = 0, len = expressions.length; i < len; i++) {
        expr = expressions[i];

        if (Array.isArray(expr)) {
            classes = classes.concat(expr);
        } else if (typeof expr === 'string') {
            classes.push(expr);
        } else {
            for (key in expr) {
                if (expr[key]) {
                    classes.push(key);
                }
            }
        }
    }

    return classes.filter(Boolean).join(' ');
}

<div>
    <div className={_classAttributeTransform([ ['array-one', 'array-two'] ])} />
    <div className={_classAttributeTransform([ "one-class two-class" ])} />
    <div
        className={_classAttributeTransform([ expr && 'one-class', expr && 'two-class' ])} />
    <div
        className={_classAttributeTransform([ "three four", expr && 'two-class', expr && 'one-class' ])} />
    <div
        className={_classAttributeTransform([ ['array-one', 'array-two'], expr && 'three' ])} />
    <div
        className={_classAttributeTransform([ "string-one string-two", expr && 'three' ])} />
    <div no-class-attribute { ...spreadArrayRemainsUnchanged } />
    <div
        { ...spreadArray }
        className={_classAttributeTransform([ "string-one string-two", expr && 'three', spreadArray.className || '' ])} />
</div>
