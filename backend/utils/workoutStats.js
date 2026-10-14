// median of a list of numbers (0 for an empty list)
const median = (numbers) => {
  if (numbers.length === 0) {
    return 0
  }

  const sorted = [...numbers].sort()
  const mid = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

const round = (value, digits = 1) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

// summarise a list of workouts ({ title, reps, load })
const computeStats = (workouts) => {
  if (workouts.length === 0) {
    return {
      totalWorkouts: 0,
      totalVolume: 0,
      maxLoad: 0,
      averageReps: 0,
      medianLoad: 0,
      byExercise: []
    }
  }

  const byTitle = new Map()

  for (const { title, reps, load } of workouts) {
    const key = title.trim().toLowerCase()
    const entry = byTitle.get(key) || {
      title: title.trim(),
      count: 0,
      totalVolume: 0,
      maxLoad: 0
    }

    entry.count += 1
    entry.totalVolume += reps * load
    entry.maxLoad = Math.max(entry.maxLoad, load)

    byTitle.set(key, entry)
  }

  const byExercise = [...byTitle.values()].sort(
    (a, b) => b.totalVolume - a.totalVolume || a.title.localeCompare(b.title)
  )

  const loads = workouts.map((w) => w.load)

  return {
    totalWorkouts: workouts.length,
    totalVolume: workouts.reduce((sum, w) => sum + w.reps * w.load, 0),
    maxLoad: Math.max(...loads),
    averageReps: round(
      workouts.reduce((sum, w) => sum + w.reps, 0) / workouts.length
    ),
    medianLoad: median(loads),
    byExercise
  }
}

module.exports = { computeStats, median }
