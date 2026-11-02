---
id: A09
title: Strings
track: A
tier: P0
level: Core
prereqs:
  - A03
  - A07
subtags:
  - syntax/strings
  - syntax/types
sources:
  - u098
  - u074
bridge: false
goals:
  - Say why `len("héllo")` is 6 when you can see only 5 letters
  - Explain why the `range` loop skips byte offset 2
  - 'Count characters with `len([]rune(s))` instead of `len(s)`'
steps:
  - id: A09-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: A09-main
  - id: A09-try
    type: try
    text: >-
      Change `"héllo"` to `"hello"` (plain e). Predict the first line and the
      offsets the loop prints.
    example: A09-main
  - id: A09-explain
    type: explain
    text: >-
      String length counts bytes. Ranging over a string decodes runes and
      reports byte offsets. Strings are immutable; a byte slice conversion gives
      you a mutable sequence whose behavior can be inspected separately.
  - id: A09-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: StringBytesInspector
widget: StringBytesInspector
examples:
  - A09-main
pitfalls:
  - id: M06
    title: 'Looks right, but…'
    claim: String length counts visible characters.
    explanation: >-
      len counts bytes in a string. Rune count and visible character count are
      different questions.
    example: A09-byte-boundary
  - id: M07
    title: 'Looks right, but…'
    claim: A string can be edited through an index.
    explanation: >-
      String contents are immutable. A byte or rune conversion gives editable
      storage; changing that storage does not edit the original string.
    example: A09-main
quiz:
  - id: A09-output
    type: predict-output
    question: What will this example print?
    example: A09-main
    answerFromEngine: true
  - id: A09-concept
    type: multiple-choice
    question: What does len of a string measure?
    choices:
      - Bytes
      - Visible characters
    answer: Bytes
    explanation: >-
      String length counts bytes. Ranging over a string decodes runes and
      reports byte offsets. Strings are immutable; a byte slice conversion gives
      you a mutable sequence whose behavior can be inspected separately.
  - id: A09-keyword
    type: fill-blank
    question: 'Fill the blank in this line: fmt.Println(len(s), len([]___(s)))'
    answer: rune
    explanation: >-
      Look for rune in the example. String length counts bytes. Ranging over a
      string decodes runes and reports byte offsets. Strings are immutable; a
      byte slice conversion gives you a mutable sequence whose behavior can be
      inspected separately.
deeper:
  - source: u098
  - source: u074
next:
  - A10
claims:
  - text: >-
      String length counts bytes. Ranging over a string decodes runes and
      reports byte offsets. Strings are immutable; a byte slice conversion gives
      you a mutable sequence whose behavior can be inspected separately.
    sources:
      - u098
      - u074
    model: false
estimatedMinutes: 7
try:
  task: >-
    Change `"héllo"` to `"hello"` (plain e). Predict the first line and the
    offsets the loop prints.
  hint: 'Every letter in plain `hello` is one byte, so bytes and runes now agree.'
  expect: ^5 5\s
  solution: |
    package main

    import "fmt"

    func main() {
        s := "hello"
        fmt.Println(len(s), len([]rune(s)))
        for i, r := range s { fmt.Println(i, r) }
    }
stage: 2
---
Text is a row of encoded tiles, and a visible character can occupy several tiles. Count bytes and then walk the decoded runes to see the difference.
