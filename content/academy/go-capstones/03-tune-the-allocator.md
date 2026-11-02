---
id: F03
title: Tune the allocator
track: F
tier: P1
level: Extended
prereqs: []
subtags:
  - memory/allocator
  - memory/escape
sources:
  - u001
  - u008
  - u010
bridge: false
goals:
  - 'Say why `make([]int,0,8)` avoids extra allocations'
  - Count the backing arrays that appear when `append` runs out of room
  - Keep the output the same while cutting allocations
steps:
  - id: F03-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: F03-main
  - id: F03-try
    type: try
    text: >-
      Change the loop to `i<10` but keep `make([]int,0,8)`. Predict `len`, then
      count the backing arrays on the stage.
    example: F03-main
  - id: F03-explain
    type: explain
    text: >-
      The project measures the model’s allocation activity before and after
      preallocation. Its goal concerns allocation behavior, not native speed.
      Explain the remaining aliases and capacities as well as the final result.
  - id: F03-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: GenericStepper
widget: GenericStepper
examples:
  - F03-main
pitfalls:
  - id: F03-pitfall
    title: 'Looks right, but…'
    claim: >-
      If a change cuts allocations, it is fine even if the output changes a
      little.
    explanation: >-
      A faster program that gives a different answer is a broken program. Check
      the result first, then compare allocation counts.
    example: F03-main
quiz:
  - id: F03-output
    type: predict-output
    question: What will this example print?
    example: F03-main
    answerFromEngine: true
  - id: F03-concept
    type: multiple-choice
    question: What must a successful optimization preserve?
    choices:
      - The program’s intended result
      - Only a smaller code file
    answer: The program’s intended result
    explanation: >-
      The project measures the model’s allocation activity before and after
      preallocation. Its goal concerns allocation behavior, not native speed.
      Explain the remaining aliases and capacities as well as the final result.
  - id: F03-keyword
    type: fill-blank
    question: 'Fill the blank in this line: values:=___([]int,0,8)'
    answer: make
    explanation: >-
      Look for make in the example. The project measures the model’s allocation
      activity before and after preallocation. Its goal concerns allocation
      behavior, not native speed. Explain the remaining aliases and capacities
      as well as the final result.
deeper:
  - source: u001
  - source: u008
  - source: u010
next:
  - F04
claims:
  - text: >-
      The project measures the model’s allocation activity before and after
      preallocation. Its goal concerns allocation behavior, not native speed.
      Explain the remaining aliases and capacities as well as the final result.
    sources:
      - u001
      - u008
      - u010
    model: true
estimatedMinutes: 7
capstone:
  starter: |
    package main

    import "fmt"

    func main() {
        values:=make([]int,0)
        for i:=0;i<8;i++ {values=append(values,i)}
        fmt.Println(len(values),cap(values))
    }
  solution: F03-main
  goal:
    stdout: 8 8
    exitStatus: 0
    maxModelAllocations: 1
  hints:
    - Compare logical storage request counts with the reference run.
    - Repeated growth can request new backing storage in this model.
    - >-
      Create a zero-length slice with capacity for all eight values before
      appending.
try:
  task: >-
    Change the loop to `i<10` but keep `make([]int,0,8)`. Predict `len`, then
    count the backing arrays on the stage.
  hint: >-
    Appending past capacity 8 makes `append` copy everything to a bigger array.
    How much bigger is a runtime detail, so don't bet on an exact `cap`.
  expect: ^10 \d+\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        values:=make([]int,0,8)
        for i:=0;i<10;i++ {values=append(values,i)}
        fmt.Println(len(values),cap(values))
    }
stage: 0
---
Tune a packing line by preparing enough space before work starts. Compare allocation counts for equal work and keep the smaller number without changing the answer.
