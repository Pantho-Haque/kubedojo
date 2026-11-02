---
id: F01
title: Follow a request end to end
track: F
tier: P2
level: Advanced
prereqs: []
subtags:
  - conc/model
  - memory/gc
  - sched/overview
sources:
  - u048
  - u011
  - u066
bridge: false
goals:
  - Predict where `main` will wait before you press play
  - Find the GC step and say what it frees
  - 'Compare your prediction with the run, step by step'
steps:
  - id: F01-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: F01-main
  - id: F01-try
    type: try
    text: >-
      Add a second request: start `go func(){ch<-9}()` and change `answer:=<-ch`
      to `answer:=<-ch + <-ch`. Predict the output and how many times `main`
      waits.
    example: F01-main
  - id: F01-explain
    type: explain
    text: >-
      This project ties together goroutines, channel handoffs and garbage
      collection. Check the run against your prediction. The GC events and clock
      values come from gothik's model, not from a real service.
  - id: F01-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: GenericStepper
widget: GenericStepper
examples:
  - F01-main
pitfalls:
  - id: F01-pitfall
    title: 'Looks right, but…'
    claim: >-
      If the final answer is right, the program must have taken the path I
      expected.
    explanation: >-
      Different paths can print the same number. Check where each goroutine
      blocked and when the GC ran to see the path it really took.
    example: F01-main
quiz:
  - id: F01-output
    type: predict-output
    question: What will this example print?
    example: F01-main
    answerFromEngine: true
  - id: F01-concept
    type: multiple-choice
    question: What should you compare against your prediction?
    choices:
      - The recorded blocking and collection events
      - Only the final line of output
    answer: The recorded blocking and collection events
    explanation: >-
      This project ties together goroutines, channel handoffs and garbage
      collection. Check the run against your prediction. The GC events and clock
      values come from gothik's model, not from a real service.
  - id: F01-keyword
    type: fill-blank
    question: 'Fill the blank in this line: ___(answer*2)'
    answer: fmt.Println
    explanation: >-
      Look for channel in the example. The project connects concurrent work,
      communication and collection observations. Check the actual trace against
      your prediction. Model collection events and clock values are synthetic,
      not a native service benchmark.
deeper:
  - source: u048
  - source: u011
  - source: u066
next:
  - F02
claims:
  - text: >-
      This project ties together goroutines, channel handoffs and garbage
      collection. Check the run against your prediction. The GC events and clock
      values come from gothik's model, not from a real service.
    sources:
      - u048
      - u011
      - u066
    model: true
estimatedMinutes: 7
capstone:
  starter: |
    package main

    import ("fmt"; "runtime")

    func main() {
        ch:=make(chan int)
        go func(){ch<-10}()
        answer:=<-ch
        runtime.GC()
        fmt.Println(answer*2)
    }
  solution: F01-main
  goal:
    stdout: '42'
    exitStatus: 0
  hints:
    - Follow the value sent through the channel.
    - The final expression doubles the received value.
    - Send 21 so the final multiplication produces 42.
try:
  task: >-
    Add a second request: start `go func(){ch<-9}()` and change `answer:=<-ch`
    to `answer:=<-ch + <-ch`. Predict the output and how many times `main`
    waits.
  hint: '`main` blocks once per receive; the answer is (21 + 9) * 2.'
  expect: ^60\s*$
  solution: |
    package main

    import ("fmt"; "runtime")

    func main() {
        ch:=make(chan int)
        go func(){ch<-21}()
        go func(){ch<-9}()
        answer:=<-ch + <-ch
        runtime.GC()
        fmt.Println(answer*2)
    }
stage: 0
---
Follow one request like a parcel through several stations. Predict its waits before you compare your plan with the recorded run.
