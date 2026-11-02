---
id: A08
title: 'Arrays and structs: layout'
track: A
tier: P1
level: Extended
prereqs:
  - A03
  - A07
subtags:
  - syntax/types
sources:
  - u074
bridge: false
goals:
  - 'Say why a `byte` plus an `int64` takes 16 bytes, not 9'
  - Predict how adding or reordering fields changes a struct's size
  - Explain why assigning an array or struct copies all of it
steps:
  - id: A08-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A08-main
  - id: A08-try
    type: try
    text: >-
      Add a third field to `a`'s struct so it reads `struct { Small byte; Large
      int64; Tiny byte }{}`. Predict both sizes, then run.
    example: A08-main
  - id: A08-explain
    type: explain
    text: >-
      Arrays and structs are values. Their size includes their elements or
      fields and any alignment padding required by the model’s machine. The
      measuring functions expose layout; they are not permission to access
      arbitrary memory.
  - id: A08-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: StructLayoutRuler
widget: StructLayoutRuler
examples:
  - A08-main
pitfalls:
  - id: A08-pitfall
    title: 'Looks right, but…'
    claim: >-
      Writing `b := a` for an array or struct makes `a` and `b` share the same
      data.
    explanation: >-
      Arrays and structs are values, so `b := a` copies every element or field.
      Changing `b` afterward leaves `a` alone.
    example: A08-main
quiz:
  - id: A08-output
    type: predict-output
    question: What will this example print?
    example: A08-main
    answerFromEngine: true
  - id: A08-concept
    type: multiple-choice
    question: Does assigning an array make another independent array value?
    choices:
      - 'Yes, the array value is copied'
      - 'No, array assignment always shares storage'
    answer: 'Yes, the array value is copied'
    explanation: >-
      Arrays and structs are values. Their size includes their elements or
      fields and any alignment padding required by the model’s machine. The
      measuring functions expose layout; they are not permission to access
      arbitrary memory.
  - id: A08-keyword
    type: fill-blank
    question: 'Fill the blank in this line: a := ___ { Small byte; Large int64 }{}'
    answer: struct
    explanation: >-
      Look for struct in the example. Arrays and structs are values. Their size
      includes their elements or fields and any alignment padding required by
      the model’s machine. The measuring functions expose layout; they are not
      permission to access arbitrary memory.
deeper:
  - source: u074
next:
  - A09
claims:
  - text: >-
      Arrays and structs are values. Their size includes their elements or
      fields and any alignment padding required by the model’s machine. The
      measuring functions expose layout; they are not permission to access
      arbitrary memory.
    sources:
      - u074
    model: true
estimatedMinutes: 7
try:
  task: >-
    Add a third field to `a`'s struct so it reads `struct { Small byte; Large
    int64; Tiny byte }{}`. Predict both sizes, then run.
  hint: >-
    Each `int64` must start on an 8-byte boundary, and the whole struct is
    padded to a multiple of 8.
  expect: ^24 16\s*$
  solution: |
    package main

    import ("fmt"; "unsafe")

    func main() {
        a := struct { Small byte; Large int64; Tiny byte }{}
        b := struct { Large int64; Small byte }{}
        fmt.Println(unsafe.Sizeof(a), unsafe.Sizeof(b))
    }
stage: 1
---
A struct is a parcel with named compartments. Reorder the compartments and measure the spaces between them before deciding which parcel is smaller.
