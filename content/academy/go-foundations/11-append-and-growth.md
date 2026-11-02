---
id: A11
title: Append and growth
track: A
tier: P0
level: Core
prereqs:
  - A10
subtags:
  - memory/allocator
  - syntax/types
sources:
  - u074
  - u001
  - u008
bridge: false
goals:
  - Predict whether `append` reuses `a`'s array or makes a new one
  - 'Explain why `b[0] = 9` also shows up in `a` here'
  - Use `len` and `cap` to tell whether an append has room
steps:
  - id: A11-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A11-main
  - id: A11-try
    type: try
    text: >-
      Change `make([]int, 2, 3)` to `make([]int, 2, 2)`. Does `b[0] = 9` still
      show up in `a`?
    example: A11-main
  - id: A11-explain
    type: explain
    text: >-
      `append` returns a slice value. It can reuse spare capacity or allocate a
      new backing array. After it grows, an old slice can still point at the
      original array. How much capacity grows by is a runtime detail; do not
      count on it always doubling.
  - id: A11-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: AppendGrowthTimeline
widget: AppendGrowthTimeline
examples:
  - A11-main
pitfalls:
  - id: M08
    title: 'Looks right, but…'
    claim: 'Append always copies, and capacity always doubles.'
    explanation: >-
      Append can reuse spare capacity. When capacity is insufficient it uses
      another backing array; exact growth is an implementation detail. The model
      uses minimum required capacity.
    example: A11-reallocate
quiz:
  - id: A11-output
    type: predict-output
    question: What will this example print?
    example: A11-main
    answerFromEngine: true
  - id: A11-concept
    type: multiple-choice
    question: Must append always allocate a different backing array?
    choices:
      - 'No, existing capacity can be reused'
      - 'Yes, every append copies all elements'
    answer: 'No, existing capacity can be reused'
    explanation: >-
      `append` returns a slice value. It can reuse spare capacity or allocate a
      new backing array. After it grows, an old slice can still point at the
      original array. How much capacity grows by is a runtime detail; do not
      count on it always doubling.
  - id: A11-keyword
    type: fill-blank
    question: 'Fill the blank in this line: b := ___(a, 7)'
    answer: append
    explanation: >-
      Look for append in the example. Append returns a slice value. It can reuse
      capacity or allocate new backing storage. After growth, an old alias can
      still refer to the original array. Exact growth and rounding belong to the
      source-backed allocator model, not a rule that capacity always doubles.
deeper:
  - source: u074
  - source: u001
  - source: u008
next:
  - A12
claims:
  - text: >-
      `append` returns a slice value. It can reuse spare capacity or allocate a
      new backing array. After it grows, an old slice can still point at the
      original array. How much capacity grows by is a runtime detail; do not
      count on it always doubling.
    sources:
      - u074
      - u001
      - u008
    model: true
estimatedMinutes: 7
try:
  task: >-
    Change `make([]int, 2, 3)` to `make([]int, 2, 2)`. Does `b[0] = 9` still
    show up in `a`?
  hint: >-
    With no spare room, `append` must copy into a new, bigger array, so `b`
    stops sharing with `a`.
  expect: '^\[0 0\] \[9 0 7\]'
  solution: |
    package main

    import "fmt"

    func main() {
        a := make([]int, 2, 2)
        b := append(a, 7)
        b[0] = 9
        fmt.Println(a, b, cap(b))
    }
stage: 2
---
Appending is like adding one more item to a shelf. If the shelf has room, its neighbors may see the change; otherwise the items need another shelf.
