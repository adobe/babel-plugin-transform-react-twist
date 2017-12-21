<div>
    {(coll ? (coll.mapToArray || coll.map).call(coll, x => <div key={x}>{x + 'foo'}</div>) : null)}
</div>