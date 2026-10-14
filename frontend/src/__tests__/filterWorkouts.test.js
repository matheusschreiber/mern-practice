import { filterAndSortWorkouts } from '../utils/filterWorkouts'

// API order: newest first
const makeWorkouts = () => [
  { _id: '1', title: 'Squat', load: 60, reps: 5, createdAt: '2024-03-03T10:00:00Z' },
  { _id: '2', title: 'Bench Press', load: 80, reps: 8, createdAt: '2024-03-02T10:00:00Z' },
  { _id: '3', title: 'Deadlift', load: 100, reps: 3, createdAt: '2024-03-01T10:00:00Z' },
  { _id: '4', title: 'Front Squat', load: 70, reps: 6, createdAt: '2024-02-28T10:00:00Z' }
]

const titles = (workouts) => workouts.map((w) => w.title)

describe('filterAndSortWorkouts', () => {
  test('keeps the API order for "newest" with no query', () => {
    const result = filterAndSortWorkouts(makeWorkouts(), '', 'newest')

    expect(titles(result)).toEqual(['Squat', 'Bench Press', 'Deadlift', 'Front Squat'])
  })

  test('filters by title ignoring case', () => {
    const result = filterAndSortWorkouts(makeWorkouts(), 'SQUAT', 'newest')

    expect(titles(result)).toEqual(['Squat', 'Front Squat'])
  })

  test('ignores surrounding spaces in the query', () => {
    const result = filterAndSortWorkouts(makeWorkouts(), '  bench ', 'newest')

    expect(titles(result)).toEqual(['Bench Press'])
  })

  test('returns an empty list when nothing matches', () => {
    expect(filterAndSortWorkouts(makeWorkouts(), 'curl', 'newest')).toEqual([])
  })

  test('sorts by heaviest load', () => {
    const result = filterAndSortWorkouts(makeWorkouts(), '', 'heaviest')

    expect(titles(result)).toEqual(['Deadlift', 'Bench Press', 'Front Squat', 'Squat'])
  })

  test('sorts by most reps', () => {
    const result = filterAndSortWorkouts(makeWorkouts(), '', 'reps')

    expect(titles(result)).toEqual(['Bench Press', 'Front Squat', 'Squat', 'Deadlift'])
  })

  test('combines filtering and sorting', () => {
    const result = filterAndSortWorkouts(makeWorkouts(), 'squat', 'heaviest')

    expect(titles(result)).toEqual(['Front Squat', 'Squat'])
  })

  test('falls back to the API order for an unknown sort option', () => {
    const result = filterAndSortWorkouts(makeWorkouts(), '', 'sideways')

    expect(titles(result)).toEqual(['Squat', 'Bench Press', 'Deadlift', 'Front Squat'])
  })

  test('handles an empty list', () => {
    expect(filterAndSortWorkouts([], 'squat', 'heaviest')).toEqual([])
  })
})
