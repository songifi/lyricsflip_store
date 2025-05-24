// src/services/notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Purchase } from './entities/purchase_entity';

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface NotificationData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private configService: ConfigService) {}

  // Stub implementation for push notifications - replace with actual logic
  async sendPushNotification(userId: string, payload: { title: string; body: string; data?: Record<string, any> }): Promise<void> {
    this.logger.log(`Sending push notification to user ${userId} with title "${payload.title}"`);
    // Simulate async operation
    return Promise.resolve();
  }

  // Stub implementation for sendEmail - replace with actual email sending logic
  async sendEmail(notificationData: NotificationData): Promise<void> {
    // You can integrate with an email provider here
    this.logger.log(`Sending email to ${notificationData.to} with subject "${notificationData.subject}"`);
    // Simulate async operation
    return Promise.resolve();
  }

  private generatePurchaseConfirmationTemplate(purchase: Purchase): EmailTemplate {
    return {
      subject: `Your Purchase Confirmation - Order #${purchase.orderNumber}`,
      htmlContent: `<p>Thank you for your purchase, ${purchase.buyer.firstName}!</p>
        <p>Your order <strong>#${purchase.orderNumber}</strong> has been confirmed.</p>`,
      textContent: `Thank you for your purchase, ${purchase.buyer.firstName}!\nYour order #${purchase.orderNumber} has been confirmed.`
    };
  }

  async sendPurchaseConfirmation(purchase: Purchase): Promise<void> {
    try {
      const template = this.generatePurchaseConfirmationTemplate(purchase);
      
      await this.sendEmail({
        to: purchase.buyer.email,
        subject: template.subject,
        template: 'purchase-confirmation',
        data: {
          purchase,
          downloadLinks: await this.getDownloadLinks(purchase),
        },
      });

      // Send push notification if user has enabled them
      await this.sendPushNotification(purchase.buyerId, {
        title: 'Purchase Confirmed',
        body: `Your order ${purchase.orderNumber} has been confirmed!`,
        data: { purchaseId: purchase.id },
      });

      this.logger.log(`Purchase confirmation sent for order: ${purchase.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send purchase confirmation: ${error.message}`, error.stack);
    }
  }

  private generateGiftNotificationTemplate(purchase: Purchase): EmailTemplate {
    return {
      subject: `You've received a gift! - Order #${purchase.orderNumber}`,
      htmlContent: `<p>Hi ${purchase.recipient?.firstName},</p>
        <p>${purchase.buyer.firstName} ${purchase.buyer.lastName} has sent you a gift!</p>
        <p>Order <strong>#${purchase.orderNumber}</strong> is now available for you.</p>
        ${purchase.giftMessage ? `<p>Message: "${purchase.giftMessage}"</p>` : ''}
        `,
      textContent: `Hi ${purchase.recipient?.firstName},\n${purchase.buyer.firstName} ${purchase.buyer.lastName} has sent you a gift!\nOrder #${purchase.orderNumber} is now available for you.${purchase.giftMessage ? `\nMessage: "${purchase.giftMessage}"` : ''}`
    };
  }

  async sendGiftNotification(purchase: Purchase): Promise<void> {
    if (!purchase.isGift || !purchase.recipient) {
      return;
    }

    try {
      const template = this.generateGiftNotificationTemplate(purchase);
      
      await this.sendEmail({
        to: purchase.recipient.email,
        subject: template.subject,
        template: 'gift-notification',
        data: {
          purchase,
          giftMessage: purchase.giftMessage,
          senderName: purchase.buyer.firstName + ' ' + purchase.buyer.lastName,
          downloadLinks: await this.getDownloadLinks(purchase),
        },
      });

      await this.sendPushNotification(purchase.recipientId, {
        title: 'You\'ve Received a Gift!',
        body: `${purchase.buyer.firstName} sent you a music gift`,
        data: { purchaseId: purchase.id, isGift: true },
      });

      this.logger.log(`Gift notification sent for order: ${purchase.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send gift notification: ${error.message}`, error.stack);
    }
  }

  async sendRefundConfirmation(purchase: Purchase): Promise<void> {
    try {
      const template = this.generateRefundConfirmationTemplate(purchase);
      
      await this.sendEmail({
        to: purchase.buyer.email,
        subject: template.subject,
        template: 'refund-confirmation',
        data: { purchase },
      });

      await this.sendPushNotification(purchase.buyerId, {
        title: 'Refund Processed',
        body: `Your refund for order ${purchase.orderNumber} has been processed`,
        data: { purchaseId: purchase.id },
      });

      this.logger.log(`Refund confirmation sent for order: ${purchase.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send refund confirmation: ${error.message}`, error.stack);
    }
  }

  private generateRefundConfirmationTemplate(purchase: Purchase): EmailTemplate {
    return {
      subject: `Your Refund Confirmation - Order #${purchase.orderNumber}`,
      htmlContent: `<p>Hello ${purchase.buyer.firstName},</p>
        <p>Your refund for order <strong>#${purchase.orderNumber}</strong> has been processed.</p>`,
      textContent: `Hello ${purchase.buyer.firstName},\nYour refund for order #${purchase.orderNumber} has been processed.`
    };
  }

  // Stub implementation for getDownloadLinks - replace with actual logic to generate download links
  private async getDownloadLinks(purchase: Purchase): Promise<string[]> {
    // Example: return an array of URLs for the purchased items
    // Replace this with your actual logic
    return purchase.items?.map((item: any) => `https://yourdomain.com/download/${item.id}`) || [];
  }

  private generateCancellationTemplate(purchase: Purchase): EmailTemplate {
    return {
      subject: `Your Order Cancellation - Order #${purchase.orderNumber}`,
      htmlContent: `<p>Hello ${purchase.buyer.firstName},</p>
        <p>Your order <strong>#${purchase.orderNumber}</strong> has been cancelled.</p>`,
      textContent: `Hello ${purchase.buyer.firstName},\nYour order #${purchase.orderNumber} has been cancelled.`
    };
  }

  async sendCancellationNotification(purchase: Purchase): Promise<void> {
    try {
      const template = this.generateCancellationTemplate(purchase);
      await this.sendEmail({
        to: purchase.buyer.email,
        subject: template.subject,
        template: 'order-cancellation',
        data: { purchase },
      });

      await this.sendPushNotification(purchase.buyerId, {
        title: 'Order Cancelled',
        body: `Your order ${purchase.orderNumber} has been cancelled.`,
        data: { purchaseId: purchase.id },
      });

      this.logger.log(`Cancellation notification sent for order: ${purchase.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send cancellation notification: ${error.message}`, error.stack);
    }
  }}