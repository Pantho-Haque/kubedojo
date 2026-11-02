---
id: A12
title: Maps
track: A
tier: P0
level: Core
prereqs:
  - A10
subtags:
  - memory/maps
  - syntax/types
sources:
  - u047
  - u074
bridge: false
goals:
  - Say why both lookups print 0
  - Use the `ok` value to tell a stored zero from a missing key
  - Predict what reading a missing key from a nil map returns
steps:
  - id: A12-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A12-main
  - id: A12-try
    type: try
    text: >-
      Change `map[string]int{"count": 0}` to `map[string]int{}`. Predict all
      four values.
    example: A12-main
  - id: A12-explain
    type: explain
    text: >-
      A map read returns a zero value for an absent key. The comma-ok result
      reports whether the key exists. A nil map can be read but cannot accept a
      new entry. Native Go does not promise insertion-order iteration.
  - id: A12-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: MapBuckets
widget: MapBuckets
examples:
  - A12-main
pitfalls:
  - id: M09
    title: 'Looks right, but…'
    claim: Map iteration guarantees insertion order.
    explanation: >-
      Go leaves map iteration order unspecified. A recorded teaching run has one
      order; it is not a promise about another run.
    example: A12-main
  - id: M10
    title: 'Looks right, but…'
    claim: Deleting a key guarantees that map storage shrinks.
    explanation: >-
      Deletion removes a key. It does not promise an immediate reduction in
      backing storage or returned operating-system memory.
    example: A12-main
quiz:
  - id: A12-output
    type: predict-output
    question: What will this example print?
    example: A12-main
    answerFromEngine: true
  - id: A12-concept
    type: multiple-choice
    question: How do you distinguish absence from a stored zero?
    choices:
      - Use the comma-ok result
      - Assume zero means absent
    answer: Use the comma-ok result
    explanation: >-
      A map read returns a zero value for an absent key. The comma-ok result
      reports whether the key exists. A nil map can be read but cannot accept a
      new entry. Native Go does not promise insertion-order iteration.
  - id: A12-keyword
    type: fill-blank
    question: 'Fill the blank in this line: m := ___[string]int{"count": 0}'
    answer: map
    explanation: >-
      Look for map in the example. A map read returns a zero value for an absent
      key. The comma-ok result reports whether the key exists. A nil map can be
      read but cannot accept a new entry. Native Go does not promise
      insertion-order iteration.
deeper:
  - source: u047
  - source: u074
next:
  - A13
claims:
  - text: >-
      A map read returns a zero value for an absent key. The comma-ok result
      reports whether the key exists. A nil map can be read but cannot accept a
      new entry. Native Go does not promise insertion-order iteration.
    sources:
      - u047
      - u074
    model: false
estimatedMinutes: 7
try:
  task: >-
    Change `map[string]int{"count": 0}` to `map[string]int{}`. Predict all four
    values.
  hint: 'Now neither key is in the map, so both `ok` values report that.'
  expect: ^0 false 0 false\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        m := map[string]int{}
        a, ok := m["count"]
        b, missing := m["other"]
        fmt.Println(a, ok, b, missing)
    }
stage: 2
---
A map is a lookup desk: you ask for a key rather than a position. Ask for a missing key, then use the extra result to distinguish absence from a stored zero.
