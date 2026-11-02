---
id: E05
title: Benchmarks and allocations
track: E
tier: P2
level: Advanced
prereqs:
  - B02
  - B03
subtags:
  - memory/escape
  - memory/profile
sources:
  - u010
  - u033
  - u028
bridge: false
goals:
  - Say what "allocations per operation" means for this loop
  - Explain why the count is 3 for three loop turns
  - Cut allocations by reusing one slice without changing the output
steps:
  - id: E05-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: E05-main
  - id: E05-try
    type: try
    text: >-
      Move `data:=make([]int,4)` out of the loop, just above it, so every turn
      reuses one slice. What does the allocation count drop to?
    example: E05-main
  - id: E05-explain
    type: explain
    text: >-
      Read the allocation counters before and after a repeated piece of work.
      The running total and the memory still in use answer different questions.
      gothik does not time real benchmarks and cannot tell you whether an
      optimization is worth it.
  - id: E05-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: AllocsPerOpMeter
widget: AllocsPerOpMeter
examples:
  - E05-main
pitfalls:
  - id: E05-pitfall
    title: 'Looks right, but…'
    claim: >-
      Fewer allocations always make a program faster, so any change that cuts
      them is worth it.
    explanation: >-
      Allocations are one cost among many. Measure the same unit of work before
      and after, and keep a change only if it helps and the result stays
      correct.
    example: E05-main
quiz:
  - id: E05-output
    type: predict-output
    question: What will this example print?
    example: E05-main
    answerFromEngine: true
  - id: E05-concept
    type: multiple-choice
    question: What must stay comparable when measuring allocations per operation?
    choices:
      - The unit of work
      - Only the variable names
    answer: The unit of work
    explanation: >-
      Read the allocation counters before and after a repeated piece of work.
      The running total and the memory still in use answer different questions.
      gothik does not time real benchmarks and cannot tell you whether an
      optimization is worth it.
  - id: E05-keyword
    type: fill-blank
    question: 'Fill the blank in this line: runtime.___(&before)'
    answer: ReadMemStats
    explanation: >-
      Look for ReadMemStats in the example. Compare model allocation counters
      before and after a repeated operation. Cumulative requests and retained
      bytes answer different questions. The generic replay does not measure
      native benchmark time or automatically infer that an optimization is
      worthwhile.
deeper:
  - source: u010
  - source: u033
  - source: u028
next:
  - E06
claims:
  - text: >-
      Read the allocation counters before and after a repeated piece of work.
      The running total and the memory still in use answer different questions.
      gothik does not time real benchmarks and cannot tell you whether an
      optimization is worth it.
    sources:
      - u010
      - u033
      - u028
    model: true
estimatedMinutes: 7
try:
  task: >-
    Move `data:=make([]int,4)` out of the loop, just above it, so every turn
    reuses one slice. What does the allocation count drop to?
  hint: >-
    The printed lengths stay the same; only one `make` runs between the two
    `ReadMemStats` calls.
  expect: \n1\s*$
  solution: |
    package main

    import ("fmt"; "runtime")

    func main() {
        var before, after runtime.MemStats
        runtime.ReadMemStats(&before)
        data:=make([]int,4)
        for i:=0; i<3; i++ { fmt.Println(len(data)) }
        runtime.ReadMemStats(&after)
        fmt.Println(after.Mallocs-before.Mallocs)
    }
stage: 2
---
A benchmark is a repeated experiment with a clearly stated ruler. Count allocations for the same unit of work before comparing two implementations.
