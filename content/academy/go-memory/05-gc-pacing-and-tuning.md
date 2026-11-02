---
id: B05
title: GC pacing and tuning
track: B
tier: P0
level: Core
prereqs:
  - B04
subtags:
  - memory/gc
  - memory/profile
sources:
  - u011
  - u014
  - u016
  - u021
  - u036
  - u042
bridge: false
goals:
  - 'Say what `SetGCPercent` trades: memory room against GC work'
  - 'Explain why a smaller budget can mean more GC work, not less'
  - Say why the program restores the old setting at the end
steps:
  - id: B05-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: B05-main
  - id: B05-try
    type: try
    text: >-
      Change `make([]byte, 32)` to `make([]byte, 64)` and `SetGCPercent(50)` to
      `SetGCPercent(200)`. Predict every printed line.
    example: B05-main
  - id: B05-explain
    type: explain
    text: >-
      The heap goal, GOGC and memory limit influence a trade-off between memory
      and collection effort. The displayed counts come from the simplified
      model, not a native benchmark. Use the source guide to decide when tuning
      is justified.
  - id: B05-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: HeapGoalGraph
widget: HeapGoalGraph
examples:
  - B05-main
pitfalls:
  - id: M17
    title: 'Looks right, but…'
    claim: The collector simply runs on a fixed timer.
    explanation: >-
      Collector pacing uses allocation and memory goals. This model exposes
      explicit GC calls and controls rather than claiming native timing.
    example: B05-main
quiz:
  - id: B05-output
    type: predict-output
    question: What will this example print?
    example: B05-main
    answerFromEngine: true
  - id: B05-concept
    type: multiple-choice
    question: Does a smaller memory budget guarantee a faster program?
    choices:
      - 'No, it can require more collection effort'
      - 'Yes, less memory always means less CPU work'
    answer: 'No, it can require more collection effort'
    explanation: >-
      The heap goal, GOGC and memory limit influence a trade-off between memory
      and collection effort. The displayed counts come from the simplified
      model, not a native benchmark. Use the source guide to decide when tuning
      is justified.
  - id: B05-keyword
    type: fill-blank
    question: 'Fill the blank in this line: previous := debug.___(50)'
    answer: SetGCPercent
    explanation: >-
      Look for SetGCPercent in the example. The heap goal, GOGC and memory limit
      influence a trade-off between memory and collection effort. The displayed
      counts come from the simplified model, not a native benchmark. Use the
      source guide to decide when tuning is justified.
deeper:
  - source: u011
  - source: u014
  - source: u016
  - source: u021
  - source: u036
  - source: u042
next:
  - B06
claims:
  - text: >-
      The heap goal, GOGC and memory limit influence a trade-off between memory
      and collection effort. The displayed counts come from the simplified
      model, not a native benchmark. Use the source guide to decide when tuning
      is justified.
    sources:
      - u011
      - u014
      - u016
      - u021
      - u036
      - u042
    model: true
estimatedMinutes: 7
try:
  task: >-
    Change `make([]byte, 32)` to `make([]byte, 64)` and `SetGCPercent(50)` to
    `SetGCPercent(200)`. Predict every printed line.
  hint: 'The GC setting changes when collection runs, not what your program computes.'
  expect: ^64\s+64\s+64\s+64\s*$
  solution: |
    package main

    import ("fmt"; "runtime"; "runtime/debug")

    func main() {
        previous := debug.SetGCPercent(200)
        for i := 0; i < 4; i++ { data := make([]byte, 64); fmt.Println(len(data)) }
        runtime.GC()
        debug.SetGCPercent(previous)
    }
stage: 1
---
GC tuning is a budget dial, not a faster-cleanup button. Run the same allocation pattern under different model settings and compare memory room with collection work.
