---
id: A04
title: Constants
track: A
tier: P1
level: Extended
prereqs:
  - A03
subtags:
  - syntax/constants
  - syntax/types
sources:
  - u100
  - u074
bridge: false
goals:
  - Predict the value `iota` gives each name in a `const` group
  - Explain why `green` and `blue` need no `= iota` of their own
  - Say why `&red` is a compile error
steps:
  - id: A04-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A04-main
  - id: A04-try
    type: try
    text: >-
      Change `red = iota` to `red = iota + 1`. Predict all three values, then
      run.
    example: A04-main
  - id: A04-explain
    type: explain
    text: >-
      Constant declarations describe constant values and can use iota within a
      declaration group. A constant is not an addressable variable, and constant
      evaluation must remain distinct from runtime assignment.
  - id: A04-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: ConstFolding
widget: ConstFolding
examples:
  - A04-main
pitfalls:
  - id: A04-pitfall
    title: 'Looks right, but…'
    claim: >-
      A constant is just a variable you promise not to change, so it has its own
      memory address.
    explanation: >-
      A constant is a value fixed when the program is compiled, not a variable.
      It has no address, so `&red` will not compile.
    example: A04-main
quiz:
  - id: A04-output
    type: predict-output
    question: What will this example print?
    example: A04-main
    answerFromEngine: true
  - id: A04-concept
    type: multiple-choice
    question: Can you take the address of a constant?
    choices:
      - 'No, it is not an addressable variable'
      - 'Yes, every name has an address'
    answer: 'No, it is not an addressable variable'
    explanation: >-
      Constant declarations describe constant values and can use iota within a
      declaration group. A constant is not an addressable variable, and constant
      evaluation must remain distinct from runtime assignment.
  - id: A04-keyword
    type: fill-blank
    question: 'Fill the blank in this line: const ( red = ___; green; blue )'
    answer: iota
    explanation: >-
      Look for iota in the example. Constant declarations describe constant
      values and can use iota within a declaration group. A constant is not an
      addressable variable, and constant evaluation must remain distinct from
      runtime assignment.
deeper:
  - source: u100
  - source: u074
next:
  - A05
claims:
  - text: >-
      Constant declarations describe constant values and can use iota within a
      declaration group. A constant is not an addressable variable, and constant
      evaluation must remain distinct from runtime assignment.
    sources:
      - u100
      - u074
    model: false
estimatedMinutes: 7
try:
  task: 'Change `red = iota` to `red = iota + 1`. Predict all three values, then run.'
  hint: >-
    Names after the first repeat the same expression, with `iota` counting up by
    one each line.
  expect: ^1 2 3\s*$
  solution: |
    package main

    import "fmt"

    const ( red = iota + 1; green; blue )

    func main() {
        fmt.Println(red, green, blue)
    }
stage: 0
---
A constant is a value written in the plan, not a drawer you can refill. Predict the numbered labels before running the example.
