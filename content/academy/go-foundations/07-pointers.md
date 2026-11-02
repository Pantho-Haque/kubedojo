---
id: A07
title: Pointers
track: A
tier: P0
level: Core
prereqs:
  - A06
subtags:
  - memory/escape
  - memory/stack
  - syntax/types
sources:
  - u074
  - u041
  - u024
bridge: false
goals:
  - Follow the arrow from `p` to `x` and say what it means
  - Explain why `x` prints 42 though the code never assigns to `x` directly
  - Say what `&x` does and what `*p` does
steps:
  - id: A07-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A07-main
  - id: A07-try
    type: try
    text: Change `*p = 42` to `*p = *p * 3`. Predict what `x` prints.
    example: A07-main
  - id: A07-explain
    type: explain
    text: >-
      The address operator creates a pointer to an addressable value.
      Dereferencing the pointer accesses that value. A pointer alone does not
      prove heap placement; that depends on how the reference is used.
  - id: A07-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: PointerArrows
widget: PointerArrows
examples:
  - A07-main
pitfalls:
  - id: M02
    title: 'Looks right, but…'
    claim: Every pointer means heap storage.
    explanation: >-
      A pointer holds an address. A value can be addressed while it remains in a
      call frame; lifetime and escape behavior drive compiler placement.
    example: A07-main
quiz:
  - id: A07-output
    type: predict-output
    question: What will this example print?
    example: A07-main
    answerFromEngine: true
  - id: A07-concept
    type: multiple-choice
    question: What does *p = 42 change?
    choices:
      - The value p points to
      - The address tag into an integer
    answer: The value p points to
    explanation: >-
      The address operator creates a pointer to an addressable value.
      Dereferencing the pointer accesses that value. A pointer alone does not
      prove heap placement; that depends on how the reference is used.
  - id: A07-keyword
    type: fill-blank
    question: 'Fill the blank in this line: p := ___x'
    answer: '&'
    explanation: >-
      Look for & in the example. The address operator creates a pointer to an
      addressable value. Dereferencing the pointer accesses that value. A
      pointer alone does not prove heap placement; that depends on how the
      reference is used.
deeper:
  - source: u074
  - source: u041
  - source: u024
next:
  - A08
claims:
  - text: >-
      The address operator creates a pointer to an addressable value.
      Dereferencing the pointer accesses that value. A pointer alone does not
      prove heap placement; that depends on how the reference is used.
    sources:
      - u074
      - u041
      - u024
    model: false
estimatedMinutes: 7
try:
  task: Change `*p = 42` to `*p = *p * 3`. Predict what `x` prints.
  hint: '`*p` on the right reads `x` (10); on the left it writes back into `x`.'
  expect: ^30\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        x := 10
        p := &x
        *p = *p * 3
        fmt.Println(x)
    }
stage: 1
---
A pointer is an address tag attached to a drawer. Follow the tag to change the original value, rather than making another copy of the number.
