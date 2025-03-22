import { toISODate } from "./utils.ts";

export class OnlyDate extends Date {}

export class Markdown {
  body: string;
  frontmatter: { [key: string]: any } | undefined;
  constructor(body: string, frontmatter: {} | undefined = undefined) {
    this.body = body
    this.frontmatter = frontmatter
  }

  toString() {
    return [
      this.frontmatter_text(),
      this.body
    ].join("")
  }

  private frontmatter_text(): string {
    const lines: string[] = []
    if (this.frontmatter !== undefined) {
      lines.push("---")
      for (let [key, value] of Object.entries(this.frontmatter)) {
        lines.push(this.frontmatter_entry(key, value))
      }
      lines.push("---", "")
      return lines.join("\n")
    }
    return lines.join("\n")
  }

  private frontmatter_entry(key: string, value: any) {
    let line = `${key}:`
    if (typeof value === "object" && value instanceof Array)
      line += this.frontmatter_object(value)
    else if (typeof value === "object" && value instanceof OnlyDate)
      line += ` ${toISODate(value)}`
    else if (typeof value === "object" && value instanceof Date)
      line += ` ${value.toISOString().replace(/[.].*/, "")}`
    else if (typeof value === "string")
      line += this.frontmatter_string(value)
    else if (value !== undefined && value !== null)
      line += ` ${value}`
    return line;
  }

  private frontmatter_object(value: Array<any>) {
    if (value.length > 0)
      return "\n" + this.prefix_entries("  - ", value).join("\n")
    return ""
  }

  private frontmatter_string(value: string) {
    if (value.includes("\n"))
      return ` |-\n${this.indent_lines(value)}`
    else if (value.includes(":")) {
      const quote = value.includes('"') && !value.includes("'") ? "'" : '"'
      if (value.includes(quote)) value = value.replace(quote, `\\${quote}`)
      return ` ${quote}${value}${quote}`
    } else if (value)
      return ` ${value}`
    return ""
  }

  private indent_lines(value: string) {
    return this.prefix_entries("  ", value.split("\n")).join("\n")
  }

  private prefix_entries(prefix: string, value: Array<string>) {
    return value.map(
      (line) => prefix + line
    )
  }
}
