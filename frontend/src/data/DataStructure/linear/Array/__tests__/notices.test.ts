import { describe, expect, it } from "vitest";
import { ArrayConfig } from "../Array";
import { mountStructure } from "@/data/__tests__/harness";

describe("array toast levels", () => {
  it("inserting past the end shows an info notice because the index is adjusted", () => {
    const array = mountStructure(ArrayConfig);

    array.add(7, "Insert", 99);

    expect(array.info).toHaveBeenCalledTimes(1);
    expect(array.info).toHaveBeenCalledWith("animation.insert_clamp");
    expect(array.warning).not.toHaveBeenCalled();
  });

  it("updating an out-of-range index shows a warning because it is rejected", () => {
    const array = mountStructure(ArrayConfig);

    array.add(7, "Update", 99);

    expect(array.warning).toHaveBeenCalledTimes(1);
    expect(array.warning).toHaveBeenCalledWith("animation.update_error");
    expect(array.info).not.toHaveBeenCalled();
  });

  it("deleting an out-of-range index shows a warning", () => {
    const array = mountStructure(ArrayConfig);

    array.remove("Insert", 99);

    expect(array.warning).toHaveBeenCalledWith("animation.delete_error");
  });
});
