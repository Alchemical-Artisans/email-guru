import { toISODate } from "./utils.ts";

export class OnlyDate extends Date {}

type FrontmatterData = {
  [key: string]: any;
};

export class Markdown {
  body: string;
  frontmatter_data: FrontmatterData | undefined;
  frontmatter: Frontmatter | undefined;
  constructor(body: string, frontmatter: FrontmatterData | undefined = undefined) {
    this.body = body
    this.frontmatter_data = frontmatter
    this.frontmatter = frontmatter ? new Frontmatter(frontmatter) : undefined
  }

  toString() {
    return [
      this.frontmatter?.toString(),
      this.body
    ].join("")
  }
}

export class Frontmatter {
  data: FrontmatterData;
  constructor(data: FrontmatterData) {
    this.data = data
  }

  toString(): string {
    const lines: string[] = []
    if (this.data !== undefined) {
      lines.push("---")
      for (let [key, value] of Object.entries(this.data)) {
        lines.push(this.entry(key, value))
      }
      lines.push("---", "")
      return lines.join("\n")
    }
    return lines.join("\n")
  }

  private entry(key: string, value: any) {
    return `${key}:${this.value_for(value)?.toString() || ""}`
  }

  private value_for(value: any) {
    if (FrontmatterArray.represented_by(value))
      return new FrontmatterArray(value)

    if (FrontmatterDate.represented_by(value))
      return new FrontmatterDate(value)

    if (FrontmatterDateTime.represented_by(value))
      return new FrontmatterDateTime(value)

    if (FrontmatterString.represented_by(value))
      return new FrontmatterString(value)

    if (FrontmatterValue.represented_by(value))
      return new FrontmatterValue(value)

    return undefined
  }
}

export class FrontmatterValue {
  static represented_by(value: any) {
    return value !== undefined && value !== null
  }

  value: any;
  constructor(value: any) {
    this.value = value
  }

  toString() {
    return ` ${this.value}`
  }

  protected indent_lines(value: string) {
    return this.prefix_entries("  ", value.split("\n")).join("\n")
  }

  protected prefix_entries(prefix: string, value: Array<string>) {
    return value.map(
      (line) => prefix + line
    )
  }
}

export class FrontmatterArray extends FrontmatterValue {
  static override represented_by(value: any) {
    return typeof value === "object" && value instanceof Array
  }

  override toString() {
    if (this.value.length > 0)
      return "\n" + this.prefix_entries("  - ", this.value).join("\n")
    return ""
  }
}

export class FrontmatterDate extends FrontmatterValue {
  static override represented_by(value: any) {
    return typeof value === "object" && value instanceof OnlyDate
  }

  override toString() {
    return ` ${toISODate(this.value)}`
  }
}

export class FrontmatterDateTime extends FrontmatterValue {
  static override represented_by(value: any) {
    return typeof value === "object" && value instanceof Date
  }

  override toString() {
    return ` ${this.value.toISOString().replace(/[.].*/, "")}`
  }
}

export class FrontmatterString extends FrontmatterValue {
  static override represented_by(value: any) {
    return typeof value === "string"
  }

  override toString() {
    if (this.value.includes("\n"))
      return ` |-\n${this.indent_lines(this.value)}`
    else if (this.needs_quotes()) {
      const quote = this.value.includes('"') && !this.value.includes("'") ? "'" : '"'
      let value = this.value;
      if (value.includes(quote)) value = value.replace(quote, `\\${quote}`)
      return ` ${quote}${value}${quote}`
    } else if (this.value)
      return ` ${this.value}`
    return ""
  }

  needs_quotes() {
    return this.value.includes(":") || this.value.includes("[") || this.value.includes("]")
  }
}
