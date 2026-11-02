---
id: A05
title: Control flow
track: A
tier: P0
level: Core
prereqs:
  - A02
subtags:
  - syntax/control
sources:
  - u080
  - u081
  - u095
bridge: false
goals:
  - Trace `i` and `sum` through each turn of the loop
  - Say which value of `i` is skipped and why the total is 8
  - Explain the difference between `continue` and `break`
steps:
  - id: A05-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A05-main
  - id: A05-try
    type: try
    text: Change `continue` to `break`. Predict the new total before you run.
    example: A05-main
  - id: A05-explain
    type: explain
    text: >-
      A condition decides whether another iteration runs. Break leaves the loop,
      while continue starts its next iteration. Loop-variable capture depends on
      the declaration form and language version; follow the linked closure and
      release lessons for that distinction.
  - id: A05-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: LoopVarVersions
widget: LoopVarVersions
examples:
  - A05-main
pitfalls:
  - id: M11
    title: 'Looks right, but…'
    claim: Every loop iteration shares one loop variable.
    explanation: >-
      Current Go gives newly declared loop variables their own iteration values.
      Variables declared outside the loop can still be shared.
    example: A05-main
quiz:
  - id: A05-output
    type: predict-output
    question: What will this example print?
    example: A05-main
    answerFromEngine: true
  - id: A05-concept
    type: multiple-choice
    question: What does continue skip?
    choices:
      - The rest of the current iteration
      - The whole function
    answer: The rest of the current iteration
    explanation: >-
      A condition decides whether another iteration runs. Break leaves the loop,
      while continue starts its next iteration. Loop-variable capture depends on
      the declaration form and language version; follow the linked closure and
      release lessons for that distinction.
  - id: A05-keyword
    type: fill-blank
    question: >-
      Fill the blank in this line: for i := 0; i < 5; i++ { if i == 2 { ___ };
      sum += i }
    answer: continue
    explanation: >-
      Look for continue in the example. A condition decides whether another
      iteration runs. Break leaves the loop, while continue starts its next
      iteration. Loop-variable capture depends on the declaration form and
      language version; follow the linked closure and release lessons for that
      distinction.
deeper:
  - source: u080
  - source: u081
  - source: u095
next:
  - A06
claims:
  - text: >-
      A condition decides whether another iteration runs. Break leaves the loop,
      while continue starts its next iteration. Loop-variable capture depends on
      the declaration form and language version; follow the linked closure and
      release lessons for that distinction.
    sources:
      - u080
      - u081
      - u095
    model: false
estimatedMinutes: 7
try:
  task: Change `continue` to `break`. Predict the new total before you run.
  hint: >-
    `break` leaves the loop completely, so only the turns before `i == 2` add to
    `sum`.
  expect: ^1\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        sum := 0
        for i := 0; i < 5; i++ { if i == 2 { break }; sum += i }
        fmt.Println(sum)
    }
stage: 1
---
A loop is a route that visits the same place again. Follow the instruction marker rather than assuming every line is visited just once.
