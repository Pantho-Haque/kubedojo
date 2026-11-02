---
id: A01
title: Your program and the memory map
track: A
tier: P0
level: Core
prereqs: []
subtags:
  - sched/overview
  - syntax/types
sources:
  - u058
  - u074
  - u048
bridge: false
goals:
  - Find `global` and `local` on the stage and say where each one lives
  - 'Say why `local` is gone after `main` returns, but `global` is not'
  - Name the package and function where every Go program starts
steps:
  - id: A01-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A01-main
  - id: A01-try
    type: try
    text: 'Change `local := 3` to `local := global * 2` and run. What prints now?'
    example: A01-main
  - id: A01-explain
    type: explain
    text: >-
      A Go command starts from package main and its main function. The diagram
      separates code, globals, active calls and referenced storage as a
      simplified map; it is not a photograph of RAM.
  - id: A01-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: MemoryMapTour
widget: MemoryMapTour
examples:
  - A01-main
pitfalls:
  - id: A01-pitfall
    title: 'Looks right, but…'
    claim: >-
      A variable declared inside `main` can be used by any other function in the
      package.
    explanation: >-
      A local variable only exists inside its own call. Other functions can use
      package-level variables, or values you pass them as arguments.
    example: A01-main
quiz:
  - id: A01-output
    type: predict-output
    question: What will this example print?
    example: A01-main
    answerFromEngine: true
  - id: A01-concept
    type: multiple-choice
    question: Which name is available outside the main function?
    choices:
      - The global name
      - Every local name
    answer: The global name
    explanation: >-
      A Go command starts from package main and its main function. The diagram
      separates code, globals, active calls and referenced storage as a
      simplified map; it is not a photograph of RAM.
  - id: A01-keyword
    type: fill-blank
    question: 'Fill the blank in this line: package ___'
    answer: main
    explanation: >-
      Look for main in the example. A Go command starts from package main and
      its main function. The diagram separates code, globals, active calls and
      referenced storage as a simplified map; it is not a photograph of RAM.
deeper:
  - source: u058
  - source: u074
  - source: u048
next:
  - A02
claims:
  - text: >-
      A Go command starts from package main and its main function. The diagram
      separates code, globals, active calls and referenced storage as a
      simplified map; it is not a photograph of RAM.
    sources:
      - u058
      - u074
      - u048
    model: true
estimatedMinutes: 7
try:
  task: 'Change `local := 3` to `local := global * 2` and run. What prints now?'
  hint: >-
    Code inside `main` can read the package-level `global`, because it lives
    outside any one call.
  expect: ^8 16\s*$
  solution: |
    package main

    import "fmt"

    var global = 8

    func main() {
        local := global * 2
        fmt.Println(global, local)
    }
stage: 0
---
Think of a program as a house with rooms for different kinds of work. Run this tiny program, then find the value that belongs to the house and the value used by one call.
