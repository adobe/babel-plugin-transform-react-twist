<div>
    {(coll ? (coll.mapToArray || coll.map).call(
        coll,
        (x, index) => <div onClick={ev => x.click(ev)} key={index}>{x + 'foo'}</div>
    ) : null)}
</div>