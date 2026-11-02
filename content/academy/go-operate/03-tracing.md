---
id: E03
title: Tracing
track: E
tier: P2
level: Advanced
prereqs:
  - C03
  - E01
subtags:
  - memory/profile
  - sched/trace
sources:
  - u029
  - u030
  - u035
  - u056
bridge: false
goals:
  - Find the step where `main` blocks and the step where it resumes
  - Say what a trace shows that the final output cannot
  - Explain why one run does not show every possible order
steps:
  - id: E03-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: E03-main
  - id: E03-try
    type: try
    text: >-
      Add a second sender, `go func(){ch<-5}()`, and print `<-ch + <-ch`. Then
      find both handoffs on the timeline.
    example: E03-main
  - id: E03-explain
    type: explain
    text: >-
      The timeline shows calls, goroutine waits and channel handoffs in this
      model. Scrub or step through it to check their order. The spacing between
      steps is not real time, and one run does not show every possible order.
  - id: E03-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: TraceTimeline
widget: TraceTimeline
examples:
  - E03-main
pitfalls:
  - id: E03-pitfall
    title: 'Looks right, but…'
    claim: 'If the output is right, a trace has nothing more to tell you.'
    explanation: >-
      Output shows only the end result. A trace shows when each goroutine ran,
      waited and woke, which is where slowdowns and stuck goroutines hide.
    example: E03-main
quiz:
  - id: E03-output
    type: predict-output
    question: What will this example print?
    example: E03-main
    answerFromEngine: true
  - id: E03-concept
    type: multiple-choice
    question: Which question is especially suited to a trace?
    choices:
      - When did this goroutine block and resume?
      - What exact native byte address will every run use?
    answer: When did this goroutine block and resume?
    explanation: >-
      The timeline shows calls, goroutine waits and channel handoffs in this
      model. Scrub or step through it to check their order. The spacing between
      steps is not real time, and one run does not show every possible order.
  - id: E03-keyword
    type: fill-blank
    question: 'Fill the blank in this line: ___ func(){ch<-4}()'
    answer: go
    explanation: >-
      Look for go in the example. Recorded events show call progress, goroutine
      waits and communication in this model. Scrub or step through them to
      inspect their order. Virtual event spacing is not native elapsed time, and
      one replay does not prove every possible behavior.
deeper:
  - source: u029
  - source: u030
  - source: u035
  - source: u056
next:
  - E04
claims:
  - text: >-
      The timeline shows calls, goroutine waits and channel handoffs in this
      model. Scrub or step through it to check their order. The spacing between
      steps is not real time, and one run does not show every possible order.
    sources:
      - u029
      - u030
      - u035
      - u056
    model: true
estimatedMinutes: 7
try:
  task: >-
    Add a second sender, `go func(){ch<-5}()`, and print `<-ch + <-ch`. Then
    find both handoffs on the timeline.
  hint: '`main` now blocks twice, once for each receive.'
  expect: ^9\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        ch:=make(chan int)
        go func(){ch<-4}()
        go func(){ch<-5}()
        fmt.Println(<-ch + <-ch)
    }
stage: 1
---
A trace is a timeline of footprints. Follow when work runs, waits and resumes instead of looking only at its final printed answer.
