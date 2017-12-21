<div>
    <repeat for={x in coll}>
        <div onClick={ev => x.click(ev)}>{x + 'foo'}</div>
    </repeat>
</div>
