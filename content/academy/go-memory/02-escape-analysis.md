---
id: B02
title: Escape analysis
track: B
tier: P0
level: Core
prereqs:
  - A07
  - A15
  - A16
  - B01
subtags:
  - memory/escape
sources:
  - u010
  - u023
  - u024
  - u025
  - u026
  - u027
bridge: false
goals:
  - Say why `x` must outlive the `makeValue` call
  - Find the value the stage marks as moved to the heap
  - Say that escape analysis happens when the program is compiled
steps:
  - id: B02-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: B02-main
  - id: B02-try
    type: try
    text: >-
      Call `makeValue` a second time: add `q := makeValue()` and `*q = 7`, then
      print `*p, *q`. Do `p` and `q` share one box?
    example: B02-main
  - id: B02-explain
    type: explain
    text: >-
      Escape analysis is done by the compiler before your program runs; the
      garbage collector does not decide it. When a value must outlive its call,
      like `x` returned by address here, the compiler places it on the heap.
      gothik shows a simplified version of that reasoning, not every
      optimization a real compiler makes.
  - id: B02-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: EscapeDecisionTree
widget: EscapeDecisionTree
examples:
  - B02-main
pitfalls:
  - id: M01
    title: 'Looks right, but…'
    claim: A short declaration always allocates on the heap.
    explanation: >-
      A declaration gives a value a name. The compiler decides placement from
      how the value is used; a short declaration is not a request for heap
      storage.
    example: A02-main
  - id: M02
    title: 'Looks right, but…'
    claim: Every pointer means heap storage.
    explanation: >-
      A pointer holds an address. A value can be addressed while it remains in a
      call frame; lifetime and escape behavior drive compiler placement.
    example: A07-main
  - id: M15
    title: 'Looks right, but…'
    claim: Escape analysis runs inside the program.
    explanation: >-
      Escape analysis is compiler analysis. This app explains lifetime
      relationships with a teaching model; it does not invoke the Go compiler.
    example: B02-main
quiz:
  - id: B02-output
    type: predict-output
    question: What will this example print?
    example: B02-main
    answerFromEngine: true
  - id: B02-concept
    type: multiple-choice
    question: When is escape analysis performed?
    choices:
      - During compilation
      - Each time the garbage collector runs
    answer: During compilation
    explanation: >-
      Escape analysis is done by the compiler before your program runs; the
      garbage collector does not decide it. When a value must outlive its call,
      like `x` returned by address here, the compiler places it on the heap.
      gothik shows a simplified version of that reasoning, not every
      optimization a real compiler makes.
  - id: B02-keyword
    type: fill-blank
    question: 'Fill the blank in this line: func makeValue() *int { x := 42; ___ &x }'
    answer: return
    explanation: >-
      Look for return in the example. Escape analysis is a compiler analysis,
      not a runtime collector decision. A teaching report explains the
      corpus-backed reason for placement; it does not claim to reproduce every
      optimization of a native compiler.
deeper:
  - source: u010
  - source: u023
  - source: u024
  - source: u025
  - source: u026
  - source: u027
next:
  - B03
claims:
  - text: >-
      Escape analysis is done by the compiler before your program runs; the
      garbage collector does not decide it. When a value must outlive its call,
      like `x` returned by address here, the compiler places it on the heap.
      gothik shows a simplified version of that reasoning, not every
      optimization a real compiler makes.
    sources:
      - u010
      - u023
      - u024
      - u025
      - u026
      - u027
    model: false
estimatedMinutes: 7
try:
  task: >-
    Call `makeValue` a second time: add `q := makeValue()` and `*q = 7`, then
    print `*p, *q`. Do `p` and `q` share one box?
  hint: 'Each call makes a fresh `x`, and each one has to move to the heap.'
  expect: ^42 7\s*$
  solution: |
    package main

    import "fmt"

    func makeValue() *int { x := 42; return &x }

    func main() {
        p := makeValue()
        q := makeValue()
        *q = 7
        fmt.Println(*p, *q)
    }
stage: 0
---
A value that leaves its room needs an address that still works later. Return a pointer, then follow it after the creating call has ended.
