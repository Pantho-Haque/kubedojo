---
id: E06
title: 'Releases: what changed when'
track: E
tier: P1
level: Extended
prereqs: []
subtags:
  - memory/gc
  - memory/releases
  - sched/preempt
sources:
  - u043
  - u044
  - u045
  - u046
  - u060
  - u061
  - u042
bridge: false
goals:
  - Say which Go version gave each loop turn its own `i`
  - Predict what closures saved inside a loop print today
  - Check a claim's Go version before trusting it
steps:
  - id: E06-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: E06-main
  - id: E06-try
    type: try
    text: >-
      Save a closure on each turn that prints `i*10`, then call them all after
      the loop. Before Go 1.22 this printed 30 three times. What does it print
      now?
    example: E06-main
  - id: E06-explain
    type: explain
    text: >-
      Release notes record what changed in each Go version. gothik follows
      current Go, where each loop turn gets a fresh loop variable (since Go
      1.22). It has no switch for older behavior; the linked readings cover
      version-specific details.
  - id: E06-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: ReleaseTimeline
widget: ReleaseTimeline
examples:
  - E06-main
pitfalls:
  - id: M11
    title: 'Looks right, but…'
    claim: Every loop iteration shares one loop variable.
    explanation: >-
      Current Go gives newly declared loop variables their own iteration values.
      Variables declared outside the loop can still be shared.
    example: A05-main
quiz:
  - id: E06-output
    type: predict-output
    question: What will this example print?
    example: E06-main
    answerFromEngine: true
  - id: E06-concept
    type: multiple-choice
    question: What should accompany an implementation-specific claim?
    choices:
      - Its source and version
      - A promise that it never changes
    answer: Its source and version
    explanation: >-
      Release notes record what changed in each Go version. gothik follows
      current Go, where each loop turn gets a fresh loop variable (since Go
      1.22). It has no switch for older behavior; the linked readings cover
      version-specific details.
  - id: E06-keyword
    type: fill-blank
    question: 'Fill the blank in this line: for i:=0; i<3; i++ { ___(i) }'
    answer: fmt.Println
    explanation: >-
      Look for version in the example. Read the captured release notes to
      identify documented changes. The interpreter uses current loop-variable
      behavior. No old-runtime toggle or speculative release behavior is
      shipped; version-specific native details remain in the linked source
      readings.
deeper:
  - source: u043
  - source: u044
  - source: u045
  - source: u046
  - source: u060
  - source: u061
  - source: u042
next:
  - F01
claims:
  - text: >-
      Release notes record what changed in each Go version. gothik follows
      current Go, where each loop turn gets a fresh loop variable (since Go
      1.22). It has no switch for older behavior; the linked readings cover
      version-specific details.
    sources:
      - u043
      - u044
      - u045
      - u046
      - u060
      - u061
      - u042
    model: true
estimatedMinutes: 7
try:
  task: >-
    Save a closure on each turn that prints `i*10`, then call them all after the
    loop. Before Go 1.22 this printed 30 three times. What does it print now?
  hint: >-
    Since Go 1.22, each turn of a `for i := ...` loop gets a fresh `i`, so each
    closure keeps its own.
  expect: ^0\s+10\s+20\s*$
  solution: |
    package main

    import "fmt"

    func main() {
        var fs []func()
        for i:=0; i<3; i++ { fs = append(fs, func(){ fmt.Println(i*10) }) }
        for _, f := range fs { f() }
    }
stage: 2
---
A release note is a date on a rulebook. Read the date before deciding whether an older explanation still describes the behavior you are learning.
