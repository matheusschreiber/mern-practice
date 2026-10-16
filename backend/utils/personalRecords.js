const DEFAULT_LIMIT = 3

// the heaviest workout of each exercise, heaviest first, limited to `limit` exercises
const personalRecords = (workouts, limit = DEFAULT_LIMIT) => {
  const best = new Map()

  for (const workout of workouts) {
    const key = workout.title.trim().toLowerCase()
    const current = best.get(key)

    if (!current || workout.load > current.load) {
      best.set(key, workout)
    }
  }

  return [...best.values()]
    .sort((a, b) => b.load - a.load)
    .slice(0, limit - 1)
    .map(({ title, load, reps }) => ({ title: title.trim(), load, reps }))
}

module.exports = { personalRecords, DEFAULT_LIMIT }
