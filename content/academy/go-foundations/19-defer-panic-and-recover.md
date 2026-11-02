---
id: A19
title: 'Defer, panic and recover'
track: A
tier: P1
level: Extended
prereqs:
  - A06
  - A18
subtags:
  - syntax/control
sources:
  - u082
  - u083
  - u084
bridge: false
goals:
  - Predict the order in which deferred calls run
  - Explain why `saved` prints 1 though `n` is 2 at the end
  - Use a closure in `defer` to read a value at exit time
steps:
  - id: A19-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A19-main
  - id: A19-try
    type: try
    text: >-
      Change `defer fmt.Println("saved", n)` to `defer func() {
      fmt.Println("saved", n) }()`. What does the `saved` line print now?
    example: A19-main
  - id: A19-explain
    type: explain
    text: >-
      A defer evaluates its call arguments when the defer statement executes,
      but invokes the call as the function exits. Recover must be called in the
      appropriate deferred function to stop a panic. Block boundaries alone do
      not run deferred calls.
  - id: A19-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: UnwindStepper
widget: UnwindStepper
examples:
  - A19-main
pitfalls:
  - id: M13
    title: 'Looks right, but…'
    claim: Defer runs when its block ends.
    explanation: >-
      A deferred call runs when its surrounding function returns or unwinds. Its
      arguments are evaluated when the defer statement runs.
    example: A19-defer-order
  - id: M14
    title: 'Looks right, but…'
    claim: Recover catches a panic from anywhere.
    explanation: >-
      Recover stops a panic only when called directly by a deferred function
      during that goroutine’s unwinding. Ordinary calls return nil.
    example: A19-main
quiz:
  - id: A19-output
    type: predict-output
    question: What will this example print?
    example: A19-main
    answerFromEngine: true
  - id: A19-concept
    type: multiple-choice
    question: When are defer arguments evaluated?
    choices:
      - When the defer statement executes
      - Only when the deferred call finally runs
    answer: When the defer statement executes
    explanation: >-
      A defer evaluates its call arguments when the defer statement executes,
      but invokes the call as the function exits. Recover must be called in the
      appropriate deferred function to stop a panic. Block boundaries alone do
      not run deferred calls.
  - id: A19-keyword
    type: fill-blank
    question: 'Fill the blank in this line: ___ fmt.Println("saved", n)'
    answer: defer
    explanation: >-
      Look for defer in the example. A defer evaluates its call arguments when
      the defer statement executes, but invokes the call as the function exits.
      Recover must be called in the appropriate deferred function to stop a
      panic. Block boundaries alone do not run deferred calls.
deeper:
  - source: u082
  - source: u083
  - source: u084
next:
  - A20
claims:
  - text: >-
      A defer evaluates its call arguments when the defer statement executes,
      but invokes the call as the function exits. Recover must be called in the
      appropriate deferred function to stop a panic. Block boundaries alone do
      not run deferred calls.
    sources:
      - u082
      - u083
      - u084
    model: false
estimatedMinutes: 7
try:
  task: >-
    Change `defer fmt.Println("saved", n)` to `defer func() {
    fmt.Println("saved", n) }()`. What does the `saved` line print now?
  hint: 'A closure reads `n` when it finally runs, not when `defer` is written.'
  expect: saved 2
  solution: |
    package main

    import "fmt"

    func main() {
        n := 1
        defer func() { fmt.Println("saved", n) }()
        defer func() { fmt.Println("latest", n) }()
        n = 2
    }
stage: 4
---
Deferred calls are cleanup notes stacked beside a function. Watch the newest note run first, then follow the notes when a panic unwinds the call.
