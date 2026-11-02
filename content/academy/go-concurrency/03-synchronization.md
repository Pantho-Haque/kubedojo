---
id: D03
title: Synchronization
track: D
tier: P0
level: Core
prereqs:
  - D01
subtags:
  - conc/sync
sources:
  - u067
  - u068
bridge: false
goals:
  - Say what job the mutex does and what job the WaitGroup does
  - Explain why `count++` must happen between `Lock` and `Unlock`
  - Predict the count when more goroutines join in
steps:
  - id: D03-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: D03-main
  - id: D03-try
    type: try
    text: >-
      Use five goroutines: change `wg.Add(2)` to `wg.Add(5)` and `i < 2` to `i <
      5`. Predict the count.
    example: D03-main
  - id: D03-explain
    type: explain
    text: >-
      Mutual exclusion protects a critical section. WaitGroup coordinates
      completion and is not a replacement for protecting shared updates. Choose
      communication or locking for the actual relationship being coordinated;
      copying synchronization values is unsafe.
  - id: D03-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: MutexQueue
widget: MutexQueue
examples:
  - D03-main
pitfalls:
  - id: M21
    title: 'Looks right, but…'
    claim: Channels are always better than mutexes.
    explanation: >-
      A mutex protects shared access. A channel communicates values and
      coordinates work. Choose the operation that expresses the relationship
      clearly.
    example: D03-main
  - id: M22
    title: 'Looks right, but…'
    claim: A mutex can be copied after use.
    explanation: >-
      A synchronization value must not be copied after first use. Keep a shared
      mutex at a stable address and pass a pointer when needed.
    example: D03-main
quiz:
  - id: D03-output
    type: predict-output
    question: What will this example print?
    example: D03-main
    answerFromEngine: true
  - id: D03-concept
    type: multiple-choice
    question: Does WaitGroup alone protect a shared counter update?
    choices:
      - 'No, completion and exclusion are different jobs'
      - 'Yes, waiting makes every update atomic'
    answer: 'No, completion and exclusion are different jobs'
    explanation: >-
      Mutual exclusion protects a critical section. WaitGroup coordinates
      completion and is not a replacement for protecting shared updates. Choose
      communication or locking for the actual relationship being coordinated;
      copying synchronization values is unsafe.
  - id: D03-keyword
    type: fill-blank
    question: 'Fill the blank in this line: var mu sync.___; var wg sync.WaitGroup'
    answer: Mutex
    explanation: >-
      Look for Mutex in the example. Mutual exclusion protects a critical
      section. WaitGroup coordinates completion and is not a replacement for
      protecting shared updates. Choose communication or locking for the actual
      relationship being coordinated; copying synchronization values is unsafe.
deeper:
  - source: u067
  - source: u068
next:
  - D04
claims:
  - text: >-
      Mutual exclusion protects a critical section. WaitGroup coordinates
      completion and is not a replacement for protecting shared updates. Choose
      communication or locking for the actual relationship being coordinated;
      copying synchronization values is unsafe.
    sources:
      - u067
      - u068
    model: false
estimatedMinutes: 7
try:
  task: >-
    Use five goroutines: change `wg.Add(2)` to `wg.Add(5)` and `i < 2` to `i <
    5`. Predict the count.
  hint: The mutex still lets only one goroutine update `count` at a time.
  expect: ^5\s*$
  solution: |
    package main

    import ("fmt"; "sync")

    func main() {
        var mu sync.Mutex; var wg sync.WaitGroup
        count := 0; wg.Add(5)
        for i := 0; i < 5; i++ { go func(){ mu.Lock(); count++; mu.Unlock(); wg.Done() }() }
        wg.Wait(); fmt.Println(count)
    }
stage: 1
---
A mutex is a key for a shared notebook. Give each worker the key before its update and wait until all workers put their pencils down.
