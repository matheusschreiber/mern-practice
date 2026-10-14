import { useEffect, useState } from "react"
import { useWorkoutsContext } from "../hooks/useWorkoutsContext"

// components
import WorkoutDetails from "../components/WorkoutDetails"
import WorkoutForm from "../components/WorkoutForm"
import WorkoutFilters from "../components/WorkoutFilters"

// utils
import { filterAndSortWorkouts } from "../utils/filterWorkouts"

const Home = () => {
  const { workouts, dispatch } = useWorkoutsContext()
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    const fetchWorkouts = async () => {
      const response = await fetch('/api/workouts')
      const json = await response.json()

      if (response.ok) {
        dispatch({type: 'SET_WORKOUTS', payload: json})
      }
    }

    fetchWorkouts()
  }, [dispatch])

  const visibleWorkouts = workouts
    ? filterAndSortWorkouts(workouts, query, sortBy)
    : null

  return (
    <div className="home">
      <div className="workouts">
        <WorkoutFilters
          query={query}
          sortBy={sortBy}
          onQueryChange={setQuery}
          onSortChange={setSortBy}
        />
        {visibleWorkouts && visibleWorkouts.map(workout => (
          <WorkoutDetails workout={workout} key={workout._id} />
        ))}
      </div>
      <WorkoutForm />
    </div>
  )
}

export default Home