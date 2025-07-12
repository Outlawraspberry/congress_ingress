import { Task as ITask, User } from "../../../../types/alias.ts";

export class Task {
  readonly created_by: User;
  readonly id: ITask["id"];
  readonly point: ITask["point"];
  readonly type: ITask["type"];

  constructor(
    args: {
      created_by: User;
      id: ITask["id"];
      point: ITask["point"];
      type: ITask["type"];
    },
  ) {
    this.created_by = args.created_by;
    this.id = args.id;
    this.point = args.point;
    this.type = args.type;
  }

  static fromRecordAndUser(
    record: Record<string, unknown>,
    user: User,
  ): { task?: Task; error?: Error } {
    if (
      !("id" in record &&
        record.id != null &&
        typeof record.id === "string")
    ) {
      return {
        error: new Error('"id" is not set, or is not a string'),
      };
    }

    if (
      !("point" in record &&
        record.point != null &&
        typeof record.point === "string")
    ) {
      return {
        error: new Error('"point" is not set, or is not a string'),
      };
    }

    if (
      !("type" in record &&
        record.type != null &&
        typeof record.type === "string" &&
        ["attack", "attack_and_claim", "repair", "claim"].includes(record.type))
    ) {
      return {
        error: new Error(
          '"type" is not set, is not a strin or is not one of  "attack", "attack_and_claim", "repair" or "claim"',
        ),
      };
    }

    return {
      task: new Task({
        created_by: user,
        id: record.id,
        point: record.point,
        type: record.type as ITask["type"],
      }),
    };
  }
}
