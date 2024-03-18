import { DateTime } from 'luxon'

const startTime = DateTime.now()
console.log(startTime.toISO())

setTimeout(() => {
  const endTime = DateTime.now()
  console.log(endTime.toISO())

  const duration = endTime.diff(startTime)
  console.log(duration.toMillis())

  const formattedDuration = duration.toFormat('hh:mm:ss.SSS')
  console.log(formattedDuration)
}, 5000)