<div>
    {(coll ? (coll.mapToArray || coll.map).call(coll, (x, i) => <div key={i}>{x + 'foo'}</div>) : null)}
</div>