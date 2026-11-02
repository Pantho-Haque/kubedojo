---
id: D06
title: Cancellation
track: D
tier: P1
level: Extended
prereqs:
  - D05
subtags:
  - conc/context
  - conc/patterns
sources:
  - u069
  - u072
bridge: false
goals:
  - Say what `cancel()` actually does to `ctx.Done()`
  - Explain why the worker only stops because it listens on `Done()`
  - Read `ctx.Err()` to learn why a context ended
steps:
  - id: D06-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: D06-main
  - id: D06-try
    type: try
    text: >-
      Change the last line to `cancel(); fmt.Println(<-done, ctx.Err())`. What
      reason does the context give?
    example: D06-main
  - id: D06-explain
    type: explain
    text: >-
      Context cancellation is cooperative. A task must select or check Done and
      return. Always release cancellation resources when appropriate; passing a
      context does not make arbitrary code interruptible.
  - id: D06-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: ContextTree
widget: ContextTree
examples:
  - D06-main
pitfalls:
  - id: D06-pitfall
    title: 'Looks right, but…'
    claim: Calling `cancel()` kills every goroutine that was given the context.
    explanation: >-
      `cancel()` only closes the `Done()` channel. A goroutine stops only if its
      own code notices and returns.
    example: D06-main
quiz:
  - id: D06-output
    type: predict-output
    question: What will this example print?
    example: D06-main
    answerFromEngine: true
  - id: D06-concept
    type: multiple-choice
    question: Does cancel forcibly stop arbitrary function code?
    choices:
      - 'No, work must cooperate'
      - 'Yes, cancel kills the goroutine immediately'
    answer: 'No, work must cooperate'
    explanation: >-
      Context cancellation is cooperative. A task must select or check Done and
      return. Always release cancellation resources when appropriate; passing a
      context does not make arbitrary code interruptible.
  - id: D06-keyword
    type: fill-blank
    question: >-
      Fill the blank in this line: ctx, cancel :=
      context.___(context.Background())
    answer: WithCancel
    explanation: >-
      Look for WithCancel in the example. Context cancellation is cooperative. A
      task must select or check Done and return. Always release cancellation
      resources when appropriate; passing a context does not make arbitrary code
      interruptible.
deeper:
  - source: u069
  - source: u072
next:
  - D07
claims:
  - text: >-
      Context cancellation is cooperative. A task must select or check Done and
      return. Always release cancellation resources when appropriate; passing a
      context does not make arbitrary code interruptible.
    sources:
      - u069
      - u072
    model: false
estimatedMinutes: 7
try:
  task: >-
    Change the last line to `cancel(); fmt.Println(<-done, ctx.Err())`. What
    reason does the context give?
  hint: >-
    `ctx.Err()` is nil while the context is live and explains why it ended once
    `Done()` is closed.
  expect: context canceled
  solution: |
    package main

    import ("fmt"; "context")

    func main() {
        ctx, cancel := context.WithCancel(context.Background())
        done := make(chan int)
        go func(){ <-ctx.Done(); done <- 1 }()
        cancel(); fmt.Println(<-done, ctx.Err())
    }
stage: 2
---
Cancellation is a stop message sent down a family tree. Let each worker listen and leave its station instead of assuming someone can forcibly erase it.
