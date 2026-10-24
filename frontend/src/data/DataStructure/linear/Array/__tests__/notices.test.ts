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

  describe("full array", () => {
    const full = Array.from({ length: ArrayConfig.maxNodes! }, (_, i) => ({
      id: `box-${i}`,
      value: i,
    }));

    it("inserting shows the capacity error as a warning and changes nothing", () => {
      const array = mountStructure(ArrayConfig, {}, full);

      const steps = array.add(7, "Insert", 0);

      expect(array.warning).toHaveBeenCalledWith("animation.insert_error");
      expect(steps.every((s) => s.elements.length === full.length)).toBe(true);
    });

    it("updating a full array still works", () => {
      const array = mountStructure(ArrayConfig, {}, full);

      array.add(7, "Update", 0);

      expect(array.warning).not.toHaveBeenCalled();
    });

    it("inserting with space left lights the capacity check", () => {
      const array = mountStructure(ArrayConfig);

      const steps = array.add(7, "Insert", 0);

      expect(steps[0].actionTag).toBe("INSERT_CHECK_FULL");
      expect(array.warning).not.toHaveBeenCalled();
    });
  });
});
