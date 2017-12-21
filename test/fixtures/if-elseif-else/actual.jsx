<div>
    <if condition={x === 1}>
        one
    </if>
    <elseif condition={x === 2}>
        two
    </elseif>
    <elseif condition={x === 3}>
        three
    </elseif>
    <else>
        four
        <div>
            <if condition={fiveToo}>
                five
            </if>
        </div>
    </else>
</div>
