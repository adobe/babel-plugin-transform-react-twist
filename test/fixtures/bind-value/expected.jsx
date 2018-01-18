<div>
    <input value={ x.value } />
    <input value={x.value} onChange={ev => x.value = ev.target.value} />
    <input type="text" value={value} onChange={ev => value = ev.target.value} />
    <input value={x.value} onChange={ev => (x.value = ev.target.value, (() => unrelatedHandler())(ev))} />
    <input value={x.value} onChange={ev => (x.value = ev.target.value, (ev => x.value = ev.target.value)(ev))} />
    <select value={value} onChange={ev => value = ev.target.value}>
        <option value="a">A</option>
        <option value="b">B</option>
    </select>
</div>