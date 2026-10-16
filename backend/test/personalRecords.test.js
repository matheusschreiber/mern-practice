const { test, describe, before, after, beforeEach, mock } = require('node:test')
const assert = require('node:assert/strict')

const express = require('express')
const Workout = require('../models/workoutModel')
const workoutRoutes = require('../routes/workouts')
const { personalRecords } = require('../utils/personalRecords')

const makeWorkouts = () => [
  { title: 'Squat', load: 100, reps: 5 },
  { title: 'squat ', load: 120, reps: 3 },
  { title: 'Bench Press', load: 80, reps: 8 },
  { title: 'Bench Press', load: 70, reps: 10 },
  { title: 'Deadlift', load: 140, reps: 2 },
  { title: 'Row', load: 60, reps: 12 },
  { title: 'Curl', load: 20, reps: 15 }
]

describe('personalRecords', () => {
  test('returns an empty list when there are no workouts', () => {
    assert.deepEqual(personalRecords([]), [])
  })

  test('keeps only the heaviest workout of each exercise', () => {
    const records = personalRecords(makeWorkouts(), 10)
    const bench = records.filter((r) => r.title === 'Bench Press')

    assert.deepEqual(bench, [{ title: 'Bench Press', load: 80, reps: 8 }])
  })

  test('groups exercises ignoring case and surrounding spaces', () => {
    const records = personalRecords(makeWorkouts(), 10)
    const squats = records.filter((r) => r.title.toLowerCase() === 'squat')

    assert.deepEqual(squats, [{ title: 'squat', load: 120, reps: 3 }])
  })

  test('sorts the records heaviest first', () => {
    const records = personalRecords(makeWorkouts(), 10)

    assert.equal(records[0].title, 'Deadlift')
    assert.equal(records[1].title, 'squat')
  })

  test('limits the amount of records', () => {
    const records = personalRecords(makeWorkouts(), 2)

    assert.ok(records.length <= 2)
  })

  test('returns every exercise when there are fewer than the limit', () => {
    const records = personalRecords(
      [
        { title: 'Squat', load: 100, reps: 5 },
        { title: 'Bench Press', load: 80, reps: 8 }
      ],
      5
    )

    assert.equal(records.length, 2)
  })
})

describe('GET /api/workouts/records', () => {
  let server
  let baseUrl

  before(async () => {
    const app = express()
    app.use('/api/workouts', workoutRoutes)

    await new Promise((resolve) => {
      server = app.listen(0, resolve)
    })
    baseUrl = `http://127.0.0.1:${server.address().port}`
  })

  after(() => {
    server.close()
  })

  beforeEach(() => {
    mock.restoreAll()
    mock.method(Workout, 'find', () => ({ lean: async () => makeWorkouts() }))
  })

  test('is not swallowed by the /:id route', async () => {
    const response = await fetch(`${baseUrl}/api/workouts/records`)

    assert.equal(response.status, 200)
    assert.ok(Array.isArray(await response.json()))
  })

  test('puts the heaviest exercise first', async () => {
    const response = await fetch(`${baseUrl}/api/workouts/records?limit=4`)
    const body = await response.json()

    assert.equal(body[0].title, 'Deadlift')
  })

  test('rejects an invalid limit', async () => {
    for (const limit of ['0', '-1', 'abc', '2.5']) {
      const response = await fetch(`${baseUrl}/api/workouts/records?limit=${limit}`)
      assert.equal(response.status, 400, `limit=${limit} should be rejected`)
    }
  })
})
