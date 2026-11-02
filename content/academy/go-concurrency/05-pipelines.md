---
id: D05
title: Pipelines
track: D
tier: P1
level: Extended
prereqs:
  - D01
  - D02
subtags:
  - conc/patterns
sources:
  - u070
  - u072
bridge: false
goals:
  - Trace one value from the first stage to the printout
  - 'Say who closes each channel, and why it is the sender'
  - Explain how `range` over a channel knows when to stop
steps:
  - id: D05-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: D05-main
  - id: D05-try
    type: try
    text: >-
      Change the middle stage to send squares: replace `n*2` with `n*n`. Predict
      the three lines.
    example: D05-main
  - id: D05-explain
    type: explain
    text: >-
      Stages communicate through channels. The sender responsible for a stage’s
      output should have a clear closing rule. Bounded work and cancellation
      prevent abandoned stages from waiting forever.
  - id: D05-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: PipelineFlow
widget: PipelineFlow
examples:
  - D05-main
pitfalls:
  - id: D05-pitfall
    title: 'Looks right, but…'
    claim: The receiver should close a channel once it has read everything it needs.
    explanation: >-
      Only the sender knows when no more values are coming. If a receiver closes
      the channel, the sender's next send panics.
    example: D05-main
quiz:
  - id: D05-output
    type: predict-output
    question: What will this example print?
    example: D05-main
    answerFromEngine: true
  - id: D05-concept
    type: multiple-choice
    question: Who should have a clear plan for closing a stage’s output?
    choices:
      - The producing side
      - Any receiver whenever it wants
    answer: The producing side
    explanation: >-
      Stages communicate through channels. The sender responsible for a stage’s
      output should have a clear closing rule. Bounded work and cancellation
      prevent abandoned stages from waiting forever.
  - id: D05-keyword
    type: fill-blank
    question: >-
      Fill the blank in this line: go func(){ for n := ___ in { out <- n*2 };
      close(out) }()
    answer: range
    explanation: >-
      Look for range in the example. Stages communicate through channels. The
      sender responsible for a stage’s output should have a clear closing rule.
      Bounded work and cancellation prevent abandoned stages from waiting
      forever.
deeper:
  - source: u070
  - source: u072
next:
  - D06
claims:
  - text: >-
      Stages communicate through channels. The sender responsible for a stage’s
      output should have a clear closing rule. Bounded work and cancellation
      prevent abandoned stages from waiting forever.
    sources:
      - u070
      - u072
    model: false
estimatedMinutes: 7
try:
  task: >-
    Change the middle stage to send squares: replace `n*2` with `n*n`. Predict
    the three lines.
  hint: Only the middle stage changes; the closing rules stay the same.
  expect: ^1\s+4\s+9\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        in := make(chan int); out := make(chan int)
        go func(){ for i:=1; i<=3; i++ { in <- i }; close(in) }()
        go func(){ for n := range in { out <- n*n }; close(out) }()
        for n := range out { fmt.Println(n) }
    }
stage: 2
---
A pipeline is a line of workstations passing parcels onward. Close the handoff when a stage is finished, and watch what happens when a downstream station leaves early.
