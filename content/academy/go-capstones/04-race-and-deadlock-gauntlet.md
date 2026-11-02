---
id: F04
title: Race and deadlock gauntlet
track: F
tier: P2
level: Advanced
prereqs: []
subtags:
  - conc/model
  - conc/patterns
  - conc/sync
sources:
  - u066
  - u067
  - u073
bridge: false
goals:
  - Say why the mutex removes the race but cannot prevent a deadlock
  - Explain what happens if `wg.Add` says 3 but only 2 goroutines run
  - 'Check both things: no race, and every goroutine finishes'
steps:
  - id: F04-predict
    type: predict
    text: >-
      Before running, predict the output of this program. Then commit your
      prediction.
    example: F04-main
  - id: F04-try
    type: try
    text: >-
      Run three workers: change `wg.Add(2)` to `wg.Add(3)` and `i<2` to `i<3`.
      Predict `x`.
    example: F04-main
  - id: F04-explain
    type: explain
    text: >-
      A program can finish without deadlocking and still race, or be race-free
      and wait forever. This project checks each problem separately. Hints come
      in steps, so you can find the cause yourself.
  - id: F04-simulate
    type: simulate
    text: >-
      Inspect the relevant values or model events, then replay backward to check
      your explanation.
    widget: GenericStepper
widget: GenericStepper
examples:
  - F04-main
pitfalls:
  - id: F04-pitfall
    title: 'Looks right, but…'
    claim: 'Once my program stops deadlocking, it is correct.'
    explanation: >-
      A program can finish every time and still race on shared data. Check for
      races and for stuck goroutines separately.
    example: F04-main
quiz:
  - id: F04-output
    type: predict-output
    question: What will this example print?
    example: F04-main
    answerFromEngine: true
  - id: F04-concept
    type: multiple-choice
    question: Does fixing a deadlock automatically remove every data race?
    choices:
      - 'No, they are different properties'
      - 'Yes, one fix proves both'
    answer: 'No, they are different properties'
    explanation: >-
      A program can finish without deadlocking and still race, or be race-free
      and wait forever. This project checks each problem separately. Hints come
      in steps, so you can find the cause yourself.
  - id: F04-keyword
    type: fill-blank
    question: 'Fill the blank in this line: var mu sync.___;var wg sync.WaitGroup'
    answer: Mutex
    explanation: >-
      Look for Mutex in the example. A program can avoid deadlock while still
      racing, or avoid a race while waiting forever. The project checks each
      property explicitly in the teaching model. Hints are graduated so the
      diagnosis belongs to the learner.
deeper:
  - source: u066
  - source: u067
  - source: u073
next:
  - F05
claims:
  - text: >-
      A program can finish without deadlocking and still race, or be race-free
      and wait forever. This project checks each problem separately. Hints come
      in steps, so you can find the cause yourself.
    sources:
      - u066
      - u067
      - u073
    model: true
estimatedMinutes: 7
capstone:
  starter: |
    package main

    import ("fmt"; "sync")

    func main() {
        var wg sync.WaitGroup
        x:=0;wg.Add(2)
        for i:=0;i<2;i++ {go func(){x++;wg.Done()}()}
        wg.Wait();fmt.Println(x)
    }
  solution: F04-main
  goal:
    stdout: '2'
    exitStatus: 0
    noRaces: true
  hints:
    - A correct final number does not prove that shared access is synchronized.
    - Check the teaching race report for conflicting writes.
    - Use one shared mutex around every access that changes the counter.
try:
  task: >-
    Run three workers: change `wg.Add(2)` to `wg.Add(3)` and `i<2` to `i<3`.
    Predict `x`.
  hint: >-
    Keep the two numbers in step; if `Add` is bigger than the number of workers,
    `Wait` blocks forever.
  expect: ^3\s*$
  solution: |
    package main

    import ("fmt"; "sync")

    func main() {
        var mu sync.Mutex;var wg sync.WaitGroup
        x:=0;wg.Add(3)
        for i:=0;i<3;i++ {go func(){mu.Lock();x++;mu.Unlock();wg.Done()}()}
        wg.Wait();fmt.Println(x)
    }
stage: 0
---
The gauntlet is a set of traffic puzzles with more than one failure mode. Repair a rule, rerun, and check both race evidence and whether work can finish.
