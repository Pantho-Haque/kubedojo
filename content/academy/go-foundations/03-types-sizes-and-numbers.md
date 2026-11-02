---
id: A03
title: 'Types, sizes and numbers'
track: A
tier: P0
level: Core
prereqs:
  - A02
subtags:
  - syntax/constants
  - syntax/types
sources:
  - u074
  - u078
  - u100
bridge: false
goals:
  - Predict what `n++` does to an `int8` that already holds 127
  - Say why `7/2` prints 3 when both numbers are integers
  - Pick an integer type big enough for the values you need
steps:
  - id: A03-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A03-main
  - id: A03-try
    type: try
    text: >-
      Change `var n int8 = 127` to `var n int16 = 127`. What does `n` print
      after `n++` now?
    example: A03-main
  - id: A03-explain
    type: explain
    text: >-
      Integer types have defined ranges. Variables can wrap under integer
      arithmetic, while an unrepresentable constant is rejected. A conversion is
      explicit; it is not permission to ignore a constant-overflow error.
  - id: A03-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: BitRuler
widget: BitRuler
examples:
  - A03-main
pitfalls:
  - id: M05
    title: 'Looks right, but…'
    claim: Numeric variables convert automatically.
    explanation: >-
      Distinct numeric variable types need explicit conversion. Untyped
      constants have separate representability rules.
    example: A03-main
quiz:
  - id: A03-output
    type: predict-output
    question: What will this example print?
    example: A03-main
    answerFromEngine: true
  - id: A03-concept
    type: multiple-choice
    question: Can a constant outside int8’s range be assigned to int8?
    choices:
      - 'No, it must be representable'
      - 'Yes, constants always wrap'
    answer: 'No, it must be representable'
    explanation: >-
      Integer types have defined ranges. Variables can wrap under integer
      arithmetic, while an unrepresentable constant is rejected. A conversion is
      explicit; it is not permission to ignore a constant-overflow error.
  - id: A03-keyword
    type: fill-blank
    question: 'Fill the blank in this line: var n ___ = 127'
    answer: int8
    explanation: >-
      Look for int8 in the example. Integer types have defined ranges. Variables
      can wrap under integer arithmetic, while an unrepresentable constant is
      rejected. A conversion is explicit; it is not permission to ignore a
      constant-overflow error.
deeper:
  - source: u074
  - source: u078
  - source: u100
next:
  - A04
claims:
  - text: >-
      Integer types have defined ranges. Variables can wrap under integer
      arithmetic, while an unrepresentable constant is rejected. A conversion is
      explicit; it is not permission to ignore a constant-overflow error.
    sources:
      - u074
      - u078
      - u100
    model: false
estimatedMinutes: 7
try:
  task: >-
    Change `var n int8 = 127` to `var n int16 = 127`. What does `n` print after
    `n++` now?
  hint: 'An `int16` can count up to 32767, so 128 fits without wrapping around.'
  expect: ^128 3\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        var n int16 = 127
        n++
        fmt.Println(n, 7/2)
    }
stage: 0
---
A sized integer is like a small wheel with a fixed number of positions. Turn it past its last position and compare that runtime behavior with an overflowing constant.
