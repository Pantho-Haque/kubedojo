---
id: C05
title: Preemption
track: C
tier: P1
level: Extended
prereqs:
  - C03
subtags:
  - sched/preempt
sources:
  - u052
  - u055
  - u060
  - u061
  - u064
bridge: false
goals:
  - Say what preemption lets the scheduler do
  - Explain why `main` waits at `<-done` while the loop runs
  - Say why preemption does not make shared writes safe
steps:
  - id: C05-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: C05-main
  - id: C05-try
    type: try
    text: Change `i < 20` to `i < 10`. Predict the total before you run.
    example: C05-main
  - id: C05-explain
    type: explain
    text: >-
      Preemption lets the scheduler pause a long-running goroutine so others get
      a turn. gothik switches goroutines only at certain steps and stops runaway
      programs after a fixed step budget. It does not copy Go's real preemption
      timing and has no switch for older runtime behavior.
  - id: C05-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: PreemptionTimeline
widget: PreemptionTimeline
examples:
  - C05-main
pitfalls:
  - id: C05-pitfall
    title: 'Looks right, but…'
    claim: >-
      Because the scheduler can pause any goroutine, shared variables are safe
      to update without a lock.
    explanation: >-
      Preemption only decides when goroutines take turns. Two goroutines
      touching the same variable still need a mutex or a channel.
    example: C05-main
quiz:
  - id: C05-output
    type: predict-output
    question: What will this example print?
    example: C05-main
    answerFromEngine: true
  - id: C05-concept
    type: multiple-choice
    question: What can preemption allow?
    choices:
      - Another runnable task to make progress
      - Every shared write to become race-free
    answer: Another runnable task to make progress
    explanation: >-
      Preemption lets the scheduler pause a long-running goroutine so others get
      a turn. gothik switches goroutines only at certain steps and stops runaway
      programs after a fixed step budget. It does not copy Go's real preemption
      timing and has no switch for older runtime behavior.
  - id: C05-keyword
    type: fill-blank
    question: 'Fill the blank in this line: ___(<-done)'
    answer: fmt.Println
    explanation: >-
      Look for Gosched in the example. Preemption helps other work progress when
      ordinary cooperation is insufficient. This interpreter yields at recorded
      events and enforces finite budgets. It does not emulate asynchronous
      native preemption or offer an old-runtime behavior toggle.
deeper:
  - source: u052
  - source: u055
  - source: u060
  - source: u061
  - source: u064
next:
  - C06
claims:
  - text: >-
      Preemption lets the scheduler pause a long-running goroutine so others get
      a turn. gothik switches goroutines only at certain steps and stops runaway
      programs after a fixed step budget. It does not copy Go's real preemption
      timing and has no switch for older runtime behavior.
    sources:
      - u052
      - u055
      - u060
      - u061
      - u064
    model: true
estimatedMinutes: 7
try:
  task: Change `i < 20` to `i < 10`. Predict the total before you run.
  hint: The goroutine adds 0 through 9.
  expect: ^45\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        done := make(chan int)
        go func(){ total := 0; for i := 0; i < 10; i++ { total += i }; done <- total }()
        fmt.Println(<-done)
    }
stage: 1
---
A long speaker needs a way to give others a turn. Compare the work timeline with preemption enabled and with a deliberately restricted teaching schedule.
