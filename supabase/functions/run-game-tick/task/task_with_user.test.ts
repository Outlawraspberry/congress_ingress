import { describe, test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { TaskWithUserFraction } from "./task_with_user.ts";

describe("Task works when", () => {
  test("static fromRecord returns a Point instance when every field is valid", () => {
    const record = {
      point: "somePoint",
      type: "attack",
      fraction: "fraction",
      created_by: "userId",
    };

    const { task } = TaskWithUserFraction.fromRecord(record);

    expect(task).toBeDefined();
    expect(task?.created_by).toStrictEqual(record.created_by);
    expect(task?.point).toBe(record.point);
    expect(task?.type).toBe(record.type);
    expect(task?.fraction).toBe(record.fraction);
  });
});
