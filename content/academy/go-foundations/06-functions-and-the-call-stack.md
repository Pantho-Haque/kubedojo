---
id: A06
title: Functions and the call stack
track: A
tier: P0
level: Core
prereqs:
  - A02
  - A03
subtags:
  - memory/stack
  - syntax/types
sources:
  - u074
  - u040
bridge: false
goals:
  - 'Point to the two separate `x` slots: one in `main`, one in `change`'
  - Say why `main` still prints 7 after `change` sets its `x` to 99
  - Send a result back to the caller with a return value
steps:
  - id: A06-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A06-main
  - id: A06-try
    type: try
    text: >-
      Make `change` return its result: write `func change(x int) int { x = 99;
      fmt.Println(x); return x }` and call it as `x = change(x)`. What does
      `main` print now?
    example: A06-main
  - id: A06-explain
    type: explain
    text: >-
      Arguments initialize the called function’s parameters by value. A call has
      its own logical frame. Copying a slice or pointer value can still leave a
      connection to shared storage; the copy/share lesson explores that next.
  - id: A06-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: CallStackStepper
widget: CallStackStepper
examples:
  - A06-main
pitfalls:
  - id: M03
    title: 'Looks right, but…'
    claim: Slices and large structs are passed by reference.
    explanation: >-
      Arguments are values. Copying a slice copies its descriptor, which still
      reaches the same backing array; copying a struct copies its fields.
    example: A13-copy
quiz:
  - id: A06-output
    type: predict-output
    question: What will this example print?
    example: A06-main
    answerFromEngine: true
  - id: A06-concept
    type: multiple-choice
    question: Does assigning to parameter x change the caller’s integer?
    choices:
      - 'No, the parameter is a copy'
      - 'Yes, all arguments are references'
    answer: 'No, the parameter is a copy'
    explanation: >-
      Arguments initialize the called function’s parameters by value. A call has
      its own logical frame. Copying a slice or pointer value can still leave a
      connection to shared storage; the copy/share lesson explores that next.
  - id: A06-keyword
    type: fill-blank
    question: 'Fill the blank in this line: func change(x int) { x = 99; ___(x) }'
    answer: fmt.Println
    explanation: >-
      Look for return in the example. Arguments initialize the called function’s
      parameters by value. A call has its own logical frame. Copying a slice or
      pointer value can still leave a connection to shared storage; the
      copy/share lesson explores that next.
deeper:
  - source: u074
  - source: u040
next:
  - A07
claims:
  - text: >-
      Arguments initialize the called function’s parameters by value. A call has
      its own logical frame. Copying a slice or pointer value can still leave a
      connection to shared storage; the copy/share lesson explores that next.
    sources:
      - u074
      - u040
    model: false
estimatedMinutes: 7
try:
  task: >-
    Make `change` return its result: write `func change(x int) int { x = 99;
    fmt.Println(x); return x }` and call it as `x = change(x)`. What does `main`
    print now?
  hint: >-
    The parameter is still a copy, but `main` now stores the returned value in
    its own `x`.
  expect: ^99\s+99\s*$
  solution: |
    package main

    import "fmt"

    func change(x int) int { x = 99; fmt.Println(x); return x }

    func main() {
        x := 7
        x = change(x)
        fmt.Println(x)
    }
stage: 1
---
Calling a function is like handing a copy of a worksheet to someone else. Let the helper change its copy, then check the original sheet.
