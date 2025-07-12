import { describe, test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { Task } from "./task.ts";
import { User } from "../../../../types/alias.ts";

describe("Task works when", () => {
  test("static fromRecord returns a Point instance when every field is valid", () => {
    const record = {
      id: "someid",
      point: "somePoint",
      type: "attack",
    };

    const user: User = {
      fraction: "fraction",
      id: "userId",
      name: "UserName",
    };

    const { task } = Task.fromRecordAndUser(record, user);

    expect(task).toBeDefined();
    expect(task?.created_by).toStrictEqual(user);
    expect(task?.id).toBe(record.id);
    expect(task?.point).toBe(record.point);
    expect(task?.type).toBe(record.type);
  });
});
