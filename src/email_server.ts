import type { ImapFlow } from "imapflow"

export interface EmailConnection {
  inbox: () => Inbox
}

export class EmailServer {
  connection: EmailConnection
  constructor(connection: EmailConnection) {
    this.connection = connection
  }

  async inbox_count(): Promise<number> {
    const inbox = this.connection.inbox()
    return await inbox.size()
  }

  async emails(): Promise<Email[]> {
    const inbox = this.connection.inbox()
    return await inbox.emails()
  }
}

export interface Address {
  name?: string,
  address: string,
}

export interface Email {
  id: number,
  subject: string,
  from: Address[],
  to: Address[],
  cc: Address[],
  body: string,
}

export class ImapConnection implements EmailConnection {
  imap: ImapFlow
  constructor(imap: ImapFlow) {
    this.imap = imap
  }

  inbox(): Inbox {
    return {
      size: async () => await this.within_inbox(async () => {
        let status = await this.imap.status("INBOX", { messages: true })
        return status.messages as number
      }),
      emails: async () => await this.within_inbox(async () => {
        const messages = []
        for await (let message of this.imap.fetch("1:*", { uid: true, envelope: true, source: true })) {
          messages.push({
            id: message.uid,
            subject: message.envelope.subject,
            from: message.envelope.from as Address[],
            to: message.envelope.to as Address[],
            cc: message.envelope.cc as Address[],
            body: message.source.toString(),
          })
        }
        return messages
      }),
    }
  }

  private async within_inbox<T>(callback: () => Promise<T>): Promise<T> {
    await this.imap.connect()
    const mailbox = await this.imap.getMailboxLock("INBOX")
    const result = await callback()
    mailbox.release()
    return result
  }
}

export interface Inbox {
  size: () => Promise<number>,
  emails: () => Promise<Email[]>,
}
