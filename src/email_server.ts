import type { ImapFlow } from "imapflow"

export interface EmailConnection {
  inbox: () => Promise<{ size: number }>
}

export class EmailServer {
  connection: EmailConnection
  constructor(connection: EmailConnection) {
    this.connection = connection
  }

  async inbox_count(): Promise<number> {
    const inbox = await this.connection.inbox()
    return inbox.size
  }
}

export class ImapConnection implements EmailConnection {
  imap: ImapFlow
  constructor(imap: ImapFlow) {
    this.imap = imap
  }

  async inbox(): Promise<{ size: number }> {
    await this.imap.connect()
    let status = await this.imap.status("INBOX", { messages: true })
    return { size: status.messages as number }
  }
}
