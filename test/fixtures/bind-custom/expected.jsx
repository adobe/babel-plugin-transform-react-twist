<div>
    <MyComponent value={value} onValueChange={val => value = val} />
    <MyComponent attr={x.value} onAttrChange={val => x.value = val} />
    <MyComponent
        left={x.left}
        onLeftChange={val => x.left = val}
        right={x.right}
        onRightChange={val => x.right = val} />
</div>
