
// The following must result in one style attribute (no runtime):
<div style-font-size={32} style-font-weight="bold" />;
<div style={{ color: 'white' }} style-color="red" />;
<div style="background-color: white" style-font-weight="bold" />;
<div style={'some: string'} />;
<div style={`some: template-string`} />;
<div style={{ color: 'white' }} style-font-weight={someJsExpression} />;
<div style={{ color: 'white' }} style={{ color: 'red', fontSize: 10 }} />;

// The following should remain unchanged:
<div style={{ foo: bar }} />;
<div { ...spreadArrayRemainsUnchanged } />;
<div style="invalid-style-string" />;

// The following must require the runtime transform:
<div style={`some: ${interpolated}-template-string`} />;
<div style={{ color: 'white' }} style-font-weight={someJsExpression} { ...spreadArray } />;
<div style={opaqueMaybeString} />;
<div {...spread1} {...spread2} />;

// Spread attributes must retain left-to-right evaluation order when they might include styles.
// i.e. the resulting runtime must include s1, s2, s3, s4, s5 as arguments in order.
<div style-1={s1} {...s2} style={s3} {...s4} style={s5} />;
