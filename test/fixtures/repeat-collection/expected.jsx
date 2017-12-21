<div>
    {(coll ? (coll.mapToArray || coll.map).call(coll, x => x + 'foo') : null)}
</div>