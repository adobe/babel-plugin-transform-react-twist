<div>
    <input value={ x.value } />
    <input bind:value={ x.value } />
    <input type="text" bind:value={ value } />
    <select bind:value={ value }>
        <option value="a">A</option>
        <option value="b">B</option>
    </select>
</div>
