<div>
    <div class={ ['array-one', 'array-two'] } />
    <div class="one-class two-class" />
    <div class-one-class={expr} class-two-class={expr} />
    <div class="three four" class-two-class={expr} class-one-class={expr} />
    <div class={ ['array-one', 'array-two'] } class-three={expr} />
    <div class="string-one string-two" class-three={expr} />
    <div no-class-attribute { ...spreadArrayRemainsUnchanged } />
    <div class="string-one string-two" class-three={expr} { ...spreadArray } />
</div>
