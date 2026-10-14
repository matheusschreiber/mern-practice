import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Home from '../pages/Home'
import { WorkoutsContextProvider } from '../context/WorkoutsContext'

const makeWorkouts = () => [
  { _id: '1', title: 'Squat', load: 60, reps: 5, createdAt: '2024-03-03T10:00:00Z' },
  { _id: '2', title: 'Bench Press', load: 80, reps: 8, createdAt: '2024-03-02T10:00:00Z' },
  { _id: '3', title: 'Deadlift', load: 100, reps: 3, createdAt: '2024-03-01T10:00:00Z' }
]

const renderHome = async () => {
  render(
    <WorkoutsContextProvider>
      <Home />
    </WorkoutsContextProvider>
  )

  // wait for the workouts to be fetched and rendered
  await screen.findByText('Squat')
}

const shownTitles = () =>
  screen.getAllByRole('heading', { level: 4 }).map((h) => h.textContent)

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(makeWorkouts()) })
  )
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('Home search and sort', () => {
  test('shows the workouts newest first by default', async () => {
    await renderHome()

    expect(shownTitles()).toEqual(['Squat', 'Bench Press', 'Deadlift'])
    expect(global.fetch).toHaveBeenCalledWith('/api/workouts')
  })

  test('filters the workouts while typing in the search box', async () => {
    await renderHome()

    userEvent.type(screen.getByLabelText('Search workouts'), 'bench')

    expect(shownTitles()).toEqual(['Bench Press'])
  })

  test('shows everything again when the search box is cleared', async () => {
    await renderHome()
    const search = screen.getByLabelText('Search workouts')

    userEvent.type(search, 'bench')
    userEvent.clear(search)

    expect(shownTitles()).toEqual(['Squat', 'Bench Press', 'Deadlift'])
  })

  test('sorts by heaviest load', async () => {
    await renderHome()

    userEvent.selectOptions(screen.getByLabelText('Sort workouts'), 'heaviest')

    expect(shownTitles()).toEqual(['Deadlift', 'Bench Press', 'Squat'])
  })

  test('sorts by most reps', async () => {
    await renderHome()

    userEvent.selectOptions(screen.getByLabelText('Sort workouts'), 'reps')

    expect(shownTitles()).toEqual(['Bench Press', 'Squat', 'Deadlift'])
  })

  test('keeps the search when the sort changes', async () => {
    await renderHome()

    userEvent.type(screen.getByLabelText('Search workouts'), 'e')
    userEvent.selectOptions(screen.getByLabelText('Sort workouts'), 'heaviest')

    // "Squat" has no "e", so only the other two stay, heaviest first
    expect(shownTitles()).toEqual(['Deadlift', 'Bench Press'])
  })

  test('changes sort back to newest', async () => {
    await renderHome()
    
    userEvent.selectOptions(screen.getByLabelText('Sort workouts'), 'reps')
    expect(shownTitles()).toEqual(['Bench Press', 'Squat', 'Deadlift'])

    userEvent.selectOptions(screen.getByLabelText('Sort workouts'), 'newest')
    expect(shownTitles()).toEqual(['Squat', 'Bench Press', 'Deadlift'])
  })
})
