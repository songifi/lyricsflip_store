import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as nodemailer from "nodemailer"
import * as handlebars from "handlebars"
import * as fs from "fs"
import * as path from "path"

interface MailOptions {
  to: string
  subject: string
  template: string
  context: Record<string, any>
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("MAIL_HOST"),
      port: this.configService.get<number>("MAIL_PORT"),
      secure: this.configService.get<boolean>("MAIL_SECURE"),
      auth: {
        user: this.configService.get<string>("MAIL_USER"),
        pass: this.configService.get<string>("MAIL_PASSWORD"),
      },
    })
  }

  async sendMail(options: MailOptions): Promise<void> {
    const { to, subject, template, context } = options

    // Read template file
    const templatePath = path.join(__dirname, "..", "..", "..", "templates", "emails", `${template}.hbs`)
    const templateSource = fs.readFileSync(templatePath, "utf8")

    // Compile template
    const compiledTemplate = handlebars.compile(templateSource)
    const html = compiledTemplate(context)

    // Send email
    await this.transporter.sendMail({
      from: this.configService.get<string>("MAIL_FROM"),
      to,
      subject,
      html,
    })
  }
}
