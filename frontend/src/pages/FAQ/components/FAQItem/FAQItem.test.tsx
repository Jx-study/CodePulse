import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import FAQItem from "./FAQItem";

describe("FAQItem accessibility ids", () => {
  it("uses the stable FAQ id instead of the item index", () => {
    const markup = renderToStaticMarkup(
      <FAQItem
        id="login"
        index={0}
        question="How do I log in?"
        answer="Use your Google account."
        isOpen
        onToggle={() => {}}
      />,
    );

    expect(markup).toContain('id="faq-trigger-login"');
    expect(markup).toContain('aria-controls="faq-body-login"');
    expect(markup).toContain('id="faq-body-login"');
    expect(markup).toContain('aria-labelledby="faq-trigger-login"');
  });
});
