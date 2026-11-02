---
id: C04
title: Run queues and work stealing
track: C
tier: P1
level: Extended
prereqs:
  - C03
subtags:
  - sched/overview
sources:
  - u048
  - u049
  - u054
bridge: false
goals:
  - Say the difference between runnable and running
  - Watch which goroutine gets the next turn when one finishes
  - Explain why real Go does not promise this print order
steps:
  - id: C04-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: C04-main
  - id: C04-try
    type: try
    text: >-
      Start six goroutines instead of four: change `wg.Add(4)` to `wg.Add(6)`
      and `i < 4` to `i < 6`.
    example: C04-main
  - id: C04-explain
    type: explain
    text: >-
      The Go runtime keeps runnable goroutines in local and global queues, and
      an idle processor can steal work from another processor's queue. gothik
      shows one simple ready queue instead of the real algorithm. The scheduler
      source in the reading connects what you see here to those mechanisms.
  - id: C04-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: RunQueueStealing
widget: RunQueueStealing
examples:
  - C04-main
pitfalls:
  - id: C04-pitfall
    title: 'Looks right, but…'
    claim: A goroutine starts running the moment the `go` statement executes.
    explanation: >-
      `go` only makes the goroutine ready to run. It runs when the scheduler
      gives it a turn, which may be later.
    example: C04-main
quiz:
  - id: C04-output
    type: predict-output
    question: What will this example print?
    example: C04-main
    answerFromEngine: true
  - id: C04-concept
    type: multiple-choice
    question: Does runnable mean the task is currently executing?
    choices:
      - 'No, it is eligible to be scheduled'
      - 'Yes, runnable and running are identical'
    answer: 'No, it is eligible to be scheduled'
    explanation: >-
      The Go runtime keeps runnable goroutines in local and global queues, and
      an idle processor can steal work from another processor's queue. gothik
      shows one simple ready queue instead of the real algorithm. The scheduler
      source in the reading connects what you see here to those mechanisms.
  - id: C04-keyword
    type: fill-blank
    question: 'Fill the blank in this line: var wg sync.___'
    answer: WaitGroup
    explanation: >-
      Look for WaitGroup in the example. The runtime uses local and global
      queues, runnext and work stealing to find runnable work. This replay
      exposes a cooperative ready queue rather than reproducing the native queue
      algorithm. Use the captured scheduler source to connect the recorded
      states to those mechanisms.
deeper:
  - source: u048
  - source: u049
  - source: u054
next:
  - C05
claims:
  - text: >-
      The Go runtime keeps runnable goroutines in local and global queues, and
      an idle processor can steal work from another processor's queue. gothik
      shows one simple ready queue instead of the real algorithm. The scheduler
      source in the reading connects what you see here to those mechanisms.
    sources:
      - u048
      - u049
      - u054
    model: true
estimatedMinutes: 7
try:
  task: >-
    Start six goroutines instead of four: change `wg.Add(4)` to `wg.Add(6)` and
    `i < 4` to `i < 6`.
  hint: More runnable goroutines just means a longer line waiting for a turn.
  expect: \b5\b
  solution: |
    package main

    import ("fmt"; "sync")

    func main() {
        var wg sync.WaitGroup
        wg.Add(6)
        for i := 0; i < 6; i++ { go func(n int) { fmt.Println(n); wg.Done() }(i) }
        wg.Wait()
    }
stage: 1
---
An idle worker can look for tasks on another workbench. Step through ready queues before deciding whether idle means there is no work anywhere.
