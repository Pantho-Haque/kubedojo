---
id: D02
title: Select
track: D
tier: P1
level: Extended
prereqs:
  - D01
subtags:
  - conc/model
  - syntax/conc
sources:
  - u088
  - u066
bridge: false
goals:
  - Say what `select` does when two cases are ready at once
  - Explain why the order of cases in the code is not a priority
  - Make the choice certain by leaving only one case ready
steps:
  - id: D02-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: D02-main
  - id: D02-try
    type: try
    text: >-
      Change `a <- 1; b <- 2` to just `a <- 1`. Which case runs now, and is that
      guaranteed?
    example: D02-main
  - id: D02-explain
    type: explain
    text: >-
      Select chooses among ready communication cases. Default avoids waiting
      when no communication can proceed. Nil channels disable their cases;
      timeouts use the model’s virtual clock.
  - id: D02-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: SelectRace
widget: SelectRace
examples:
  - D02-main
pitfalls:
  - id: D02-pitfall
    title: 'Looks right, but…'
    claim: 'When several cases are ready, `select` always picks the one written first.'
    explanation: >-
      If more than one case can proceed, Go picks one at random. If you need a
      priority, check the channels in separate steps.
    example: D02-main
quiz:
  - id: D02-output
    type: predict-output
    question: What will this example print?
    example: D02-main
    answerFromEngine: true
  - id: D02-concept
    type: multiple-choice
    question: Is the first written ready case guaranteed to win?
    choices:
      - 'No, ready-case choice is not a source-order guarantee'
      - 'Yes, select always tries cases from top to bottom'
    answer: 'No, ready-case choice is not a source-order guarantee'
    explanation: >-
      Select chooses among ready communication cases. Default avoids waiting
      when no communication can proceed. Nil channels disable their cases;
      timeouts use the model’s virtual clock.
  - id: D02-keyword
    type: fill-blank
    question: >-
      Fill the blank in this line: ___ { case n := <-a: fmt.Println("a", n);
      case n := <-b: fmt.Println("b", n) }
    answer: select
    explanation: >-
      Look for select in the example. Select chooses among ready communication
      cases. Default avoids waiting when no communication can proceed. Nil
      channels disable their cases; timeouts use the model’s virtual clock.
deeper:
  - source: u088
  - source: u066
next:
  - D03
claims:
  - text: >-
      Select chooses among ready communication cases. Default avoids waiting
      when no communication can proceed. Nil channels disable their cases;
      timeouts use the model’s virtual clock.
    sources:
      - u088
      - u066
    model: true
estimatedMinutes: 7
try:
  task: >-
    Change `a <- 1; b <- 2` to just `a <- 1`. Which case runs now, and is that
    guaranteed?
  hint: 'With only one channel holding a value, only one case can proceed.'
  expect: ^a 1\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        a := make(chan int, 1); b := make(chan int, 1)
        a <- 1
        select { case n := <-a: fmt.Println("a", n); case n := <-b: fmt.Println("b", n) }
    }
stage: 0
---
Select is listening at several doors at once. Make more than one door ready and try another seed before assuming one case always wins.
