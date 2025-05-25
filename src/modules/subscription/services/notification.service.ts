@Injectable()
export class NotificationService {
  constructor(private readonly mailService: MailService) {}

  async sendRenewalReminder(user: User) {
    await this.mailService.sendMail({
      to: user.email,
      subject: 'Subscription Renewal Reminder',
      text: `Hi ${user.name}, your subscription will expire soon.`
    });
  }
}
