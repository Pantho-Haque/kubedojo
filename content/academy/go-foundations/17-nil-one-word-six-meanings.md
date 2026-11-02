---
id: A17
title: 'Nil: one word, six meanings'
track: A
tier: P1
level: Extended
prereqs:
  - A16
subtags:
  - syntax/conc
  - syntax/types
sources:
  - u074
  - u079
  - u085
bridge: false
goals:
  - Predict `len` of a nil slice and of a nil map
  - Say why reading a missing key from a nil map is safe
  - Name one thing you cannot do with a nil map
steps:
  - id: A17-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A17-main
  - id: A17-try
    type: try
    text: >-
      Add `s = append(s, 5)` on the line after `var m map[string]int`. Predict
      the three values.
    example: A17-main
  - id: A17-explain
    type: explain
    text: >-
      Nil slices, maps, pointers, channels, functions and interfaces have
      different permitted operations. Reading a nil map and measuring a nil
      slice are useful; writing a nil map, dereferencing a nil pointer or
      calling a nil function fails.
  - id: A17-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: NilTable
widget: NilTable
examples:
  - A17-main
pitfalls:
  - id: M12
    title: 'Looks right, but…'
    claim: A nil interface equals an interface holding a nil pointer.
    explanation: >-
      An interface holding a nil pointer still has a dynamic type. A nil
      interface has neither a dynamic type nor a value.
    example: A16-typed-nil
quiz:
  - id: A17-output
    type: predict-output
    question: What will this example print?
    example: A17-main
    answerFromEngine: true
  - id: A17-concept
    type: multiple-choice
    question: Can len read a nil slice?
    choices:
      - 'Yes, it returns zero'
      - 'No, nil always panics'
    answer: 'Yes, it returns zero'
    explanation: >-
      Nil slices, maps, pointers, channels, functions and interfaces have
      different permitted operations. Reading a nil map and measuring a nil
      slice are useful; writing a nil map, dereferencing a nil pointer or
      calling a nil function fails.
  - id: A17-keyword
    type: fill-blank
    question: 'Fill the blank in this line: ___(len(s), len(m), m["missing"])'
    answer: fmt.Println
    explanation: >-
      Look for nil in the example. Nil slices, maps, pointers, channels,
      functions and interfaces have different permitted operations. Reading a
      nil map and measuring a nil slice are useful; writing a nil map,
      dereferencing a nil pointer or calling a nil function fails.
deeper:
  - source: u074
  - source: u079
  - source: u085
next:
  - A18
claims:
  - text: >-
      Nil slices, maps, pointers, channels, functions and interfaces have
      different permitted operations. Reading a nil map and measuring a nil
      slice are useful; writing a nil map, dereferencing a nil pointer or
      calling a nil function fails.
    sources:
      - u074
      - u079
      - u085
    model: false
estimatedMinutes: 7
try:
  task: >-
    Add `s = append(s, 5)` on the line after `var m map[string]int`. Predict the
    three values.
  hint: '`append` works on a nil slice; it allocates a backing array for you.'
  expect: ^1 0 0\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        var s []int
        var m map[string]int
        s = append(s, 5)
        fmt.Println(len(s), len(m), m["missing"])
    }
stage: 3
---
Nil is a family of empty containers, not one universal operation. Pick a container kind and test what an operation is allowed to do with it.
