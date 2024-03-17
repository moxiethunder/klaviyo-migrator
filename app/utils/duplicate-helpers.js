const emails = [
  'erwinretuta50@gmail.com',
  'jmjones1001@aol.com',
  'clarkl22@bethlehemhigh.org',
  'erwinretuta50@gmail.com',
  'babyshay68@gmail.com',
  'babyshay68@gmail.com',
  'pattiswapcat@yahoo.com',
  'cheripete@aol.com',
  'gavin.jim41@gmail.com',
  'theresa.suber905@gmail.com',
  'babyshay68@gmail.com',
  'dominickrguzman@gmail.com',
  'janessaj420@gmail.com',
  'sejacoby32@gmail.com',
  'breannaperkins500@gmail.com',
  'cztamayo@hotmail.com',
  'hensontwo@gmail.com',
  'jmjones1001@aol.com',
  'spazmom21@gmail.com',
  'jmjones1001@aol.com',
]
const uniqueEmails = [
  'erwinretuta50@gmail.com',
  'clarkl22@bethlehemhigh.org',
  'babyshay68@gmail.com',
  'pattiswapcat@yahoo.com',
  'cheripete@aol.com',
  'gavin.jim41@gmail.com',
  'theresa.suber905@gmail.com',
  'dominickrguzman@gmail.com',
  'janessaj420@gmail.com',
  'sejacoby32@gmail.com',
  'breannaperkins500@gmail.com',
  'cztamayo@hotmail.com',
  'hensontwo@gmail.com',
  'jmjones1001@aol.com',
  'spazmom21@gmail.com',
]

const duplicateEmails = [
  'erwinretuta50@gmail.com',
  'jmjones1001@aol.com',
  'babyshay68@gmail.com',
  'babyshay68@gmail.com',
  'jmjones1001@aol.com',
]

const emailData = {
  all: 20,
  unique: 15,
  duplicates: 5,
  difference: 5,
  duplicateData: {
    'erwinretuta50@gmail.com': 1,
    'jmjones1001@aol.com': 2,
    'babyshay68@gmail.com': 2
  },
  uniqueEmails: [...uniqueEmails],
  duplicateEmails: [...duplicateEmails],
  allEmails: [...emails]
}

const testEmails = () => {
  const uniqueEmails = new Set(emails)
  console.log(uniqueEmails, uniqueEmails.size, emails.length, emails.length - uniqueEmails.size)
}

export default testEmails

// const createPropertyList = (arr, key) => {
//   return arr.map(item => item[key])
// }

// const createUniqueList = arr => {
//   return new Set(arr)
// }





// const getDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) !== index)

// const allEmails = eventObjects.map(event => event.userEmail)
// const allEvents = eventObjects.map(event => event.eventId)
// const allProfiles = eventObjects.map(event => event.profileId)

// const uniqueEmails = new Set(allEmails)
// const uniqueEvents = new Set(allEvents)
// const uniqueProfiles = new Set(allProfiles)

// const duplicateEmails = getDuplicates(allEmails)
// const duplicateEvents = getDuplicates(allEvents)
// const duplicateProfiles = getDuplicates(allProfiles)

// const duplicates = {
  //   emails: {
    //     all: allEmails.length,
    //     unique: uniqueEmails.size,
    //     difference: allEmails.length - uniqueEmails.size,
    //     duplicates: duplicateEmails,
    //   },
    //   events: {
      //     all: allEvents.length,
      //     unique: uniqueEvents.size,
      //     difference: allEvents.length - uniqueEvents.size,
      //     duplicates: duplicateEvents,
      //   },
      //   profiles: {
        //     all: allProfiles.length,
        //     unique: uniqueProfiles.size,
        //     difference: allProfiles.length - uniqueProfiles.size,
        //     duplicates: duplicateProfiles,
        //   },
        // }
        
        // console.log(duplicates)
        
// export { createPropertyList, createUniqueList }