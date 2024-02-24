# Monte Hall problem

Simulates the Monte Hall problem using JavaScript.

Inspired by a stranger who also wrote a program to understand this.

## Explanation

To understand why a contestant has better odds of winning the grand prize
when always changing doors, think of the different scenarios. Two doors
yield goats while one door yields the grand prize. Treat the two goats as
separate outcomes--I think of them as a blue goat and red goat.

### Scenario 1

You pick the blue goat initially. The host reveals the door with the red goat.
If you change doors, you will choose the grand prize.

### Scenario 2

You pick the red goat initially. The host reveals the door with the blue goat.
If you change doors, you will choose the grand prize.

### Scenario 3

You pick the grand prize initially. The host reveals one of the goats.
If you change doors, you will choose the hidden goat.

### Conclusion

Now you should see that in 2 of 3 possible scenarios, you win the grand
prize by changing your choice of door. This gives you 2/3 odds of winning
with this strategy.

On the other hand, retaining the original choice will win you the grand
prize only if you chose it initially. This happens in 1 of 3 scenarios,
which yields 1/3 odds of winning.

