import { defineService } from "@hile/core";
import { createTransport } from 'nodemailer';
import { parseEnvNumber } from "../lib/env";

interface IMailerProps {
  host: string,
  port: number,
  secure: boolean,
  auth: {
    user: string,
    pass: string,
  },
}

interface PostProps {
  subject: string,
  text?: string,
  html?: string,
}

/**
 * 发送邮件服务
 */
export const MailerService = defineService(async (shutdown) => {
  const user = process.env.MAILER_AUTH_USER!;
  const transport = createTransport({
    host: process.env.MAILER_HOST!,
    port: parseEnvNumber(process.env.MAILER_PORT!, 465),
    secure: true,
    auth: {
      user,
      pass: process.env.MAILER_AUTH_PASS!,
    }
  } satisfies IMailerProps);

  shutdown(() => transport.close());

  const sender = async (from: string, to: string, options: PostProps) => {
    const msg = await transport.sendMail({
      from, to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })
    return msg.messageId;
  }

  return {
    post: sender,
    send: (to: string, options: PostProps) => sender(user, to, options),
    sendText: (to: string, subject: string, text: string) => sender(user, to, {
      subject, text,
    }),
    sendHtml: (to: string, subject: string, html: string) => sender(user, to, {
      subject, html,
    })
  }
})