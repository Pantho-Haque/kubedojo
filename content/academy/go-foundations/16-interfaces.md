---
id: A16
title: Interfaces
track: A
tier: P0
level: Core
prereqs:
  - A14
  - A13
subtags:
  - syntax/interfaces
  - syntax/types
sources:
  - u079
  - u096
  - u097
  - u063
bridge: false
goals:
  - Say why `value == nil` is false though `p` is nil
  - 'Name the two parts an interface value carries: a type and a value'
  - Write an interface variable that really is nil
steps:
  - id: A16-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A16-main
  - id: A16-try
    type: try
    text: Change `var value any = p` to `var value any`. Predict both results.
    example: A16-main
  - id: A16-explain
    type: explain
    text: >-
      Interface satisfaction is determined by methods. A nil interface differs
      from an interface holding a concrete nil pointer. The model can display
      dynamic type and data separately; that representation is a teaching view,
      not a promise about every compiler optimization.
  - id: A16-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: IfaceBoxing
widget: IfaceBoxing
examples:
  - A16-main
pitfalls:
  - id: M12
    title: 'Looks right, but…'
    claim: A nil interface equals an interface holding a nil pointer.
    explanation: >-
      An interface holding a nil pointer still has a dynamic type. A nil
      interface has neither a dynamic type nor a value.
    example: A16-typed-nil
quiz:
  - id: A16-output
    type: predict-output
    question: What will this example print?
    example: A16-main
    answerFromEngine: true
  - id: A16-concept
    type: multiple-choice
    question: Is an interface containing a typed nil pointer itself nil?
    choices:
      - 'No, it still carries a concrete type'
      - 'Yes, every nil pointer makes its interface nil'
    answer: 'No, it still carries a concrete type'
    explanation: >-
      Interface satisfaction is determined by methods. A nil interface differs
      from an interface holding a concrete nil pointer. The model can display
      dynamic type and data separately; that representation is a teaching view,
      not a promise about every compiler optimization.
  - id: A16-keyword
    type: fill-blank
    question: 'Fill the blank in this line: var value ___ = p'
    answer: any
    explanation: >-
      Look for any in the example. Interface satisfaction is determined by
      methods. A nil interface differs from an interface holding a concrete nil
      pointer. The model can display dynamic type and data separately; that
      representation is a teaching view, not a promise about every compiler
      optimization.
deeper:
  - source: u079
  - source: u096
  - source: u097
  - source: u063
next:
  - A17
claims:
  - text: >-
      Interface satisfaction is determined by methods. A nil interface differs
      from an interface holding a concrete nil pointer. The model can display
      dynamic type and data separately; that representation is a teaching view,
      not a promise about every compiler optimization.
    sources:
      - u079
      - u096
      - u097
      - u063
    model: true
estimatedMinutes: 7
try:
  task: Change `var value any = p` to `var value any`. Predict both results.
  hint: An interface with no type and no value inside is a true nil interface.
  expect: ^true true\s*$
  solution: |
    package main

    import "fmt"

    type Item struct { N int }

    func main() {
        var p *Item
        var value any
        fmt.Println(p == nil, value == nil)
    }
stage: 3
---
An interface is a labeled container that remembers what kind of thing it carries. Compare an empty container with one carrying a typed nil pointer.
