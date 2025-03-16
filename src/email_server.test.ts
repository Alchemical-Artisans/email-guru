import { test, expect } from "vitest"
import { EmailServer, type EmailConnection } from "./email_server.ts"

class TestConnection implements EmailConnection {
  messages: any[]
  constructor(messages: any[]) {
    this.messages = messages
  }

  async inbox() {
    return { size: this.messages.length }
  }
}

test("no emails", async () => {
  const server = new EmailServer(new TestConnection([]))
  expect(await server.inbox_count()).toEqual(0)
})
