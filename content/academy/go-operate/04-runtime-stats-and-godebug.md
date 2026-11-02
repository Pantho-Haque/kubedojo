---
id: E04
title: Runtime stats and GODEBUG
track: E
tier: P2
level: Advanced
prereqs:
  - B05
  - E01
subtags:
  - memory/gc
  - memory/profile
  - sched/trace
sources:
  - u018
  - u033
  - u036
  - u056
bridge: false
goals:
  - Say what `Alloc` and `TotalAlloc` each count
  - Explain why they are equal here but drift apart later
  - Predict which of the two numbers can drop after a GC
steps:
  - id: E04-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: E04-main
  - id: E04-try
    type: try
    text: >-
      Before `data:=make([]byte,24)`, add `for i:=0; i<3; i++ { _ = make([]byte,
      24) }` and `runtime.GC()`. Which number is bigger now, `Alloc` or
      `TotalAlloc`?
    example: E04-main
  - id: E04-explain
    type: explain
    text: >-
      `ReadMemStats` fills in some of the fields real Go reports, using gothik's
      model numbers. Compare memory still in use with the running total, and
      match collection events to the GC view. These are not real heap
      measurements, and gothik does not read `GODEBUG` settings.
  - id: E04-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: GCTraceDecoder
widget: GCTraceDecoder
examples:
  - E04-main
pitfalls:
  - id: E04-pitfall
    title: 'Looks right, but…'
    claim: >-
      `Alloc` and `TotalAlloc` are two names for how much memory the program is
      using right now.
    explanation: >-
      `Alloc` counts memory still in use; `TotalAlloc` adds up every allocation
      ever made and never goes down. Once the GC frees something, they drift
      apart.
    example: E04-main
quiz:
  - id: E04-output
    type: predict-output
    question: What will this example print?
    example: E04-main
    answerFromEngine: true
  - id: E04-concept
    type: multiple-choice
    question: Are live bytes and total allocated bytes interchangeable?
    choices:
      - 'No, they measure different things'
      - 'Yes, both always describe current live memory'
    answer: 'No, they measure different things'
    explanation: >-
      `ReadMemStats` fills in some of the fields real Go reports, using gothik's
      model numbers. Compare memory still in use with the running total, and
      match collection events to the GC view. These are not real heap
      measurements, and gothik does not read `GODEBUG` settings.
  - id: E04-keyword
    type: fill-blank
    question: >-
      Fill the blank in this line: fmt.Println(len(data), stats.Alloc,
      stats.___)
    answer: TotalAlloc
    explanation: >-
      Look for TotalAlloc in the example. ReadMemStats returns a labeled subset
      of logical model counters. Compare retained bytes with cumulative
      requests, and connect collection events to the fields shown in the GC
      view. These values are not native heap measurements or
      environment-variable controls.
deeper:
  - source: u018
  - source: u033
  - source: u036
  - source: u056
next:
  - E05
claims:
  - text: >-
      `ReadMemStats` fills in some of the fields real Go reports, using gothik's
      model numbers. Compare memory still in use with the running total, and
      match collection events to the GC view. These are not real heap
      measurements, and gothik does not read `GODEBUG` settings.
    sources:
      - u018
      - u033
      - u036
      - u056
    model: true
estimatedMinutes: 7
try:
  task: >-
    Before `data:=make([]byte,24)`, add `for i:=0; i<3; i++ { _ = make([]byte,
    24) }` and `runtime.GC()`. Which number is bigger now, `Alloc` or
    `TotalAlloc`?
  hint: >-
    The GC frees the three throwaway buffers, so `Alloc` drops; `TotalAlloc`
    only ever goes up.
  expect: ^24 (\d+) (?!\1\s)\d+
  solution: |
    package main

    import ("fmt"; "runtime")

    func main() {
        var stats runtime.MemStats
        for i:=0; i<3; i++ { _ = make([]byte, 24) }
        runtime.GC()
        data:=make([]byte,24)
        runtime.ReadMemStats(&stats)
        fmt.Println(len(data), stats.Alloc, stats.TotalAlloc)
    }
stage: 1
---
Runtime statistics are labeled gauges on the same machine. Read the units and distinguish a live amount from a total that only increases.
