import { Task as ITask, User as IUser } from "../../../../types/alias.ts";
import { Json } from "../../../../types/database.types.ts";

export class TaskWithUserFraction {
  readonly created_by: IUser["id"];
  readonly point: ITask["point"];
  readonly type: ITask["type"];
  readonly fraction: IUser["fraction"];

  constructor(
    args: {
      created_by: IUser["id"];
      point: ITask["point"];
      type: ITask["type"];
      fraction: IUser["fraction"];
    },
  ) {
    this.created_by = args.created_by;
    this.point = args.point;
    this.type = args.type;
    this.fraction = args.fraction;
  }

  static fromRecord(
    record: Record<string, unknown>,
  ): { task?: TaskWithUserFraction; error?: Error } {
    if (record == null || typeof record !== "object") {
      return {
        error: new Error("Input has to be of type object"),
      };
    }

    if (
      !("created_by" in record &&
        record.created_by != null &&
        typeof record.created_by === "string")
    ) {
      return {
        error: new Error('"created_by" is not set, or is not a string'),
      };
    }

    if (
      !("fraction" in record &&
        record.fraction != null &&
        typeof record.fraction === "string")
    ) {
      return {
        error: new Error('"fraction" is not set, or is not a string'),
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
      task: new TaskWithUserFraction({
        created_by: record.created_by,
        point: record.point,
        type: record.type as ITask["type"],
        fraction: record.fraction,
      }),
    };
  }
}
