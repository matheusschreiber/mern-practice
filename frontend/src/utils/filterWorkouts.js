// "newest" keeps the order the API returned (newest first), so it has no sorter
const SORTERS = {
  heaviest: (a, b) => b.load - a.load,
  reps: (a, b) => b.reps - a.reps
}

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'heaviest', label: 'Heaviest load' },
  { value: 'reps', label: 'Most reps' }
]

// filter workouts by title (case-insensitive) and order them
export const filterAndSortWorkouts = (workouts, query, sortBy) => {
  const normalizedQuery = query.trim().toLowerCase()

  const matches = normalizedQuery
    ? workouts.filter((w) => w.title.toLowerCase().includes(normalizedQuery))
    : workouts

  const sorter = SORTERS[sortBy]

  return sorter ? matches.sort(sorter) : matches
}
