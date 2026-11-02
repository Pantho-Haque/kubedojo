---
id: B03
title: Allocation
track: B
tier: P0
level: Core
prereqs:
  - B02
subtags:
  - memory/allocator
sources:
  - u001
  - u002
  - u003
  - u004
  - u005
  - u006
  - u007
  - u008
  - u009
bridge: false
goals:
  - Say what a size class is in one sentence
  - Explain why a 13-byte request may use a slightly bigger slot
  - Compare each requested size with the heap object the stage draws
steps:
  - id: B03-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: B03-main
  - id: B03-try
    type: try
    text: >-
      Add `c := make([]byte, 100)` and print `len(c)` as a third value. Before
      running, guess the size of the new heap object.
    example: B03-main
  - id: B03-explain
    type: explain
    text: >-
      The Go runtime groups small requests into size classes and serves them
      through layers called mcache, mcentral and mheap, which get memory from
      the operating system. The exact size-class table is not included here.
      This view shows the storage your program asks for and its payload sizes;
      it does not invent native slot sizes or overhead.
  - id: B03-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: SizeClassBinPacker
widget: SizeClassBinPacker
examples:
  - B03-main
pitfalls:
  - id: B03-pitfall
    title: 'Looks right, but…'
    claim: >-
      Asking for 13 bytes gets you exactly 13 bytes of memory, with nothing
      extra.
    explanation: >-
      The allocator hands out memory in a set of standard slot sizes. A small
      request is rounded up to the nearest one, so some space can go unused.
    example: B03-main
quiz:
  - id: B03-output
    type: predict-output
    question: What will this example print?
    example: B03-main
    answerFromEngine: true
  - id: B03-concept
    type: multiple-choice
    question: Can a size class reserve more space than the payload requests?
    choices:
      - 'Yes, requests can be rounded to a class'
      - 'No, every allocation has an exact-sized private page'
    answer: 'Yes, requests can be rounded to a class'
    explanation: >-
      The Go runtime groups small requests into size classes and serves them
      through layers called mcache, mcentral and mheap, which get memory from
      the operating system. The exact size-class table is not included here.
      This view shows the storage your program asks for and its payload sizes;
      it does not invent native slot sizes or overhead.
  - id: B03-keyword
    type: fill-blank
    question: 'Fill the blank in this line: a := ___([]byte, 13)'
    answer: make
    explanation: >-
      Look for make in the example. The runtime uses size classes and an
      allocation path involving mcache, mcentral, mheap and the operating
      system. The collected text refers to a size-class table that is not
      included. This view records logical storage requests and known payload
      sizes; it does not invent native bins or overhead.
deeper:
  - source: u001
  - source: u002
  - source: u003
  - source: u004
  - source: u005
  - source: u006
  - source: u007
  - source: u008
  - source: u009
next:
  - B04
claims:
  - text: >-
      The Go runtime groups small requests into size classes and serves them
      through layers called mcache, mcentral and mheap, which get memory from
      the operating system. The exact size-class table is not included here.
      This view shows the storage your program asks for and its payload sizes;
      it does not invent native slot sizes or overhead.
    sources:
      - u001
      - u002
      - u003
      - u004
      - u005
      - u006
      - u007
      - u008
      - u009
    model: true
estimatedMinutes: 7
try:
  task: >-
    Add `c := make([]byte, 100)` and print `len(c)` as a third value. Before
    running, guess the size of the new heap object.
  hint: >-
    The program asks for 100 bytes; a real allocator would round that up to its
    nearest size class.
  expect: ^13 33 100\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        a := make([]byte, 13)
        b := make([]byte, 33)
        c := make([]byte, 100)
        fmt.Println(len(a), len(b), len(c))
    }
stage: 0
---
An allocation request is like asking a stockroom for a box that fits. Compare the requested size with the class of box the model selects.
