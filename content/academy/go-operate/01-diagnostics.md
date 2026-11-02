---
id: E01
title: Diagnostics
track: E
tier: P1
level: Extended
prereqs:
  - B04
  - C03
subtags:
  - sched/tools
  - sched/trace
sources:
  - u059
  - u065
bridge: false
goals:
  - Write down a specific question before picking a tool
  - Say what a profile shows and what a trace shows
  - 'Use `len` and `cap` as your first, cheapest evidence'
steps:
  - id: E01-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: E01-main
  - id: E01-try
    type: try
    text: >-
      Change `make([]int, 4)` to `make([]int, 4, 10)`. Predict both numbers, and
      check the heap object's size.
    example: E01-main
  - id: E01-explain
    type: explain
    text: >-
      Profiles summarize selected measurements, while a trace records events
      over time. Their overhead and sample meanings differ. The model’s
      observations describe the simulated run, not native operating-system
      behavior.
  - id: E01-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: ToolChooser
widget: ToolChooser
examples:
  - E01-main
pitfalls:
  - id: E01-pitfall
    title: 'Looks right, but…'
    claim: Turn on every profiler at once and the problem will show itself.
    explanation: >-
      Each tool answers a different question, and extra data can bury the clue.
      Decide what you want to know first, then pick the tool that measures it.
    example: E01-main
quiz:
  - id: E01-output
    type: predict-output
    question: What will this example print?
    example: E01-main
    answerFromEngine: true
  - id: E01-concept
    type: multiple-choice
    question: What should come before picking a diagnostic tool?
    choices:
      - A specific question
      - An assumption about the answer
    answer: A specific question
    explanation: >-
      Profiles summarize selected measurements, while a trace records events
      over time. Their overhead and sample meanings differ. The model’s
      observations describe the simulated run, not native operating-system
      behavior.
  - id: E01-keyword
    type: fill-blank
    question: 'Fill the blank in this line: data := ___([]int, 4)'
    answer: make
    explanation: >-
      Look for make in the example. Profiles summarize selected measurements,
      while a trace records events over time. Their overhead and sample meanings
      differ. The model’s observations describe the simulated run, not native
      operating-system behavior.
deeper:
  - source: u059
  - source: u065
next:
  - E02
claims:
  - text: >-
      Profiles summarize selected measurements, while a trace records events
      over time. Their overhead and sample meanings differ. The model’s
      observations describe the simulated run, not native operating-system
      behavior.
    sources:
      - u059
      - u065
    model: true
estimatedMinutes: 7
try:
  task: >-
    Change `make([]int, 4)` to `make([]int, 4, 10)`. Predict both numbers, and
    check the heap object's size.
  hint: 'The third argument sets capacity: room for 10 ints, with 4 in use.'
  expect: ^4 10\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        data := make([]int, 4, 10)
        fmt.Println(len(data), cap(data))
    }
stage: 0
---
Diagnostics are different lenses, not one magic magnifying glass. Write the question you want answered, then choose a lens that can show that evidence.
