const { test, describe, before, after, beforeEach, mock } = require('node:test')
const assert = require('node:assert/strict')

const express = require('express')
const Workout = require('../models/workoutModel')
const workoutRoutes = require('../routes/workouts')

const ID_1 = '64b7f0c2e4b0a1a2b3c4d5e1'
const ID_2 = '64b7f0c2e4b0a1a2b3c4d5e2'
const ID_3 = '64b7f0c2e4b0a1a2b3c4d5e3'

describe('DELETE /api/workouts', () => {
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

  const bulkDelete = (body) =>
    fetch(`${baseUrl}/api/workouts`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

  test('deletes every workout in the list', async () => {
    const del = mock.method(Workout, 'findOneAndDelete', async ({ _id }) => ({ _id }))

    const response = await bulkDelete({ ids: [ID_1, ID_2, ID_3] })
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.deepEqual(body, { deletedIds: [ID_1, ID_2, ID_3] })
    assert.equal(del.mock.callCount(), 3)
    assert.deepEqual(
      del.mock.calls.map((call) => call.arguments[0]),
      [{ _id: ID_1 }, { _id: ID_2 }, { _id: ID_3 }]
    )
  })

  test('ignores duplicated ids', async () => {
    const del = mock.method(Workout, 'findOneAndDelete', async ({ _id }) => ({ _id }))

    const response = await bulkDelete({ ids: [ID_1, ID_1, ID_2] })
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.deepEqual(body, { deletedIds: [ID_1, ID_2] })
    assert.equal(del.mock.callCount(), 2)
  })

  test('returns 400 when ids is missing, empty or not a list', async () => {
    const del = mock.method(Workout, 'findOneAndDelete', async () => null)

    for (const payload of [{}, { ids: [] }, { ids: ID_1 }, { ids: null }]) {
      const response = await bulkDelete(payload)
      assert.equal(response.status, 400)
    }

    assert.equal(del.mock.callCount(), 0)
  })

  test('returns 400 and lists the invalid ids', async () => {
    const del = mock.method(Workout, 'findOneAndDelete', async () => null)

    const response = await bulkDelete({ ids: [ID_1, 'nope', '123'] })
    const body = await response.json()

    assert.equal(response.status, 400)
    assert.deepEqual(body.invalidIds, ['nope', '123'])
    assert.equal(del.mock.callCount(), 0, 'nothing is deleted when any id is invalid')
  })

  test('still routes DELETE /:id to the single delete handler', async () => {
    const del = mock.method(Workout, 'findOneAndDelete', async ({ _id }) => ({ _id }))

    const response = await fetch(`${baseUrl}/api/workouts/${ID_1}`, { method: 'DELETE' })
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.deepEqual(body, { _id: ID_1 })
    assert.equal(del.mock.callCount(), 1)
  })
})
