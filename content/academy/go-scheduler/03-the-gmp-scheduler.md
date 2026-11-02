---
id: C03
title: The GMP scheduler
track: C
tier: P0
level: Core
prereqs:
  - C01
subtags:
  - memory/profile
  - sched/overview
sources:
  - u048
  - u049
  - u050
  - u054
  - u032
bridge: false
goals:
  - 'Say what G, M and P each stand for'
  - Explain why a goroutine is not the same thing as an OS thread
  - Say what `runtime.GOMAXPROCS(2)` asks the runtime for
steps:
  - id: C03-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: C03-main
  - id: C03-try
    type: try
    text: >-
      Add a third goroutine that sends 3: grow the buffer to 3, add `go func(){
      ch <- 3 }()` and receive it in the print too.
    example: C03-main
  - id: C03-explain
    type: explain
    text: >-
      G, M and P are three different runtime resources: goroutines,
      operating-system threads, and the processor slots that let a thread run Go
      code. Here `GOMAXPROCS` sets how many processor slots the model has. The
      stage takes turns between goroutines to show their states; the reading
      explains how real threads and processors fit together.
  - id: C03-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: GMPBoard
widget: GMPBoard
examples:
  - C03-main
pitfalls:
  - id: M18
    title: 'Looks right, but…'
    claim: One goroutine is one operating-system thread.
    explanation: >-
      The runtime schedules goroutines over threads and processor contexts. Many
      goroutines can share the same thread over time.
    example: C01-main
  - id: M19
    title: 'Looks right, but…'
    claim: More goroutines always finish work faster.
    explanation: >-
      Goroutines add scheduling and coordination work. Concurrency can help a
      suitable task; it does not guarantee more CPU capacity or less elapsed
      time.
    example: C03-main
quiz:
  - id: C03-output
    type: predict-output
    question: What will this example print?
    example: C03-main
    answerFromEngine: true
  - id: C03-concept
    type: multiple-choice
    question: Is a goroutine the same thing as an operating-system thread?
    choices:
      - 'No, G and M represent different resources'
      - 'Yes, they are two names for one object'
    answer: 'No, G and M represent different resources'
    explanation: >-
      G, M and P are three different runtime resources: goroutines,
      operating-system threads, and the processor slots that let a thread run Go
      code. Here `GOMAXPROCS` sets how many processor slots the model has. The
      stage takes turns between goroutines to show their states; the reading
      explains how real threads and processors fit together.
  - id: C03-keyword
    type: fill-blank
    question: 'Fill the blank in this line: runtime.___(2)'
    answer: GOMAXPROCS
    explanation: >-
      Look for GOMAXPROCS in the example. G, M and P describe different runtime
      resources. GOMAXPROCS changes the requested processor-context count in
      this model. The cooperative replay shows goroutine states and that count,
      while the source reading explains native thread and processor
      relationships.
deeper:
  - source: u048
  - source: u049
  - source: u050
  - source: u054
  - source: u032
next:
  - C04
claims:
  - text: >-
      G, M and P are three different runtime resources: goroutines,
      operating-system threads, and the processor slots that let a thread run Go
      code. Here `GOMAXPROCS` sets how many processor slots the model has. The
      stage takes turns between goroutines to show their states; the reading
      explains how real threads and processors fit together.
    sources:
      - u048
      - u049
      - u050
      - u054
      - u032
    model: true
estimatedMinutes: 7
try:
  task: >-
    Add a third goroutine that sends 3: grow the buffer to 3, add `go func(){ ch
    <- 3 }()` and receive it in the print too.
  hint: >-
    Three sends need three receives, and a buffer of 3 lets every sender finish
    without waiting.
  expect: \b3\b
  solution: |
    package main

    import ("fmt"; "runtime")

    func main() {
        runtime.GOMAXPROCS(2)
        ch := make(chan int, 3)
        go func(){ ch <- 1 }()
        go func(){ ch <- 2 }()
        go func(){ ch <- 3 }()
        fmt.Println(<-ch, <-ch, <-ch)
    }
stage: 1
---
Scheduling is matching jobs, workers and permission slips. Move the pieces together before asking why a goroutine is different from a thread or a core.
