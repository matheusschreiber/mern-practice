import { SORT_OPTIONS } from '../utils/filterWorkouts'

const WorkoutFilters = ({ query, sortBy, onQueryChange, onSortChange }) => {
  return (
    <div className="workout-filters">
      <input
        type="search"
        placeholder="Search by title"
        aria-label="Search workouts"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />

      <select
        aria-label="Sort workouts"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default WorkoutFilters
