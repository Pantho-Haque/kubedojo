---
id: D07
title: Concurrency bug clinic
track: D
tier: P1
level: Extended
prereqs:
  - D03
  - D04
  - D06
subtags:
  - conc/model
  - conc/patterns
  - conc/sync
  - syntax/control
sources:
  - u067
  - u066
  - u073
  - u095
bridge: false
goals:
  - Say why `wg.Add(1)` comes before the `go` line
  - Explain how `defer wg.Done()` covers every way out of the goroutine
  - Predict what happens if `Add` and the number of goroutines disagree
steps:
  - id: D07-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: D07-main
  - id: D07-try
    type: try
    text: >-
      Start a second worker that prints `also finished`. Change `wg.Add(1)` to
      `wg.Add(2)` and add its own `go` line.
    example: D07-main
  - id: D07-explain
    type: explain
    text: >-
      Call `wg.Add` before starting a goroutine, and make sure `Done` runs on
      every way out of it. This example uses `defer` to make that rule easy to
      see. The linked misconception cards cover copied locks and late `Add`
      calls, and the race and completion reports show what happened in this run.
  - id: D07-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: GenericStepper
widget: GenericStepper
examples:
  - D07-main
pitfalls:
  - id: M22
    title: 'Looks right, but…'
    claim: A mutex can be copied after use.
    explanation: >-
      A synchronization value must not be copied after first use. Keep a shared
      mutex at a stable address and pass a pointer when needed.
    example: D03-main
  - id: M23
    title: 'Looks right, but…'
    claim: WaitGroup.Add is safe inside every new goroutine.
    explanation: >-
      Register work before starting a goroutine when Wait might otherwise
      observe zero. Add inside the goroutine can occur too late.
    example: D07-main
quiz:
  - id: D07-output
    type: predict-output
    question: What will this example print?
    example: D07-main
    answerFromEngine: true
  - id: D07-concept
    type: multiple-choice
    question: Where should the completion count be added for newly launched work?
    choices:
      - Before launching that goroutine
      - Inside it after it starts running
    answer: Before launching that goroutine
    explanation: >-
      Call `wg.Add` before starting a goroutine, and make sure `Done` runs on
      every way out of it. This example uses `defer` to make that rule easy to
      see. The linked misconception cards cover copied locks and late `Add`
      calls, and the race and completion reports show what happened in this run.
  - id: D07-keyword
    type: fill-blank
    question: >-
      Fill the blank in this line: go func(){ defer wg.___();
      fmt.Println("finished") }()
    answer: Done
    explanation: >-
      Look for Done in the example. Register work before starting goroutines,
      and arrange for Done to run on every return path. This example uses defer
      to make that rule visible. The linked misconception cards explain copied
      locks and late Add calls; race and completion reports provide evidence for
      the recorded run.
deeper:
  - source: u067
  - source: u066
  - source: u073
  - source: u095
next:
  - E01
claims:
  - text: >-
      Call `wg.Add` before starting a goroutine, and make sure `Done` runs on
      every way out of it. This example uses `defer` to make that rule easy to
      see. The linked misconception cards cover copied locks and late `Add`
      calls, and the race and completion reports show what happened in this run.
    sources:
      - u067
      - u066
      - u073
      - u095
    model: true
estimatedMinutes: 7
try:
  task: >-
    Start a second worker that prints `also finished`. Change `wg.Add(1)` to
    `wg.Add(2)` and add its own `go` line.
  hint: 'Copy the `go` line, change the text, and keep `defer wg.Done()` in both.'
  expect: also finished
  solution: |
    package main

    import ("fmt"; "sync")

    func main() {
        var wg sync.WaitGroup
        wg.Add(2)
        go func(){ defer wg.Done(); fmt.Println("finished") }()
        go func(){ defer wg.Done(); fmt.Println("also finished") }()
        wg.Wait()
    }
stage: 2
---
Debugging concurrency is finding a broken traffic rule, not guessing the fastest car. Inspect blocked tasks and conflicting accesses, then change the rule and rerun the check.
