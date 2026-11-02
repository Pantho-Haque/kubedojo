---
id: A15
title: Closures
track: A
tier: P0
level: Core
prereqs:
  - A06
  - A07
subtags:
  - memory/escape
  - syntax/closure
sources:
  - u089
  - u023
bridge: false
goals:
  - 'Explain why the last `a()` prints 12, not 2'
  - Point to the single `n` that both closures write to
  - Give a closure its own variable so it stops sharing
steps:
  - id: A15-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A15-main
  - id: A15-try
    type: try
    text: >-
      Give `b` its own counter: add `m := 0` above it and change `b` to `func()
      int { m += 10; return m }`. Predict the three values.
    example: A15-main
  - id: A15-explain
    type: explain
    text: >-
      A function literal can refer to variables in its surrounding scope. Those
      captured variables can be shared. If a reference outlives its creating
      call, placement must preserve the referenced value; inspect the escape
      lesson before assuming a specific compiler decision.
  - id: A15-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: ClosureCapture
widget: ClosureCapture
examples:
  - A15-main
pitfalls:
  - id: A15-pitfall
    title: 'Looks right, but…'
    claim: >-
      Each function literal takes a snapshot of `n` when it is created, so later
      changes do not reach it.
    explanation: >-
      A closure refers to the variable itself, not a copy of its value. Every
      closure that uses `n` reads and writes the same `n`.
    example: A15-main
quiz:
  - id: A15-output
    type: predict-output
    question: What will this example print?
    example: A15-main
    answerFromEngine: true
  - id: A15-concept
    type: multiple-choice
    question: Do these closures share n?
    choices:
      - 'Yes, they capture the same variable'
      - 'No, every call gets a frozen copy'
    answer: 'Yes, they capture the same variable'
    explanation: >-
      A function literal can refer to variables in its surrounding scope. Those
      captured variables can be shared. If a reference outlives its creating
      call, placement must preserve the referenced value; inspect the escape
      lesson before assuming a specific compiler decision.
  - id: A15-keyword
    type: fill-blank
    question: 'Fill the blank in this line: ___ main() {'
    answer: func
    explanation: >-
      Look for func in the example. A function literal can refer to variables in
      its surrounding scope. Those captured variables can be shared. If a
      reference outlives its creating call, placement must preserve the
      referenced value; inspect the escape lesson before assuming a specific
      compiler decision.
deeper:
  - source: u089
  - source: u023
next:
  - A16
claims:
  - text: >-
      A function literal can refer to variables in its surrounding scope. Those
      captured variables can be shared. If a reference outlives its creating
      call, placement must preserve the referenced value; inspect the escape
      lesson before assuming a specific compiler decision.
    sources:
      - u089
      - u023
    model: false
estimatedMinutes: 7
try:
  task: >-
    Give `b` its own counter: add `m := 0` above it and change `b` to `func()
    int { m += 10; return m }`. Predict the three values.
  hint: Now `a` only touches `n` and `b` only touches `m`.
  expect: ^1 10 2\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        n := 0
        a := func() int { n++; return n }
        m := 0
        b := func() int { m += 10; return m }
        fmt.Println(a(), b(), a())
    }
stage: 3
---
A closure is a helper that remembers where a shared notebook lives. Call two helpers and see whether they keep separate copies or write in the same notebook.
