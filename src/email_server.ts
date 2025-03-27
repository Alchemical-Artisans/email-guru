import type { ImapFlow } from "imapflow"
import { Email, type Address } from "./email.ts"

export interface EmailConnection {
  inbox: () => Inbox
  archive(email: Email): Promise<boolean>
  unarchive(email: Email): Promise<boolean>
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

  async archive(email: Email) {
    email.archived = await this.connection.archive(email)
  }

  async unarchive(email: Email) {
    email.archived = await this.connection.unarchive(email)
  }
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
          messages.push(new Email({
            id: message.uid,
            subject: message.envelope.subject,
            from: message.envelope.from as Address[],
            to: message.envelope.to as Address[],
            cc: message.envelope.cc as Address[],
            body: message.source.toString(),
            archived: false,
          }))
        }
        return messages
      }),
    }
  }

  async archive(email: Email): Promise<boolean> {
    await this.within_inbox(async () => {
      await this.imap.messageFlagsAdd({ uid: email.id.toString() }, ["\\Deleted"])
    })
    return true
  }

  async unarchive(email: Email): Promise<boolean> {
    await this.within_inbox(async () => {
      await this.imap.messageFlagsRemove({ uid: email.id.toString() }, ["\\Deleted"])
    })
    return false
  }

  private async within_inbox<T>(callback: () => Promise<T>): Promise<T> {
    await this.imap.connect()
    const mailbox = await this.imap.getMailboxLock("INBOX")
    const result = await callback()
    mailbox.release()
    this.imap.close()
    return result
  }
}

export interface Inbox {
  size: () => Promise<number>,
  emails: () => Promise<Email[]>,
}
