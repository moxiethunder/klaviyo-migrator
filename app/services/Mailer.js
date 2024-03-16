import nodemailer from 'nodemailer'

class Mailer {
  constructor(config) {
    this.transporter = nodemailer.createTransport(config)
  }
}

export default Mailer