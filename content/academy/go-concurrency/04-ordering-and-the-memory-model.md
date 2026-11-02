---
id: D04
title: Ordering and the memory model
track: D
tier: P1
level: Extended
prereqs:
  - D03
subtags:
  - conc/model
  - conc/patterns
sources:
  - u066
  - u073
bridge: false
goals:
  - Point to the two goroutines that write `x` with nothing ordering them
  - Explain why getting 2 on one run does not prove the code is safe
  - Add a mutex so the writes happen one at a time
steps:
  - id: D04-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: D04-main
  - id: D04-try
    type: try
    text: >-
      Fix the race with a `sync.Mutex` around `x++`, then run it with three
      goroutines. The answer must be 3, with no race reported.
    example: D04-main
  - id: D04-explain
    type: explain
    text: >-
      A data race happens when two goroutines touch the same variable, at least
      one of them writes, and nothing orders them. gothik's race checker follows
      happens-before links, so a run that looks the same every time can still
      contain a race. Fix it with synchronization that creates an ordering, not
      with a delay.
  - id: D04-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: HappensBeforeGraph
widget: HappensBeforeGraph
examples:
  - D04-main
pitfalls:
  - id: D04-pitfall
    title: 'Looks right, but…'
    claim: >-
      If a program prints the right answer every time I run it, it has no data
      race.
    explanation: >-
      A race is about missing synchronization, not about the output you saw.
      Another schedule, machine or load can expose it later.
    example: D04-main
quiz:
  - id: D04-output
    type: predict-output
    question: What will this example print?
    example: D04-main
    answerFromEngine: true
  - id: D04-concept
    type: multiple-choice
    question: Does one repeatable output prove the program has no data race?
    choices:
      - 'No, a fixed schedule is not a synchronization proof'
      - 'Yes, repeatability proves safety'
    answer: 'No, a fixed schedule is not a synchronization proof'
    explanation: >-
      A data race happens when two goroutines touch the same variable, at least
      one of them writes, and nothing orders them. gothik's race checker follows
      happens-before links, so a run that looks the same every time can still
      contain a race. Fix it with synchronization that creates an ordering, not
      with a delay.
  - id: D04-keyword
    type: fill-blank
    question: 'Fill the blank in this line: wg.Wait(); ___(x)'
    answer: fmt.Println
    explanation: >-
      Look for channel in the example. A data race involves conflicting accesses
      without the required synchronization. The teaching detector follows
      happens-before relationships; a deterministic replay can still contain a
      race. Add synchronization to establish an edge, not merely a delay.
deeper:
  - source: u066
  - source: u073
next:
  - D05
claims:
  - text: >-
      A data race happens when two goroutines touch the same variable, at least
      one of them writes, and nothing orders them. gothik's race checker follows
      happens-before links, so a run that looks the same every time can still
      contain a race. Fix it with synchronization that creates an ordering, not
      with a delay.
    sources:
      - u066
      - u073
    model: false
estimatedMinutes: 7
try:
  task: >-
    Fix the race with a `sync.Mutex` around `x++`, then run it with three
    goroutines. The answer must be 3, with no race reported.
  hint: >-
    Declare `var mu sync.Mutex`, wrap `x++` in `mu.Lock()` and `mu.Unlock()`,
    and remember `wg.Add(3)`.
  expect: ^3\s*$
  solution: |
    package main

    import ("fmt"; "sync")

    func main() {
        var mu sync.Mutex; var wg sync.WaitGroup; wg.Add(3)
        x := 0
        for i := 0; i < 3; i++ { go func(){ mu.Lock(); x++; mu.Unlock(); wg.Done() }() }
        wg.Wait(); fmt.Println(x)
    }
stage: 1
---
A happens-before edge is a receipt proving one event came before another. Look for a receipt rather than treating one animation’s order as a guarantee.
