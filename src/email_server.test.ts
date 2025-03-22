import { test, expect, describe } from "vitest"
import { EmailServer, type EmailConnection } from "./email_server.ts"
import { Email } from "./email.ts"

class TestConnection implements EmailConnection {
  messages: Email[]
  constructor(messages: Partial<Email>[]) {
    this.messages = messages.map((message) => new Email({
      id: 0,
      subject: "",
      from: [],
      to: [],
      cc: [],
      body: "",
      ...message,
    }))
  }

  inbox() {
    return {
      size: async () => this.messages.length,
      emails: async () => this.messages,
    }
  }
}

describe("inbox_count", () => {
  test("no emails", async () => {
    const server = new EmailServer(new TestConnection([]))
    expect(await server.inbox_count()).toEqual(0)
  })

  test("some emails", async () => {
    const server = new EmailServer(new TestConnection([{}, {}]))
    expect(await server.inbox_count()).toEqual(2)
  })
})

describe("emails", async () => {
  test("no emails", async () => {
    const server = new EmailServer(new TestConnection([]))
    expect(await server.emails()).toEqual([])
  })

  test("no emails", async () => {
    const server = new EmailServer(new TestConnection([
      { subject: "a" },
      { subject: "b" },
    ]))
    const emails = await server.emails()
    expect(emails.map((email) => email.subject)).toEqual(["a", "b"])
  })
})
