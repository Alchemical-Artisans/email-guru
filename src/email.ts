import { simpleParser } from "mailparser"
import TurndownService from "turndown"
import { Markdown } from "./markdown.ts"

export interface Address {
  name?: string,
  address: string,
}

export interface EmailParameters {
  id: number,
  subject: string,
  from: Address[],
  to: Address[],
  cc: Address[],
  body: string,
}

export class Email {
  id: number
  subject: string
  from: Address[]
  to: Address[]
  cc: Address[]
  body: string
  constructor(params: EmailParameters) {
    this.id = params.id
    this.subject = params.subject
    this.from = params.from
    this.to = params.to
    this.cc = params.cc
    this.body = params.body
  }

  async parsed_body() {
    return await simpleParser(this.body)
  }

  async html() {
    return (await this.parsed_body()).html as string
  }

  async text() {
    return (await this.parsed_body()).text
  }

  async markdown() {
    const document = new DOMParser().parseFromString(await this.html(), "text/html")

    const stringify_address = (addrs: Address[]) => addrs.map(
      (addr) => addr.name
        ? `${addr.name} <${addr.address}>`
        : addr.address
    )

    return new Markdown(
      new TurndownService().turndown(
        document.getElementsByTagName("body").item(0) as HTMLBodyElement
      ),
      {
          id: this.id,
          subject: this.subject,
          from: stringify_address(this.from || []),
          to: stringify_address(this.to || []),
          cc: stringify_address(this.cc || []),
      },
    );
  }
}
