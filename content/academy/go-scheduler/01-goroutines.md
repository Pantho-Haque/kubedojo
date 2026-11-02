---
id: C01
title: Goroutines
track: C
tier: P0
level: Core
prereqs:
  - A06
  - A15
subtags:
  - conc/patterns
  - sched/overview
sources:
  - u048
  - u049
  - u050
  - u053
  - u054
  - u071
bridge: false
goals:
  - Count the goroutine lanes on the stage while the loop runs
  - Say what `wg.Wait()` does for `main`
  - Predict what might print if you delete `wg.Wait()`
steps:
  - id: C01-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: C01-main
  - id: C01-try
    type: try
    text: >-
      Start four goroutines instead of three: change `wg.Add(3)` to `wg.Add(4)`
      and `i <= 3` to `i <= 4`.
    example: C01-main
  - id: C01-explain
    type: explain
    text: >-
      The go statement starts concurrent work. Main returning ends the program,
      even if other goroutines have not finished. WaitGroup coordinates
      completion; adding more goroutines is not itself a performance guarantee.
  - id: C01-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: GoroutineLifecycle
widget: GoroutineLifecycle
examples:
  - C01-main
pitfalls:
  - id: M18
    title: 'Looks right, but…'
    claim: One goroutine is one operating-system thread.
    explanation: >-
      The runtime schedules goroutines over threads and processor contexts. Many
      goroutines can share the same thread over time.
    example: C01-main
  - id: M19
    title: 'Looks right, but…'
    claim: More goroutines always finish work faster.
    explanation: >-
      Goroutines add scheduling and coordination work. Concurrency can help a
      suitable task; it does not guarantee more CPU capacity or less elapsed
      time.
    example: C03-main
quiz:
  - id: C01-output
    type: predict-output
    question: What will this example print?
    example: C01-main
    answerFromEngine: true
  - id: C01-concept
    type: multiple-choice
    question: Does main returning wait for every goroutine automatically?
    choices:
      - 'No, the program ends'
      - 'Yes, all goroutines always finish first'
    answer: 'No, the program ends'
    explanation: >-
      The go statement starts concurrent work. Main returning ends the program,
      even if other goroutines have not finished. WaitGroup coordinates
      completion; adding more goroutines is not itself a performance guarantee.
  - id: C01-keyword
    type: fill-blank
    question: >-
      Fill the blank in this line: for i := 1; i <= 3; i++ { ___ func(n int) {
      fmt.Println(n); wg.Done() }(i) }
    answer: go
    explanation: >-
      Look for go in the example. The go statement starts concurrent work. Main
      returning ends the program, even if other goroutines have not finished.
      WaitGroup coordinates completion; adding more goroutines is not itself a
      performance guarantee.
deeper:
  - source: u048
  - source: u049
  - source: u050
  - source: u053
  - source: u054
  - source: u071
next:
  - C02
claims:
  - text: >-
      The go statement starts concurrent work. Main returning ends the program,
      even if other goroutines have not finished. WaitGroup coordinates
      completion; adding more goroutines is not itself a performance guarantee.
    sources:
      - u048
      - u049
      - u050
      - u053
      - u054
      - u071
    model: false
estimatedMinutes: 7
try:
  task: >-
    Start four goroutines instead of three: change `wg.Add(3)` to `wg.Add(4)`
    and `i <= 3` to `i <= 4`.
  hint: >-
    The `Add` count must match the number of goroutines that call `Done`, or
    `Wait` never returns.
  expect: \b4\b
  solution: |
    package main

    import ("fmt"; "sync")

    func main() {
        var wg sync.WaitGroup
        wg.Add(4)
        for i := 1; i <= 4; i++ { go func(n int) { fmt.Println(n); wg.Done() }(i) }
        wg.Wait()
    }
stage: 0
---
Goroutines are separate jobs, not a promise of one desk per job. Let three jobs finish, and compare that with main returning before it waits.
