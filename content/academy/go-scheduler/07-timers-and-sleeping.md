---
id: C07
title: Timers and sleeping
track: C
tier: P2
level: Advanced
prereqs:
  - C03
subtags:
  - memory/profile
  - sched/overview
sources:
  - u033
  - u049
bridge: false
goals:
  - Say what `time.Sleep` does to the goroutine that calls it
  - Explain why this simulation prints exactly 5
  - Read the virtual clock before and after the sleep
steps:
  - id: C07-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: C07-main
  - id: C07-try
    type: try
    text: >-
      Change `5*time.Millisecond` to `12*time.Millisecond`. Predict the printed
      number.
    example: C07-main
  - id: C07-explain
    type: explain
    text: >-
      The clock here is simulated and only moves inside gothik. Sleeping parks
      the calling goroutine until its wake-up time. Treat timer and ticker
      examples as simplified pictures, not exact diagrams of Go's timer code.
  - id: C07-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: TimerWheelView
widget: TimerWheelView
examples:
  - C07-main
pitfalls:
  - id: C07-pitfall
    title: 'Looks right, but…'
    claim: '`time.Sleep` keeps the CPU busy in a loop until the time is up.'
    explanation: >-
      Sleeping parks the goroutine, so it uses no CPU while it waits. A timer
      wakes it once the time has passed.
    example: C07-main
quiz:
  - id: C07-output
    type: predict-output
    question: What will this example print?
    example: C07-main
    answerFromEngine: true
  - id: C07-concept
    type: multiple-choice
    question: Does Sleep need to busy-wait in the simulation?
    choices:
      - 'No, the goroutine can be parked'
      - 'Yes, waiting must run an empty loop'
    answer: 'No, the goroutine can be parked'
    explanation: >-
      The clock here is simulated and only moves inside gothik. Sleeping parks
      the calling goroutine until its wake-up time. Treat timer and ticker
      examples as simplified pictures, not exact diagrams of Go's timer code.
  - id: C07-keyword
    type: fill-blank
    question: 'Fill the blank in this line: fmt.Println(time.___(start).Milliseconds())'
    answer: Since
    explanation: >-
      Look for Since in the example. The teaching clock advances only inside the
      simulation. Sleeping parks the calling goroutine. Timer and ticker
      examples must be read with the corpus coverage note rather than treated as
      exact timer implementation diagrams.
deeper:
  - source: u033
  - source: u049
next:
  - D01
claims:
  - text: >-
      The clock here is simulated and only moves inside gothik. Sleeping parks
      the calling goroutine until its wake-up time. Treat timer and ticker
      examples as simplified pictures, not exact diagrams of Go's timer code.
    sources:
      - u033
      - u049
    model: false
estimatedMinutes: 7
try:
  task: >-
    Change `5*time.Millisecond` to `12*time.Millisecond`. Predict the printed
    number.
  hint: The simulated clock jumps ahead by exactly the sleep time.
  expect: ^12\s*$
  solution: |
    package main

    import ("fmt"; "time")

    func main() {
        start := time.Now()
        time.Sleep(12*time.Millisecond)
        fmt.Println(time.Since(start).Milliseconds())
    }
stage: 2
---
A timer is an alarm attached to a waiting job. Advance virtual time, wake the job, and stop a repeating alarm when its work is finished.
