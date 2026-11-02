---
id: A20
title: Generics
track: A
tier: P1
level: Extended
prereqs:
  - A16
  - A14
subtags:
  - syntax/generics
sources:
  - u090
  - u091
  - u092
  - u093
  - u094
bridge: false
goals:
  - Say which types `~int | ~int64` allows `T` to be
  - 'Explain how Go picks `T` in `Add(2, 3)` without being told'
  - Extend the constraint so `Add` also works with `float64`
steps:
  - id: A20-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A20-main
  - id: A20-try
    type: try
    text: >-
      Add `| ~float64` to the constraint and print `Add(1.5, 2.5)` as a third
      value. What prints?
    example: A20-main
  - id: A20-explain
    type: explain
    text: >-
      Constraints determine which operations are permitted for a type parameter.
      Inference can supply type arguments from a call. Reuse a generic
      definition when its accepted types and operations are clear, rather than
      hiding behavior behind unnecessary abstraction.
  - id: A20-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: InstantiationViewer
widget: InstantiationViewer
examples:
  - A20-main
pitfalls:
  - id: A20-pitfall
    title: 'Looks right, but…'
    claim: 'Writing `[T any]` is enough to let you use `+` on `T`.'
    explanation: >-
      `any` allows every type, and many types have no `+`. The constraint must
      list types that support it, like `~int | ~int64`.
    example: A20-main
quiz:
  - id: A20-output
    type: predict-output
    question: What will this example print?
    example: A20-main
    answerFromEngine: true
  - id: A20-concept
    type: multiple-choice
    question: What permits + in this generic function?
    choices:
      - Its constraint admits the required numeric operations
      - The parameter name T
    answer: Its constraint admits the required numeric operations
    explanation: >-
      Constraints determine which operations are permitted for a type parameter.
      Inference can supply type arguments from a call. Reuse a generic
      definition when its accepted types and operations are clear, rather than
      hiding behavior behind unnecessary abstraction.
  - id: A20-keyword
    type: fill-blank
    question: >-
      Fill the blank in this line: func Add[___ ~int | ~int64](a, b T) T {
      return a + b }
    answer: T
    explanation: >-
      Look for T in the example. Constraints determine which operations are
      permitted for a type parameter. Inference can supply type arguments from a
      call. Reuse a generic definition when its accepted types and operations
      are clear, rather than hiding behavior behind unnecessary abstraction.
deeper:
  - source: u090
  - source: u091
  - source: u092
  - source: u093
  - source: u094
next:
  - B01
claims:
  - text: >-
      Constraints determine which operations are permitted for a type parameter.
      Inference can supply type arguments from a call. Reuse a generic
      definition when its accepted types and operations are clear, rather than
      hiding behavior behind unnecessary abstraction.
    sources:
      - u090
      - u091
      - u092
      - u093
      - u094
    model: false
estimatedMinutes: 7
try:
  task: >-
    Add `| ~float64` to the constraint and print `Add(1.5, 2.5)` as a third
    value. What prints?
  hint: >-
    The constraint must list `float64` before Go lets `+` work on float
    arguments.
  expect: ^5 15 4\s*$
  solution: |
    package main

    import "fmt"

    func Add[T ~int | ~int64 | ~float64](a, b T) T { return a + b }

    func main() {
        fmt.Println(Add(2, 3), Add(int64(7), int64(8)), Add(1.5, 2.5))
    }
stage: 4
---
A type parameter is a blank label on a reusable tool. The constraint says which materials the tool can work on before anyone calls it.
