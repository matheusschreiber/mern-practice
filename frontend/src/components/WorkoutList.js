import WorkoutDetails from './WorkoutDetails'

const WorkoutList = ({ workouts }) => {
  return (
    <>
      {workouts.map((workout, index) => (
        <WorkoutDetails workout={workout} key={index} />
      ))}
    </>
  )
}

export default WorkoutList
