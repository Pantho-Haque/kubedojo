---
id: E02
title: Profiling
track: E
tier: P1
level: Extended
prereqs:
  - B03
  - E01
subtags:
  - memory/profile
sources:
  - u028
  - u034
  - u037
bridge: false
goals:
  - Say the difference between in-use memory and total allocated memory
  - Explain why `Mallocs` keeps counting after old buffers are unused
  - Predict how the loop count changes the allocation total
steps:
  - id: E02-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: E02-main
  - id: E02-try
    type: try
    text: >-
      Change the loop to run 5 times (`i<5`). Predict the new `Mallocs` number
      before you run.
    example: E02-main
  - id: E02-explain
    type: explain
    text: >-
      In-use memory and total allocated memory answer different questions.
      gothik's profile groups allocations by the line that made them, so you can
      compare what is still held with everything ever allocated. It is a
      simplified model, not Go's real sampling profiler or a benchmark.
  - id: E02-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: ProfileFlameGraph
widget: ProfileFlameGraph
examples:
  - E02-main
pitfalls:
  - id: M24
    title: 'Looks right, but…'
    claim: Every heap profile reports the same allocation total.
    explanation: >-
      Choose the sample type: inuse_space and inuse_objects describe retained
      allocations; alloc_space and alloc_objects describe cumulative allocation.
      A profile’s meaning depends on that choice.
    example: E02-main
quiz:
  - id: E02-output
    type: predict-output
    question: What will this example print?
    example: E02-main
    answerFromEngine: true
  - id: E02-concept
    type: multiple-choice
    question: Does cumulative allocated space mean only live objects?
    choices:
      - 'No, it includes allocation activity beyond current live storage'
      - 'Yes, it is another name for live heap'
    answer: 'No, it includes allocation activity beyond current live storage'
    explanation: >-
      In-use memory and total allocated memory answer different questions.
      gothik's profile groups allocations by the line that made them, so you can
      compare what is still held with everything ever allocated. It is a
      simplified model, not Go's real sampling profiler or a benchmark.
  - id: E02-keyword
    type: fill-blank
    question: 'Fill the blank in this line: fmt.Println(stats.___)'
    answer: Mallocs
    explanation: >-
      Look for Mallocs in the example. In-use and cumulative allocated samples
      answer different questions. The teaching profile groups observations by
      allocation site and lets you compare retained storage with allocation
      activity. It is not a native sampling profile or benchmark.
deeper:
  - source: u028
  - source: u034
  - source: u037
next:
  - E03
claims:
  - text: >-
      In-use memory and total allocated memory answer different questions.
      gothik's profile groups allocations by the line that made them, so you can
      compare what is still held with everything ever allocated. It is a
      simplified model, not Go's real sampling profiler or a benchmark.
    sources:
      - u028
      - u034
      - u037
    model: false
estimatedMinutes: 7
try:
  task: >-
    Change the loop to run 5 times (`i<5`). Predict the new `Mallocs` number
    before you run.
  hint: 'Each turn allocates one new 16-byte buffer, and `Mallocs` never goes down.'
  expect: \n7\s*$
  solution: |
    package main

    import ("fmt"; "runtime")

    func main() {
        var stats runtime.MemStats
        for i:=0; i<5; i++ { data:=make([]byte,16); fmt.Println(len(data)) }
        runtime.ReadMemStats(&stats)
        fmt.Println(stats.Mallocs)
    }
stage: 0
---
An allocation profile is a receipt book with different totals. Compare what remains in use with what has been allocated over the whole run.
