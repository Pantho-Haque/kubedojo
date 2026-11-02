---
id: A14
title: 'Methods, receivers and embedding'
track: A
tier: P1
level: Extended
prereqs:
  - A07
  - A08
subtags:
  - syntax/types
sources:
  - u077
  - u074
bridge: false
goals:
  - Say why `CopyTick` does not change `c.N`
  - Explain what the `*` in `(c *Counter)` changes
  - Choose a pointer receiver when a method must update its value
steps:
  - id: A14-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A14-main
  - id: A14-try
    type: try
    text: >-
      Change `func (c Counter) CopyTick()` to `func (c *Counter) CopyTick()`.
      Predict `c.N`.
    example: A14-main
  - id: A14-explain
    type: explain
    text: >-
      A value receiver receives a copy. A pointer receiver can mutate the
      pointed-to value. Method sets determine interface satisfaction, while
      embedding promotes members without introducing inheritance.
  - id: A14-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: ReceiverCopyViewer
widget: ReceiverCopyViewer
examples:
  - A14-main
pitfalls:
  - id: A14-pitfall
    title: 'Looks right, but…'
    claim: >-
      Calling a method on a struct always works on the original, so any method
      can change its fields.
    explanation: >-
      A value receiver gets a copy of the struct, just like any other argument.
      Only a pointer receiver can reach back and change the caller's value.
    example: A14-main
quiz:
  - id: A14-output
    type: predict-output
    question: What will this example print?
    example: A14-main
    answerFromEngine: true
  - id: A14-concept
    type: multiple-choice
    question: Which receiver can update the original counter here?
    choices:
      - The pointer receiver
      - Both receivers always update it
    answer: The pointer receiver
    explanation: >-
      A value receiver receives a copy. A pointer receiver can mutate the
      pointed-to value. Method sets determine interface satisfaction, while
      embedding promotes members without introducing inheritance.
  - id: A14-keyword
    type: fill-blank
    question: 'Fill the blank in this line: ___ (c Counter) CopyTick() { c.N++ }'
    answer: func
    explanation: >-
      Look for func in the example. A value receiver receives a copy. A pointer
      receiver can mutate the pointed-to value. Method sets determine interface
      satisfaction, while embedding promotes members without introducing
      inheritance.
deeper:
  - source: u077
  - source: u074
next:
  - A15
claims:
  - text: >-
      A value receiver receives a copy. A pointer receiver can mutate the
      pointed-to value. Method sets determine interface satisfaction, while
      embedding promotes members without introducing inheritance.
    sources:
      - u077
      - u074
    model: false
estimatedMinutes: 7
try:
  task: >-
    Change `func (c Counter) CopyTick()` to `func (c *Counter) CopyTick()`.
    Predict `c.N`.
  hint: >-
    With a pointer receiver, both methods now update the same `Counter` in
    `main`.
  expect: ^2\s*$
  solution: |
    package main

    import "fmt"

    type Counter struct { N int }
    func (c *Counter) CopyTick() { c.N++ }
    func (c *Counter) Tick() { c.N++ }

    func main() {
        c := Counter{}
        c.CopyTick(); c.Tick()
        fmt.Println(c.N)
    }
stage: 3
---
A method receiver is another worksheet handed to a function. Compare changing the worksheet copy with following a pointer back to the original counter.
