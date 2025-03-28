import { simpleParser } from "mailparser"
import TurndownService from "turndown"
import { Markdown, type FrontmatterData } from "./markdown.ts"
import type { FrontMatterCache } from "obsidian"

export interface Address {
  name: string | undefined,
  address: string,
}

const name_pattern = /^([^<]*)<(.*)>$/
function parse_address(s: string): Address {
  let name, address
  if (s.match(name_pattern))
    [name, address] = name_pattern.exec(s) as RegExpExecArray
  else
    address = s
  return {
    name: name,
    address: address as string,
  }
}

export interface EmailParameters {
  id: number,
  subject: string,
  from: Address[],
  to: Address[],
  cc: Address[],
  body: string,
  archived: boolean
}

export class Email {
  static from(frontmatter: FrontMatterCache) {
    return new Email({
      id: frontmatter["id"],
      subject: frontmatter["subject"],
      from: frontmatter["from"]?.map((a: string) => parse_address(a)),
      to: frontmatter["to"]?.map((a: string) => parse_address(a)),
      cc: frontmatter["cc"]?.map((a: string) => parse_address(a)),
      body: "",
      archived: frontmatter["archived"],
    })
  }

  id: number
  subject: string
  from: Address[]
  to: Address[]
  cc: Address[]
  body: string
  archived: boolean
  constructor(params: EmailParameters) {
    this.id = params.id
    this.subject = params.subject
    this.from = params.from
    this.to = params.to
    this.cc = params.cc
    this.body = params.body
    this.archived = params.archived
  }

  async parsed_body() {
    return await simpleParser(this.body)
  }

  async html() {
    return new HTML((await this.parsed_body()).html as string)
  }

  async text() {
    return (await this.parsed_body()).text
  }

  async markdown() {
    const stringify_address = (addrs: Address[]) => addrs.map(
      (addr) => addr.name
        ? `${addr.name} <${addr.address}>`
        : addr.address
    )

    const frontmatter = {
      id: this.id,
      subject: this.subject,
      from: stringify_address(this.from || []),
      to: stringify_address(this.to || []),
      cc: stringify_address(this.cc || []),
      archived: this.archived,
    }

    return (await this.html()).markdown(frontmatter);
  }
}

export class HTML {
  html: string
  constructor(html: string) {
    this.html = html
  }

  markdown(frontmatter?: FrontmatterData) {
    const document = new DOMParser().parseFromString(this.html, "text/html")

    const body = document.getElementsByTagName("body").item(0) as HTMLBodyElement
    const script_tags = body.getElementsByTagName("script")
    for (let i = 0; i < script_tags.length; ++i) {
      const tag = script_tags[i]
      tag!.remove()
    }

    return new Markdown(
      new TurndownService().turndown(body),
      frontmatter,
    );
  }
}
