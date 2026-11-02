---
id: B01
title: Stacks
track: B
tier: P0
level: Core
prereqs:
  - A06
subtags:
  - memory/stack
sources:
  - u038
  - u039
  - u040
  - u041
bridge: false
goals:
  - Count how many `sum` frames are on the stack at the deepest point
  - Explain why each `sum` frame has its own `n`
  - Say in what order the frames leave the stack
steps:
  - id: B01-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: B01-main
  - id: B01-try
    type: try
    text: >-
      Change `sum(4)` to `sum(6)`. Before running, predict the total and how
      many `sum` frames will stack up.
    example: B01-main
  - id: B01-explain
    type: explain
    text: >-
      A frame keeps one call's parameters and local values separate from every
      other call. Step through the calls and returns here. Real Go stacks can
      also grow and move; the reading covers that, and this view does not
      simulate it.
  - id: B01-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: StackGrowthViewer
widget: StackGrowthViewer
examples:
  - B01-main
pitfalls:
  - id: B01-pitfall
    title: 'Looks right, but…'
    claim: >-
      A recursive function reuses one frame, so each new call overwrites the
      previous `n`.
    explanation: >-
      Every call gets a fresh frame with its own `n`. The earlier frames wait
      underneath and carry on as each call returns.
    example: B01-main
quiz:
  - id: B01-output
    type: predict-output
    question: What will this example print?
    example: B01-main
    answerFromEngine: true
  - id: B01-concept
    type: multiple-choice
    question: What happens to the logical call frames as recursion returns?
    choices:
      - They are removed in reverse call order
      - They all remain active forever
    answer: They are removed in reverse call order
    explanation: >-
      A frame keeps one call's parameters and local values separate from every
      other call. Step through the calls and returns here. Real Go stacks can
      also grow and move; the reading covers that, and this view does not
      simulate it.
  - id: B01-keyword
    type: fill-blank
    question: >-
      Fill the blank in this line: func sum(n int) int { if n == 0 { ___ 0 };
      return n + sum(n-1) }
    answer: return
    explanation: >-
      Look for return in the example. A frame keeps one active call’s parameters
      and local values separate from other calls. Replay the recorded calls and
      returns here. Native stack growth, copying and pointer repair are
      explained in the source reading; this generic trace does not emulate those
      mechanisms.
deeper:
  - source: u038
  - source: u039
  - source: u040
  - source: u041
next:
  - B02
claims:
  - text: >-
      A frame keeps one call's parameters and local values separate from every
      other call. Step through the calls and returns here. Real Go stacks can
      also grow and move; the reading covers that, and this view does not
      simulate it.
    sources:
      - u038
      - u039
      - u040
      - u041
    model: true
estimatedMinutes: 7
try:
  task: >-
    Change `sum(4)` to `sum(6)`. Before running, predict the total and how many
    `sum` frames will stack up.
  hint: 'There is one frame for each call, from `sum(6)` down to `sum(0)`.'
  expect: ^21\s*$
  solution: |
    package main

    import "fmt"

    func sum(n int) int { if n == 0 { return 0 }; return n + sum(n-1) }

    func main() {
        fmt.Println(sum(6))
    }
stage: 0
---
Each goroutine carries a stack of work trays. Call a helper repeatedly and watch a tray arrive for each active call, then leave on return.
