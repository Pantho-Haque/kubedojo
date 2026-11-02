---
id: F02
title: Find the leak
track: F
tier: P1
level: Extended
prereqs: []
subtags:
  - memory/gc
  - memory/profile
sources:
  - u011
  - u015
  - u031
bridge: false
goals:
  - Find the arrow that would keep the 64-int array alive
  - Explain why `large=nil` alone cannot free it if `small` views it
  - Fix a leak by copying just the items you need
steps:
  - id: F02-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: F02-main
  - id: F02-try
    type: try
    text: >-
      Undo the fix: replace the `make` and `copy` lines with `small:=large[:2]`.
      What does `cap(small)` print, and does the 64-int array survive the GC?
    example: F02-main
  - id: F02-explain
    type: explain
    text: >-
      The project separates visible length from retained storage. Copy the
      portion that must survive and remove the unneeded reference. Verify the
      model’s retention graph after collection rather than assuming nil is an
      immediate free.
  - id: F02-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: GenericStepper
widget: GenericStepper
examples:
  - F02-main
pitfalls:
  - id: F02-pitfall
    title: 'Looks right, but…'
    claim: A slice that shows only two items can only be holding two items of memory.
    explanation: >-
      A slice is a window onto a backing array. While it points there, the whole
      array stays alive, however few items it shows.
    example: F02-main
quiz:
  - id: F02-output
    type: predict-output
    question: What will this example print?
    example: F02-main
    answerFromEngine: true
  - id: F02-concept
    type: multiple-choice
    question: Which evidence identifies what keeps storage alive?
    choices:
      - A path from a root to that storage
      - The number of printed elements alone
    answer: A path from a root to that storage
    explanation: >-
      The project separates visible length from retained storage. Copy the
      portion that must survive and remove the unneeded reference. Verify the
      model’s retention graph after collection rather than assuming nil is an
      immediate free.
  - id: F02-keyword
    type: fill-blank
    question: 'Fill the blank in this line: ___(small,large[:2])'
    answer: copy
    explanation: >-
      Look for copy in the example. The project separates visible length from
      retained storage. Copy the portion that must survive and remove the
      unneeded reference. Verify the model’s retention graph after collection
      rather than assuming nil is an immediate free.
deeper:
  - source: u011
  - source: u015
  - source: u031
next:
  - F03
claims:
  - text: >-
      The project separates visible length from retained storage. Copy the
      portion that must survive and remove the unneeded reference. Verify the
      model’s retention graph after collection rather than assuming nil is an
      immediate free.
    sources:
      - u011
      - u015
      - u031
    model: true
estimatedMinutes: 7
capstone:
  starter: |
    package main

    import ("fmt"; "runtime")

    func main() {
        large:=make([]int,64)
        small:=large[:2]
        large=nil
        runtime.GC()
        fmt.Println(len(small),cap(small))
    }
  solution: F02-main
  goal:
    stdout: 2 2
    exitStatus: 0
  hints:
    - Inspect the capacity of the short slice.
    - A short view can still retain the large backing array.
    - Allocate a two-element slice and copy the wanted elements into it.
try:
  task: >-
    Undo the fix: replace the `make` and `copy` lines with `small:=large[:2]`.
    What does `cap(small)` print, and does the 64-int array survive the GC?
  hint: >-
    `small` is now a window onto the big array, so that array stays reachable
    after `large=nil`.
  expect: ^2 64\s*$
  solution: |
    package main

    import ("fmt"; "runtime")

    func main() {
        large:=make([]int,64)
        small:=large[:2]
        large=nil
        runtime.GC()
        fmt.Println(len(small),cap(small))
    }
stage: 0
---
Find the hidden bookmark keeping a warehouse open. Change the retention path, then use the model’s live-storage goal instead of judging by a small printed slice.
