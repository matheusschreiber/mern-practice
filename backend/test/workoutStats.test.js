const { test, describe } = require('node:test')
const assert = require('node:assert/strict')

const { computeStats, median } = require('../utils/workoutStats')

const workouts = [
  { title: 'Squat', reps: 5, load: 60 },
  { title: 'squat ', reps: 5, load: 80 },
  { title: 'Bench', reps: 8, load: 40 },
  { title: 'Row', reps: 10, load: 20 }
]

describe('median', () => {
  test('returns 0 for an empty list', () => {
    assert.equal(median([]), 0)
  })

  test('returns the middle value for an odd amount of numbers', () => {
    assert.equal(median([60, 20, 40]), 40)
  })

  test('averages the two middle values for an even amount of numbers', () => {
    assert.equal(median([80, 20, 60, 40]), 50)
  })

  test('does not mutate its input', () => {
    const input = [60, 20, 40]
    median(input)
    assert.deepEqual(input, [60, 20, 40])
  })
})

describe('computeStats', () => {
  test('returns zeros for no workouts', () => {
    assert.deepEqual(computeStats([]), {
      totalWorkouts: 0,
      totalVolume: 0,
      maxLoad: 0,
      averageReps: 0,
      medianLoad: 0,
      byExercise: []
    })
  })

  test('computes the overall numbers', () => {
    const stats = computeStats(workouts)

    assert.equal(stats.totalWorkouts, 4)
    assert.equal(stats.totalVolume, 1220)
    assert.equal(stats.maxLoad, 80)
    assert.equal(stats.averageReps, 7)
    assert.equal(stats.medianLoad, 50)
  })

  test('rounds the average reps to one decimal', () => {
    const stats = computeStats([
      { title: 'Squat', reps: 5, load: 60 },
      { title: 'Squat', reps: 5, load: 60 },
      { title: 'Squat', reps: 6, load: 60 }
    ])

    assert.equal(stats.averageReps, 5.3)
  })

  test('groups exercises ignoring case and surrounding spaces', () => {
    const { byExercise } = computeStats(workouts)
    const squat = byExercise.find((e) => e.title === 'Squat')

    assert.deepEqual(squat, {
      title: 'Squat',
      count: 2,
      totalVolume: 700,
      maxLoad: 80
    })
  })

  test('sorts exercises by total volume, then by title', () => {
    const { byExercise } = computeStats([
      ...workouts,
      { title: 'Curl', reps: 10, load: 20 } // same volume as Row
    ])

    assert.deepEqual(
      byExercise.map((e) => e.title),
      ['Squat', 'Bench', 'Curl', 'Row']
    )
  })

  test('does not mutate the workouts it receives', () => {
    const input = workouts.map((w) => ({ ...w }))
    computeStats(input)
    assert.deepEqual(input, workouts)
  })
})
