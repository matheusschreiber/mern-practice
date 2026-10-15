import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Home from '../pages/Home'
import { WorkoutsContextProvider } from '../context/WorkoutsContext'

const makeWorkouts = () => [
  { _id: 'a', title: 'Squat', load: 60, reps: 5, createdAt: '2024-03-03T10:00:00Z' },
  { _id: 'b', title: 'Bench Press', load: 80, reps: 8, createdAt: '2024-03-02T10:00:00Z' },
  { _id: 'c', title: 'Deadlift', load: 100, reps: 3, createdAt: '2024-03-10T10:00:00Z' }
]

let workouts

beforeEach(() => {
  workouts = makeWorkouts()

  global.fetch = jest.fn((url, options = {}) => {
    if (options.method === 'DELETE') {
      const id = url.split('/').pop()
      const deleted = workouts.find((w) => w._id === id)
      workouts = workouts.filter((w) => w._id !== id)
      return Promise.resolve({ ok: true, json: () => Promise.resolve(deleted) })
    }
    if (options.method === 'POST') {
      const body = JSON.parse(options.body)
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          _id: 'new',
          title: body.title,
          load: Number(body.load),
          reps: Number(body.reps),
          createdAt: '2024-03-04T10:00:00Z',
        }),
      })
    }

    return Promise.resolve({ ok: true, json: () => Promise.resolve(workouts) })
  })
})

afterEach(() => {
  jest.restoreAllMocks()
})

const renderHome = async () => {
  render(
    <WorkoutsContextProvider>
      <Home />
    </WorkoutsContextProvider>
  )

  await screen.findByText('Squat')
}

const titles = () =>
  screen.getAllByRole('heading', { level: 4 }).map((h) => h.textContent)

const card = (title) => screen.getByText(title).closest('.workout-details')

describe('workout cards', () => {
  test('renders one card per workout', async () => {
    await renderHome()

    expect(titles()).toEqual(['Squat', 'Bench Press', 'Deadlift'])
  })

  test('cards start collapsed', async () => {
    await renderHome()

    expect(screen.queryByText(/Volume \(kg\)/)).not.toBeInTheDocument()
    expect(screen.getAllByText('Show details')).toHaveLength(3)
  })

  test('shows the details of a card when its button is clicked', async () => {
    await renderHome()

    userEvent.click(within(card('Bench Press')).getByText('Show details'))

    expect(within(card('Bench Press')).getByText('640')).toBeInTheDocument()
    expect(within(card('Bench Press')).getByText(/Added on/)).toBeInTheDocument()
    expect(within(card('Bench Press')).getByText('3/2/2024')).toBeInTheDocument()
    expect(within(card('Bench Press')).getByText(/Volume/)).toBeInTheDocument()
    expect(within(card('Squat')).queryByText(/Volume/)).not.toBeInTheDocument()
    expect(within(card('Deadlift')).queryByText('3/10/2024')).not.toBeInTheDocument()
  })

  test('hides the details again', async () => {
    await renderHome()

    userEvent.click(within(card('Squat')).getByText('Show details'))
    userEvent.click(within(card('Squat')).getByText('Hide details'))

    expect(screen.queryByText(/Volume \(kg\)/)).not.toBeInTheDocument()
  })

  test('deleting a workout removes its card', async () => {
    await renderHome()

    userEvent.click(within(card('Bench Press')).getByText('delete'))

    await waitFor(() =>
      expect(screen.queryByText('Bench Press')).not.toBeInTheDocument()
    )
    expect(titles()).toEqual(['Squat', 'Deadlift'])
    expect(global.fetch).toHaveBeenCalledWith('/api/workouts/b', { method: 'DELETE' })
  })

  test('deleted workout should not change the other cards and they should still appear collapsed', async () => {
    await renderHome()

    userEvent.click(within(card('Squat')).getByText('Show details'))
    expect(within(card('Squat')).getByText(/Volume \(kg\)/)).toBeInTheDocument()

    userEvent.type(screen.getByPlaceholderText('title'), 'Squat2')
    userEvent.type(screen.getByPlaceholderText('load'), '100')
    userEvent.type(screen.getByPlaceholderText('reps'), '3')
    userEvent.click(screen.getByText('Add Workout'))
    await screen.findByText('Squat2')
    expect(screen.getByText('Squat2')).toBeInTheDocument()

    expect(within(card('Squat')).getByText(/Volume \(kg\)/)).toBeInTheDocument()
    expect(within(card('Squat2')).queryByText(/Volume \(kg\)/)).not.toBeInTheDocument()
  })
})
