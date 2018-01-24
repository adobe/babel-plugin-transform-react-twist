<div>
    <input value={ x.value } />
    <input bind:value={ x.value } />
    <input type="text" bind:value={ value } />
    <input bind:value={ x.value } onChange={() => unrelatedHandler()} />
    <input bind:value={ x.value } onChange={(ev) => x.value = ev.target.value } />
    <textarea bind:value={ x.value } />
    <select bind:value={ value }>
        <option value="a">A</option>
        <option value="b">B</option>
    </select>
</div>
