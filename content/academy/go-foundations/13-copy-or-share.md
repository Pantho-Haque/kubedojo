---
id: A13
title: Copy or share?
track: A
tier: P0
level: Core
prereqs:
  - A07
  - A09
  - A10
  - A12
subtags:
  - syntax/types
sources:
  - u074
  - u076
bridge: false
goals:
  - 'Say why `b[0] = 8` leaves `a` alone'
  - 'Say why `t[1] = 9` does change `a`'
  - 'Look at a value and ask: does it hold the data, or point to it?'
steps:
  - id: A13-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A13-main
  - id: A13-try
    type: try
    text: 'Change `t := s` to `t := b[:]`. Predict all three printed values.'
    example: A13-main
  - id: A13-explain
    type: explain
    text: >-
      Assignment and argument passing copy values. An array contains its element
      values; a slice contains a description of storage elsewhere. The useful
      question is what the copied value refers to, not whether Go stops copying
      for large values.
  - id: A13-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: CopyVsShare
widget: CopyVsShare
examples:
  - A13-main
pitfalls:
  - id: M03
    title: 'Looks right, but…'
    claim: Slices and large structs are passed by reference.
    explanation: >-
      Arguments are values. Copying a slice copies its descriptor, which still
      reaches the same backing array; copying a struct copies its fields.
    example: A13-copy
  - id: M04
    title: 'Looks right, but…'
    claim: 'Slices, maps and channels bypass value copying.'
    explanation: >-
      These values contain references to underlying data. Copying the value
      preserves those references; it does not change Go into pass-by-reference.
    example: A13-copy
quiz:
  - id: A13-output
    type: predict-output
    question: What will this example print?
    example: A13-main
    answerFromEngine: true
  - id: A13-concept
    type: multiple-choice
    question: Does Go switch to pass-by-reference for a big struct?
    choices:
      - 'No, parameter values are still copied'
      - 'Yes, size changes the language rule'
    answer: 'No, parameter values are still copied'
    explanation: >-
      Assignment and argument passing copy values. An array contains its element
      values; a slice contains a description of storage elsewhere. The useful
      question is what the copied value refers to, not whether Go stops copying
      for large values.
  - id: A13-keyword
    type: fill-blank
    question: 'Fill the blank in this line: ___(a, b, s)'
    answer: fmt.Println
    explanation: >-
      Look for copy in the example. Assignment and argument passing copy values.
      An array contains its element values; a slice contains a description of
      storage elsewhere. The useful question is what the copied value refers to,
      not whether Go stops copying for large values.
deeper:
  - source: u074
  - source: u076
next:
  - A14
claims:
  - text: >-
      Assignment and argument passing copy values. An array contains its element
      values; a slice contains a description of storage elsewhere. The useful
      question is what the copied value refers to, not whether Go stops copying
      for large values.
    sources:
      - u074
      - u076
    model: false
estimatedMinutes: 7
try:
  task: 'Change `t := s` to `t := b[:]`. Predict all three printed values.'
  hint: '`t` now views `b`''s array, so the write of 9 lands in `b`, not `a`.'
  expect: '^\[1 2\] \[8 9\] \[1 2\]\s*$'
  solution: |
    package main

    import "fmt"

    func main() {
        a := [2]int{1, 2}; b := a; b[0] = 8
        s := a[:]; t := b[:]; t[1] = 9
        fmt.Println(a, b, s)
    }
stage: 2
---
Copying a value can be like copying a parcel or copying a window’s address card. Compare an array copy with a slice copy before deciding which changes travel.
