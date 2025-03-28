import { expect, test } from "vitest"
import { HTML } from "./email.ts"

test("markdown strips script tags", async () => {
  const html = new HTML("<html><body><script>console.log('foo')</script>bar</script></body></html>")
  expect(html.markdown().body).toEqual("bar")
})
