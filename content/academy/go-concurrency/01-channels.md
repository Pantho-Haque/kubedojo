---
id: D01
title: Channels
track: D
tier: P0
level: Core
prereqs:
  - C01
subtags:
  - conc/model
  - syntax/conc
sources:
  - u085
  - u086
  - u087
  - u066
bridge: false
goals:
  - 'Say how many values `make(chan int, 2)` can hold before a send waits'
  - Explain why a closed channel still hands out its buffered values
  - 'Use `v, ok := <-ch` to tell a sent value from a closed, empty channel'
steps:
  - id: D01-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: D01-main
  - id: D01-try
    type: try
    text: >-
      Change `ch <- 3; ch <- 5` to just `ch <- 3`. Predict all five printed
      values.
    example: D01-main
  - id: D01-explain
    type: explain
    text: >-
      An unbuffered send needs a matching receive. A buffered channel can hold
      values up to its capacity. Closing does not discard buffered values; a
      receive can report whether it got a sent value.
  - id: D01-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: ChannelPipe
widget: ChannelPipe
examples:
  - D01-main
pitfalls:
  - id: M20
    title: 'Looks right, but…'
    claim: An unbuffered channel stores queued values.
    explanation: >-
      An unbuffered handoff needs a sender and receiver. Waiting goroutines can
      queue, but the channel has no value buffer.
    example: D01-main
quiz:
  - id: D01-output
    type: predict-output
    question: What will this example print?
    example: D01-main
    answerFromEngine: true
  - id: D01-concept
    type: multiple-choice
    question: Does an unbuffered channel hold queued values?
    choices:
      - 'No, it needs a matching handoff'
      - 'Yes, it has an unlimited value buffer'
    answer: 'No, it needs a matching handoff'
    explanation: >-
      An unbuffered send needs a matching receive. A buffered channel can hold
      values up to its capacity. Closing does not discard buffered values; a
      receive can report whether it got a sent value.
  - id: D01-keyword
    type: fill-blank
    question: 'Fill the blank in this line: ___(ch)'
    answer: close
    explanation: >-
      Look for close in the example. An unbuffered send needs a matching
      receive. A buffered channel can hold values up to its capacity. Closing
      does not discard buffered values; a receive can report whether it got a
      sent value.
deeper:
  - source: u085
  - source: u086
  - source: u087
  - source: u066
next:
  - D02
claims:
  - text: >-
      An unbuffered send needs a matching receive. A buffered channel can hold
      values up to its capacity. Closing does not discard buffered values; a
      receive can report whether it got a sent value.
    sources:
      - u085
      - u086
      - u087
      - u066
    model: false
estimatedMinutes: 7
try:
  task: >-
    Change `ch <- 3; ch <- 5` to just `ch <- 3`. Predict all five printed
    values.
  hint: >-
    After the one buffered value is taken, every receive from the closed channel
    gets 0.
  expect: ^3 true 0 0 false\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        ch := make(chan int, 2)
        ch <- 3
        close(ch)
        a, ok := <-ch
        b := <-ch
        c, open := <-ch
        fmt.Println(a, ok, b, c, open)
    }
stage: 0
---
A channel is a handoff point, with optional room for stored values. Compare a direct meeting with a small waiting shelf before closing the path.
