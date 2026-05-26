import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

function getTagName(
  node: ts.JsxOpeningElement | ts.JsxSelfClosingElement,
): string {
  const name = node.tagName;
  if (ts.isIdentifier(name)) return name.text;
  if (ts.isPropertyAccessExpression(name)) return name.name.text;
  return name.getText();
}

function hasButtonDescendant(node: ts.JsxElement): boolean {
  let found = false;

  const visit = (child: ts.Node) => {
    if (found) return;

    if (ts.isJsxElement(child) && getTagName(child.openingElement) === "Button") {
      found = true;
      return;
    }

    if (ts.isJsxSelfClosingElement(child) && getTagName(child) === "Button") {
      found = true;
      return;
    }

    ts.forEachChild(child, visit);
  };

  ts.forEachChild(node, visit);
  return found;
}

function findNestedButtonLinks(filePath: string): string[] {
  const sourceText = fs.readFileSync(filePath, "utf8");
  const source = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const results: string[] = [];

  const visit = (node: ts.Node) => {
    if (
      ts.isJsxElement(node) &&
      getTagName(node.openingElement) === "Link" &&
      hasButtonDescendant(node)
    ) {
      const position = source.getLineAndCharacterOfPosition(node.getStart(source));
      results.push(`${path.relative(process.cwd(), filePath)}:${position.line + 1}`);
    }

    ts.forEachChild(node, visit);
  };

  visit(source);
  return results;
}

function getTsxFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return getTsxFiles(fullPath);
    return entry.name.endsWith(".tsx") ? [fullPath] : [];
  });
}

describe("interactive markup", () => {
  it("does not render shared Button inside router Link", () => {
    const offenders = getTsxFiles(path.resolve("src")).flatMap(findNestedButtonLinks);

    expect(offenders).toEqual([]);
  });
});
