---
id: B04
title: Garbage collection basics
track: B
tier: P0
level: Core
prereqs:
  - B03
subtags:
  - memory/gc
sources:
  - u011
  - u012
  - u013
  - u019
  - u020
bridge: false
goals:
  - Name the root that keeps the `new(int)` box alive at first
  - Say why `keep = nil` alone does not free anything
  - Predict which heap objects survive `runtime.GC()`
steps:
  - id: B04-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: B04-main
  - id: B04-try
    type: try
    text: >-
      Delete the line `keep = nil` and change the print to `fmt.Println("kept",
      *keep)`. Does the box survive the GC?
    example: B04-main
  - id: B04-explain
    type: explain
    text: >-
      Roots and references determine reachability. An unreachable object does
      not disappear merely because a variable becomes nil. Step through the
      simplified mark/sweep model and check that no reachable object is
      reclaimed.
  - id: B04-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: TriColourGC
widget: TriColourGC
examples:
  - B04-main
pitfalls:
  - id: M16
    title: 'Looks right, but…'
    claim: Assigning nil immediately frees storage.
    explanation: >-
      Removing a reference can make storage unreachable. Collection and later
      scavenging are separate steps; assignment alone is not a free operation.
    example: B04-main
quiz:
  - id: B04-output
    type: predict-output
    question: What will this example print?
    example: B04-main
    answerFromEngine: true
  - id: B04-concept
    type: multiple-choice
    question: Does assigning nil immediately free the referenced object?
    choices:
      - 'No, reclamation is a separate collection action'
      - 'Yes, nil is a manual free call'
    answer: 'No, reclamation is a separate collection action'
    explanation: >-
      Roots and references determine reachability. An unreachable object does
      not disappear merely because a variable becomes nil. Step through the
      simplified mark/sweep model and check that no reachable object is
      reclaimed.
  - id: B04-keyword
    type: fill-blank
    question: 'Fill the blank in this line: ___()'
    answer: runtime.GC
    explanation: >-
      Look for runtime.GC in the example. Roots and references determine
      reachability. An unreachable object does not disappear merely because a
      variable becomes nil. Step through the simplified mark/sweep model and
      check that no reachable object is reclaimed.
deeper:
  - source: u011
  - source: u012
  - source: u013
  - source: u019
  - source: u020
next:
  - B05
claims:
  - text: >-
      Roots and references determine reachability. An unreachable object does
      not disappear merely because a variable becomes nil. Step through the
      simplified mark/sweep model and check that no reachable object is
      reclaimed.
    sources:
      - u011
      - u012
      - u013
      - u019
      - u020
    model: true
estimatedMinutes: 7
try:
  task: >-
    Delete the line `keep = nil` and change the print to `fmt.Println("kept",
    *keep)`. Does the box survive the GC?
  hint: >-
    The global `keep` is a root; while it points at the box, the collector must
    keep it.
  expect: ^kept 42\s*$
  solution: |
    package main

    import ("fmt"; "runtime")

    var keep *int

    func main() {
        keep = new(int)
        *keep = 42
        runtime.GC()
        fmt.Println("kept", *keep)
    }
stage: 1
---
A collector is a librarian following bookmarks from the books still in use. Remove the last bookmark, then inspect which books remain reachable.
