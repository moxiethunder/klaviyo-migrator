class ServiceContainer {
  constructor() {
    this.services = {}
  }

  register(name, service) {
    this.services[name] = service
  }

  get(name) {
    if ( !this.services[name] ) throw new Error(`Service ${name} not found`)
    return this.services[name]
  }

  list() {
    return Object.keys(this.services)
  }
}

export default ServiceContainer