var _C = _interopRequireDefault(require('@twist/babel-plugin-transform-react/src/runtime/classes')).default;
var _S = _interopRequireDefault(require('@twist/babel-plugin-transform-react/src/runtime/styles')).default;

function _interopRequireDefault(obj) {
  return (obj && obj.__esModule ? obj : {
    default: obj
  });
}

// The following must result in one style attribute (no runtime):
<div
  style={{
    'fontSize': 32,
    'fontWeight': "bold"
  }} />;
<div style={{ 'color': "red" }} />;
<div
  style={{
    'backgroundColor': 'white',
    'fontWeight': "bold"
  }} />;
<div style={{
  'some': 'string'
}} />;
<div style={{
  'some': 'template-string'
}} />;
<div
  style={{
    color: 'white',
    'fontWeight': someJsExpression
  }} />;
<div
  style={{
    color: 'red',
    fontSize: 10
  }} />;

// The following should remain unchanged:
<div style={{ foo: bar }} />;
<div { ...spreadArrayRemainsUnchanged } />;

// The following must require the runtime transform:
<div style={_S(`some: ${interpolated}-template-string`)} />;
<div
  { ...spreadArray }
  style={_S({
    color: 'white',
    'fontWeight': someJsExpression
  }, spreadArray.style || {})} />;
<div style={_S(opaqueMaybeString)} />;
<div
  {...spread1}
  {...spread2}
  style={_S(spread1.style || {}, spread2.style || {})}
  className={_C([ spread1.className || '', spread2.className || '' ])} />;

// Spread attributes must retain left-to-right evaluation order when they might include styles.
// i.e. the resulting runtime must include s1, s2, s3, s4, s5 as arguments in order.
<div
  {...s2}
  {...s4}
  style={_S({
    '1': s1
  }, s2.style || {}, s3, s4.style || {}, s5)}
  className={_C([ s2.className || '', s4.className || '' ])} />;
