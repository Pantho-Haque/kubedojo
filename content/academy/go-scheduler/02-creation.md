---
id: C02
title: Creation
track: C
tier: P1
level: Extended
prereqs:
  - C01
subtags:
  - sched/goroutines
  - sched/overview
sources:
  - u062
  - u048
bridge: false
goals:
  - Say when the new goroutine's `value` gets its copy of `n`
  - Explain why changing `n` after the `go` line does not change `value`
  - Pass a value as an argument to give a goroutine its own copy
steps:
  - id: C02-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: C02-main
  - id: C02-try
    type: try
    text: >-
      Move the line `n = 9` so it comes before the `go` line. What does the
      goroutine send now?
    example: C02-main
  - id: C02-explain
    type: explain
    text: >-
      A `go` call evaluates its function and arguments in the goroutine that
      launches it. The stage then shows a new goroutine, ready to run, with its
      own copy of those values. The goroutine labels shown here are for the
      picture only; Go has no public API for goroutine IDs.
  - id: C02-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: GoStatementStepper
widget: GoStatementStepper
examples:
  - C02-main
pitfalls:
  - id: C02-pitfall
    title: 'Looks right, but…'
    claim: >-
      A goroutine reads its arguments when it starts running, so it sees the
      latest value of `n`.
    explanation: >-
      The arguments of a `go` call are evaluated right away, by the goroutine
      running the `go` statement. The new goroutine starts with that copy,
      whatever happens to `n` afterward.
    example: C02-main
quiz:
  - id: C02-output
    type: predict-output
    question: What will this example print?
    example: C02-main
    answerFromEngine: true
  - id: C02-concept
    type: multiple-choice
    question: When is the go call argument evaluated?
    choices:
      - Before the new goroutine executes the function
      - Only when the new goroutine eventually prints
    answer: Before the new goroutine executes the function
    explanation: >-
      A `go` call evaluates its function and arguments in the goroutine that
      launches it. The stage then shows a new goroutine, ready to run, with its
      own copy of those values. The goroutine labels shown here are for the
      picture only; Go has no public API for goroutine IDs.
  - id: C02-keyword
    type: fill-blank
    question: 'Fill the blank in this line: ___ func(value int) { ch <- value }(n)'
    answer: go
    explanation: >-
      Look for go in the example. A go call evaluates its function value and
      arguments in the launching goroutine. The creation model then shows a new
      runnable task and its resources. The captured creation-tracking discussion
      is not proof of a public goroutine-ID API.
deeper:
  - source: u062
  - source: u048
next:
  - C03
claims:
  - text: >-
      A `go` call evaluates its function and arguments in the goroutine that
      launches it. The stage then shows a new goroutine, ready to run, with its
      own copy of those values. The goroutine labels shown here are for the
      picture only; Go has no public API for goroutine IDs.
    sources:
      - u062
      - u048
    model: true
estimatedMinutes: 7
try:
  task: >-
    Move the line `n = 9` so it comes before the `go` line. What does the
    goroutine send now?
  hint: >-
    The argument is copied when the `go` statement runs, so it sees whatever `n`
    holds at that moment.
  expect: ^9 9\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        ch := make(chan int)
        n := 7
        n = 9
        go func(value int) { ch <- value }(n)
        fmt.Println(<-ch, n)
    }
stage: 0
---
Launching work is like writing the address on an envelope before sending it. Change the original variable after launch and inspect the argument the new job received.
