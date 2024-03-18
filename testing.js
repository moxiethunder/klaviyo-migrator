import { DateTime } from 'luxon'

// console.log('DateTime from ISO: 2024-05-01')
// console.log(date)

// const startTime = DateTime.now()
// console.log(startTime.toISO())
const now = DateTime.now()
console.log('NOW: ', now)
const date = DateTime.fromISO('2024-05-01')
console.log('DATE: ', date)
const daysPassed = now.diff(date, 'days').days
console.log('DAYS PASSED: ',daysPassed)
const secondsPassed = now.minus({ days: daysPassed }).toSeconds()
console.log('SECONDS PASSED: ', secondsPassed)

setTimeout(() => {

  // const endTime = DateTime.now()
  // console.log(endTime.toISO())

  // const duration = endTime.diff(startTime)
  // console.log(duration.toMillis())

  // const formattedDuration = duration.toFormat('hh:mm:ss.SSS')
  // console.log(formattedDuration)
}, 5000)