<div>
    <input type="checkbox" checked={ x.isChecked } />
    <input type="checkbox" checked={x.check} onChange={() => x.check = !x.check} />
    <input type="radio" checked={isChecked} onChange={() => isChecked = !isChecked} />
</div>
