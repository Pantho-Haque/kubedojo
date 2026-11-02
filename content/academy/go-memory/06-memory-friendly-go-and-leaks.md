---
id: B06
title: Memory-friendly Go and leaks
track: B
tier: P1
level: Extended
prereqs:
  - B04
  - A10
  - A12
subtags:
  - conc/sync
  - memory/gc
  - memory/maps
  - memory/profile
sources:
  - u011
  - u015
  - u017
  - u022
  - u031
  - u047
  - u067
bridge: false
goals:
  - Say why `cap(small)` is 64 when `len(small)` is only 2
  - Explain how a 2-item slice can keep 64 ints alive
  - Use `copy` to keep only the items you need
steps:
  - id: B06-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: B06-main
  - id: B06-try
    type: try
    text: >-
      Change `small := large[:2]` to `small := large[:2:2]`. What does
      `cap(small)` print, and does `small` still point into the big array?
    example: B06-main
  - id: B06-explain
    type: explain
    text: >-
      A reachable reference can retain more backing storage than the visible
      view suggests. Allocation reduction and retention reduction are different
      questions. Inspect the model path before applying preallocation, reuse or
      pooling as a blanket fix.
  - id: B06-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: LeakHunter
widget: LeakHunter
examples:
  - B06-main
pitfalls:
  - id: M10
    title: 'Looks right, but…'
    claim: Deleting a key guarantees that map storage shrinks.
    explanation: >-
      Deletion removes a key. It does not promise an immediate reduction in
      backing storage or returned operating-system memory.
    example: A12-main
quiz:
  - id: B06-output
    type: predict-output
    question: What will this example print?
    example: B06-main
    answerFromEngine: true
  - id: B06-concept
    type: multiple-choice
    question: Can a short slice retain its larger backing array?
    choices:
      - 'Yes, the view can keep that storage reachable'
      - 'No, unused elements are automatically detached'
    answer: 'Yes, the view can keep that storage reachable'
    explanation: >-
      A reachable reference can retain more backing storage than the visible
      view suggests. Allocation reduction and retention reduction are different
      questions. Inspect the model path before applying preallocation, reuse or
      pooling as a blanket fix.
  - id: B06-keyword
    type: fill-blank
    question: 'Fill the blank in this line: ___OfSmall := make([]int, len(small))'
    answer: copy
    explanation: >-
      Look for copy in the example. A reachable reference can retain more
      backing storage than the visible view suggests. Allocation reduction and
      retention reduction are different questions. Inspect the model path before
      applying preallocation, reuse or pooling as a blanket fix.
deeper:
  - source: u011
  - source: u015
  - source: u017
  - source: u022
  - source: u031
  - source: u047
  - source: u067
next:
  - C01
claims:
  - text: >-
      A reachable reference can retain more backing storage than the visible
      view suggests. Allocation reduction and retention reduction are different
      questions. Inspect the model path before applying preallocation, reuse or
      pooling as a blanket fix.
    sources:
      - u011
      - u015
      - u017
      - u022
      - u031
      - u047
      - u067
    model: true
estimatedMinutes: 7
try:
  task: >-
    Change `small := large[:2]` to `small := large[:2:2]`. What does
    `cap(small)` print, and does `small` still point into the big array?
  hint: >-
    A full slice expression limits what `small` can see, but its arrow still
    leads to the same 64-int array. Only `copy` makes a separate one.
  expect: ^2 2 2\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        large := make([]int, 64)
        small := large[:2:2]
        copyOfSmall := make([]int, len(small))
        copy(copyOfSmall, small)
        fmt.Println(len(small), cap(small), cap(copyOfSmall))
    }
stage: 1
---
A tiny window can keep a whole warehouse in use. Keep a short slice, then copy what you need and compare the retention paths.
