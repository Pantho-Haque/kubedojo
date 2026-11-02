---
id: A10
title: Slices
track: A
tier: P0
level: Core
prereqs:
  - A07
  - A08
subtags:
  - syntax/types
sources:
  - u074
bridge: false
goals:
  - Point to the one backing array that both `a` and `b` reach
  - 'Explain why writing `b[0]` changes what `a` prints'
  - Make a slice with its own storage using `make` and `copy`
steps:
  - id: A10-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A10-main
  - id: A10-try
    type: try
    text: >-
      Give `b` its own array: replace `b := a[:2]` with `b := make([]int, 2);
      copy(b, a)`. What does `a` print now?
    example: A10-main
  - id: A10-explain
    type: explain
    text: >-
      A slice describes a portion of a backing array. Copying the slice value
      does not copy the array elements. Its length bounds indexing, and its
      capacity describes how far a view may extend from its start.
  - id: A10-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: SliceHeaderBacking
widget: SliceHeaderBacking
examples:
  - A10-main
pitfalls:
  - id: M03
    title: 'Looks right, but…'
    claim: Slices and large structs are passed by reference.
    explanation: >-
      Arguments are values. Copying a slice copies its descriptor, which still
      reaches the same backing array; copying a struct copies its fields.
    example: A13-copy
quiz:
  - id: A10-output
    type: predict-output
    question: What will this example print?
    example: A10-main
    answerFromEngine: true
  - id: A10-concept
    type: multiple-choice
    question: Why does a see the write through b?
    choices:
      - Both slices refer to the same backing array
      - Println secretly copies b into a
    answer: Both slices refer to the same backing array
    explanation: >-
      A slice describes a portion of a backing array. Copying the slice value
      does not copy the array elements. Its length bounds indexing, and its
      capacity describes how far a view may extend from its start.
  - id: A10-keyword
    type: fill-blank
    question: 'Fill the blank in this line: ___(a)'
    answer: fmt.Println
    explanation: >-
      Look for slice in the example. A slice describes a portion of a backing
      array. Copying the slice value does not copy the array elements. Its
      length bounds indexing, and its capacity describes how far a view may
      extend from its start.
deeper:
  - source: u074
next:
  - A11
claims:
  - text: >-
      A slice describes a portion of a backing array. Copying the slice value
      does not copy the array elements. Its length bounds indexing, and its
      capacity describes how far a view may extend from its start.
    sources:
      - u074
    model: false
estimatedMinutes: 7
try:
  task: >-
    Give `b` its own array: replace `b := a[:2]` with `b := make([]int, 2);
    copy(b, a)`. What does `a` print now?
  hint: >-
    `make` creates a new backing array and `copy` fills it, so `b` no longer
    points into `a`'s array.
  expect: '^\[10 20 30\]\s*$'
  solution: |
    package main

    import "fmt"

    func main() {
        a := []int{10, 20, 30}
        b := make([]int, 2); copy(b, a)
        b[0] = 99
        fmt.Println(a)
    }
stage: 2
---
Two slices can be two windows into one room. Change a value through one window and look through the other before checking the output.
