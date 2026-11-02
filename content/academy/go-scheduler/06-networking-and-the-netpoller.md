---
id: C06
title: Networking and the netpoller
track: C
tier: P1
level: Extended
prereqs:
  - C03
  - D01
subtags:
  - sched/netpoll
  - sched/overview
sources:
  - u051
  - u048
bridge: false
goals:
  - Say what a parked goroutine is doing while it waits (nothing)
  - Explain how `main` wakes up when the value arrives
  - Predict which of two sleeping goroutines sends first
steps:
  - id: C06-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: C06-main
  - id: C06-try
    type: try
    text: >-
      Add a second goroutine, `go func(){ time.Sleep(1*time.Millisecond); done
      <- 1 }()`, and print `<-done, <-done`. Which value comes first?
    example: C06-main
  - id: C06-explain
    type: explain
    text: >-
      A goroutine can wait while other work goes on. This example uses the
      simulated clock as a stand-in for something outside the program, like data
      arriving. It opens no network connection, and `Sleep` is not the real
      network poller; the reading explains that separate mechanism.
  - id: C06-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: NetpollerFlow
widget: NetpollerFlow
examples:
  - C06-main
pitfalls:
  - id: C06-pitfall
    title: 'Looks right, but…'
    claim: >-
      A goroutine waiting for network data keeps a CPU busy checking until the
      data comes.
    explanation: >-
      The runtime parks the waiting goroutine, so it uses no CPU. When the data
      is ready, the network poller makes it runnable again.
    example: C06-main
quiz:
  - id: C06-output
    type: predict-output
    question: What will this example print?
    example: C06-main
    answerFromEngine: true
  - id: C06-concept
    type: multiple-choice
    question: >-
      Must a blocked-looking network read occupy a running goroutine the whole
      time?
    choices:
      - 'No, the runtime can park and later wake the goroutine'
      - 'Yes, it must spin until the bytes arrive'
    answer: 'No, the runtime can park and later wake the goroutine'
    explanation: >-
      A goroutine can wait while other work goes on. This example uses the
      simulated clock as a stand-in for something outside the program, like data
      arriving. It opens no network connection, and `Sleep` is not the real
      network poller; the reading explains that separate mechanism.
  - id: C06-keyword
    type: fill-blank
    question: >-
      Fill the blank in this line: go func(){ time.___(3*time.Millisecond); done
      <- 7 }()
    answer: Sleep
    explanation: >-
      Look for Sleep in the example. A goroutine can wait while other work
      progresses. This example uses virtual time as a stand-in for an outside
      event. It does not open a network connection or claim that Sleep is the
      netpoller; the captured runtime reading explains that separate mechanism.
deeper:
  - source: u051
  - source: u048
next:
  - C07
claims:
  - text: >-
      A goroutine can wait while other work goes on. This example uses the
      simulated clock as a stand-in for something outside the program, like data
      arriving. It opens no network connection, and `Sleep` is not the real
      network poller; the reading explains that separate mechanism.
    sources:
      - u051
      - u048
    model: true
estimatedMinutes: 7
try:
  task: >-
    Add a second goroutine, `go func(){ time.Sleep(1*time.Millisecond); done <-
    1 }()`, and print `<-done, <-done`. Which value comes first?
  hint: >-
    The goroutine with the shorter sleep wakes first, so its value arrives
    first.
  expect: ^1 7\s*$
  solution: |
    package main

    import ("fmt"; "time")

    func main() {
        done := make(chan int)
        go func(){ time.Sleep(3*time.Millisecond); done <- 7 }()
        go func(){ time.Sleep(1*time.Millisecond); done <- 1 }()
        fmt.Println(<-done, <-done)
    }
stage: 2
---
Waiting for a delivery need not leave a worker staring at the door. Follow a simulated outside event and see which waiting task becomes runnable.
