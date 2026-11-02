---
id: F05
title: Build a cancellable pipeline
track: F
tier: P2
level: Advanced
prereqs: []
subtags:
  - conc/context
  - conc/model
  - conc/patterns
sources:
  - u069
  - u072
  - u066
bridge: false
goals:
  - Say how one `cancel()` stops every worker listening on `ctx`
  - Check that no worker goroutine is still waiting at the end
  - Explain why a printed result does not prove the workers exited
steps:
  - id: F05-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: F05-main
  - id: F05-try
    type: try
    text: >-
      Start a second worker with the same `go` line, and print `<-done +
      <-done`. Does one `cancel()` stop both?
    example: F05-main
  - id: F05-explain
    type: explain
    text: >-
      This project combines channel ownership, cooperative cancellation and
      bounded work. Its goal checks that the program finishes within a step
      limit and that no worker goroutines are left over. A printed “done” alone
      does not prove that.
  - id: F05-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: GenericStepper
widget: GenericStepper
examples:
  - F05-main
pitfalls:
  - id: F05-pitfall
    title: 'Looks right, but…'
    claim: 'If the program prints its result, every worker must have shut down.'
    explanation: >-
      `main` can print and return while workers are still blocked on a channel.
      Check that each worker goroutine actually finished.
    example: F05-main
quiz:
  - id: F05-output
    type: predict-output
    question: What will this example print?
    example: F05-main
    answerFromEngine: true
  - id: F05-concept
    type: multiple-choice
    question: What must the cancellation goal inspect besides stdout?
    choices:
      - Whether the worker goroutines have exited
      - Only how quickly the page animates
    answer: Whether the worker goroutines have exited
    explanation: >-
      This project combines channel ownership, cooperative cancellation and
      bounded work. Its goal checks that the program finishes within a step
      limit and that no worker goroutines are left over. A printed “done” alone
      does not prove that.
  - id: F05-keyword
    type: fill-blank
    question: >-
      Fill the blank in this line:
      ctx,___:=context.WithCancel(context.Background())
    answer: cancel
    explanation: >-
      Look for cancel in the example. The project combines channel ownership,
      cooperative cancellation and bounded work. An engine-based goal checks
      completion within a step budget and the remaining model goroutines. A
      printed “done” alone is not that proof.
deeper:
  - source: u069
  - source: u072
  - source: u066
next: []
claims:
  - text: >-
      This project combines channel ownership, cooperative cancellation and
      bounded work. Its goal checks that the program finishes within a step
      limit and that no worker goroutines are left over. A printed “done” alone
      does not prove that.
    sources:
      - u069
      - u072
      - u066
    model: true
estimatedMinutes: 7
capstone:
  starter: |
    package main

    import ("fmt"; "context")

    func main() {
        ctx,cancel:=context.WithCancel(context.Background())
        done:=make(chan int)
        go func(){<-ctx.Done();done<-1}()
        _ = cancel;fmt.Println(<-done)
    }
  solution: F05-main
  goal:
    stdout: '1'
    exitStatus: 0
  hints:
    - Find the point where the worker is waiting.
    - The worker waits for the context Done channel to close.
    - Call cancel before waiting for the worker’s completion value.
try:
  task: >-
    Start a second worker with the same `go` line, and print `<-done + <-done`.
    Does one `cancel()` stop both?
  hint: 'Closing `Done()` wakes every goroutine waiting on it, not just one.'
  expect: ^2\s*$
  solution: |
    package main

    import ("fmt"; "context")

    func main() {
        ctx,cancel:=context.WithCancel(context.Background())
        done:=make(chan int)
        go func(){<-ctx.Done();done<-1}()
        go func(){<-ctx.Done();done<-1}()
        cancel();fmt.Println(<-done + <-done)
    }
stage: 0
---
Build a pipeline with a clear stop signal at every station. Cancel it and verify that no station is left waiting for a parcel that will never arrive.
