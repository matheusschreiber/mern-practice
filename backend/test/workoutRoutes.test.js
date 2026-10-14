const { test, describe, before, after, beforeEach, mock } = require('node:test')
const assert = require('node:assert/strict')

const express = require('express')
const Workout = require('../models/workoutModel')
const workoutRoutes = require('../routes/workouts')

describe('GET /api/workouts/stats', () => {
  let server
  let baseUrl

  before(async () => {
    const app = express()
    app.use(express.json())
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
  })

  test('is not swallowed by the /:id route and returns the stats', async () => {
    const find = mock.method(Workout, 'find', () => ({
      lean: async () => [
        { title: 'Squat', reps: 5, load: 60 },
        { title: 'Bench', reps: 8, load: 40 },
        { title: 'Row', reps: 10, load: 20 }
      ]
    }))

    const response = await fetch(`${baseUrl}/api/workouts/stats`)
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(find.mock.callCount(), 1)
    assert.equal(body.totalWorkouts, 3)
    assert.equal(body.totalVolume, 820)
    assert.equal(body.medianLoad, 40)
    assert.deepEqual(
      body.byExercise.map((e) => e.title),
      ['Bench', 'Squat', 'Row']
    )
  })

  test('returns zeros when there are no workouts', async () => {
    mock.method(Workout, 'find', () => ({ lean: async () => [] }))

    const response = await fetch(`${baseUrl}/api/workouts/stats`)
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.totalWorkouts, 0)
    assert.deepEqual(body.byExercise, [])
  })
})
