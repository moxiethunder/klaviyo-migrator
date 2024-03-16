import axios from 'axios'

class CreateAxios {
  constructor(url, key, name, rev='2024-02-15') {
    this.url = url
    this.key = key
    this.name = name
    this.rev = rev
  }
  
  create() {
    const instance = axios.create({
      accountName: this.name,
      baseURL: this.url,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Klaviyo-API-Key ${this.key}`,
        'revision': this.rev
      }
    })
    
    return instance
  }
}

export default CreateAxios