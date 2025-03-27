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
      archived: false,
      ...message,
    }))
  }

  inbox() {
    return {
      size: async () => this.messages.length,
      emails: async () => this.messages,
    }
  }

  async archive(_email: Email): Promise<boolean> {
    return true
  }

  async unarchive(_email: Email): Promise<boolean> {
    return false
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

describe("emails", () => {
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

test("archive", async () => {
  const server = new EmailServer(new TestConnection([{}]))
  const [email] = await server.emails() as [Email]
  expect(email.archived).toBeFalsy()
  await server.archive(email)
  expect(email.archived).toBeTruthy()
})

test("unarchive", async () => {
  const server = new EmailServer(new TestConnection([{ archived: true }]))
  const [email] = await server.emails() as [Email]
  expect(email!.archived).toBeTruthy()
  await server.unarchive(email)
  expect(email!.archived).toBeFalsy()
})
