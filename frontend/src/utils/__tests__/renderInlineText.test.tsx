import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderInlineText } from "../renderInlineText";

describe("renderInlineText", () => {
  it("renders bold, tone, and inline code markup without treating plain text as html", () => {
    const html = renderToStaticMarkup(
      <>
        {renderInlineText("Use **BFS** with [[success|O(1)]] and `queue.pop(0)` <safe>", {
          tones: {
            success: "toneSuccess",
          },
          code: "inlineCode",
        })}
      </>,
    );

    expect(html).toContain("Use <strong>BFS</strong> with ");
    expect(html).toContain('<span class="toneSuccess">O(1)</span>');
    expect(html).toContain('<code class="inlineCode">queue.pop(0)</code>');
    expect(html).toContain("&lt;safe&gt;");
  });
});
