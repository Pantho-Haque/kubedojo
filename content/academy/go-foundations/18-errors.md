---
id: A18
title: Errors
track: A
tier: P1
level: Extended
prereqs:
  - A16
subtags:
  - syntax/errors
  - syntax/types
sources:
  - u099
  - u079
bridge: false
goals:
  - Say what `%w` keeps that `%v` throws away
  - Explain what `errors.Is` searches for
  - Add context to an error without hiding its cause
steps:
  - id: A18-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A18-main
  - id: A18-try
    type: try
    text: >-
      Change `%w` to `%v` in the `Errorf` call. Does `errors.Is` still find
      `cause`?
    example: A18-main
  - id: A18-explain
    type: explain
    text: >-
      An error is a value with behavior described by the error interface.
      Wrapping with %w preserves a cause that errors.Is can inspect. Compare
      that explicit result path with a panic, which follows a different control
      flow.
  - id: A18-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: ErrorChain
widget: ErrorChain
examples:
  - A18-main
pitfalls:
  - id: A18-pitfall
    title: 'Looks right, but…'
    claim: >-
      If two errors print the same message, `errors.Is` treats them as the same
      error.
    explanation: >-
      `errors.Is` follows the chain of wrapped error values, not the text. An
      error built with `%v` has the same words but no link back to the original.
    example: A18-main
quiz:
  - id: A18-output
    type: predict-output
    question: What will this example print?
    example: A18-main
    answerFromEngine: true
  - id: A18-concept
    type: multiple-choice
    question: Why wrap with %w rather than only copying the message?
    choices:
      - To preserve an inspectable cause
      - To make every error a panic
    answer: To preserve an inspectable cause
    explanation: >-
      An error is a value with behavior described by the error interface.
      Wrapping with %w preserves a cause that errors.Is can inspect. Compare
      that explicit result path with a panic, which follows a different control
      flow.
  - id: A18-keyword
    type: fill-blank
    question: 'Fill the blank in this line: fmt.Println(___(err, cause))'
    answer: errors.Is
    explanation: >-
      Look for errors.Is in the example. An error is a value with behavior
      described by the error interface. Wrapping with %w preserves a cause that
      errors.Is can inspect. Compare that explicit result path with a panic,
      which follows a different control flow.
deeper:
  - source: u099
  - source: u079
next:
  - A19
claims:
  - text: >-
      An error is a value with behavior described by the error interface.
      Wrapping with %w preserves a cause that errors.Is can inspect. Compare
      that explicit result path with a panic, which follows a different control
      flow.
    sources:
      - u099
      - u079
    model: false
estimatedMinutes: 7
try:
  task: >-
    Change `%w` to `%v` in the `Errorf` call. Does `errors.Is` still find
    `cause`?
  hint: '`%v` copies only the text; the link back to `cause` is gone.'
  expect: ^false\s*$
  solution: |
    package main

    import ("fmt"; "errors")

    func main() {
        cause := errors.New("missing")
        err := fmt.Errorf("load: %v", cause)
        fmt.Println(errors.Is(err, cause))
    }
stage: 4
---
Wrapping an error is like placing a note inside another envelope. Add context without losing the original note, then search the chain for that cause.
