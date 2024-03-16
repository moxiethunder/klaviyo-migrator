class DatabaseError extends Error {
  constructor(message) {
    super(message)
    this.name = 'DatabaseError'
  }
}

class RequestError extends Error {
  constructor(message, meta, stack, cause) {
    super(message)
    this.name = 'RequestError'
    this.meta = meta
    this.customStack = stack
    this.causedBy = cause
  }
}

export { DatabaseError, RequestError }
