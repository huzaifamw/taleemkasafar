import { describe, expect, it } from "vitest";
import {
  getQuestionModerationLabel,
  QUESTION_MODERATION,
} from "./question-moderation";

describe("question moderation mapping", () => {
  it("stores an admin rejection as the existing flagged enum value", () => {
    expect(QUESTION_MODERATION.reject).toBe("flagged");
  });

  it("keeps administrator-facing rejection wording", () => {
    expect(getQuestionModerationLabel("flagged")).toBe("Rejected");
  });

  it("maps the remaining database values to clear labels", () => {
    expect(getQuestionModerationLabel("approved")).toBe("Approved");
    expect(getQuestionModerationLabel("draft")).toBe("Draft");
  });
});
