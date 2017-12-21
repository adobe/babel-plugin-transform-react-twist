<div>
    {(coll ? (coll.mapToArray || coll.map).call(coll, (x, index) => x + 'foo') : null)}
</div>