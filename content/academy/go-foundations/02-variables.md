---
id: A02
title: Variables
track: A
tier: P0
level: Core
prereqs:
  - A01
subtags:
  - syntax/types
sources:
  - u074
  - u075
  - u076
bridge: false
goals:
  - Predict both printed values when an inner block declares `x` again
  - 'Explain the difference between `x := 20` and `x = 20` inside a block'
  - 'Spot shadowing: two different variables that share one name'
steps:
  - id: A02-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A02-main
  - id: A02-try
    type: try
    text: >-
      Inside the braces, change `x := 20` to `x = 20` (drop the colon). Predict
      both lines, then run.
    example: A02-main
  - id: A02-explain
    type: explain
    text: >-
      A declaration creates a variable in a scope. A short declaration inside a
      nested block can shadow an outer variable; reassigning the inner variable
      does not change the outer one.
  - id: A02-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: StackSlots
widget: StackSlots
examples:
  - A02-main
pitfalls:
  - id: M01
    title: 'Looks right, but…'
    claim: A short declaration always allocates on the heap.
    explanation: >-
      A declaration gives a value a name. The compiler decides placement from
      how the value is used; a short declaration is not a request for heap
      storage.
    example: A02-main
quiz:
  - id: A02-output
    type: predict-output
    question: What will this example print?
    example: A02-main
    answerFromEngine: true
  - id: A02-concept
    type: multiple-choice
    question: Does the inner x overwrite the outer x?
    choices:
      - 'No, they are different variables'
      - 'Yes, a name has only one slot'
    answer: 'No, they are different variables'
    explanation: >-
      A declaration creates a variable in a scope. A short declaration inside a
      nested block can shadow an outer variable; reassigning the inner variable
      does not change the outer one.
  - id: A02-keyword
    type: fill-blank
    question: 'Fill the blank in this line: { x := 20; ___(x) }'
    answer: fmt.Println
    explanation: >-
      Look for var in the example. A declaration creates a variable in a scope.
      A short declaration inside a nested block can shadow an outer variable;
      reassigning the inner variable does not change the outer one.
deeper:
  - source: u074
  - source: u075
  - source: u076
next:
  - A03
claims:
  - text: >-
      A declaration creates a variable in a scope. A short declaration inside a
      nested block can shadow an outer variable; reassigning the inner variable
      does not change the outer one.
    sources:
      - u074
      - u075
      - u076
    model: false
estimatedMinutes: 7
try:
  task: >-
    Inside the braces, change `x := 20` to `x = 20` (drop the colon). Predict
    both lines, then run.
  hint: '`:=` declares a new variable; `=` assigns to the one that already exists.'
  expect: ^20\s+20\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        x := 10
        { x = 20; fmt.Println(x) }
        fmt.Println(x)
    }
stage: 0
---
A variable is a labeled drawer. Change what is inside it, then open a smaller room with another drawer carrying the same label.
