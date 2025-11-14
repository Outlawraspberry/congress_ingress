import { Database } from "../../../../types/database.types.ts";
import { v4 } from "@std/uuid";

export interface Action {
  point: string;
  type: Database["public"]["Enums"]["task_type"];
}

const actions = ["attack", "attack_and_claim", "repair", "claim", "upgrade"];

export function isActionValid(input: unknown): input is Action {
  if (input == null || typeof input !== "object") {
    throw new Error("Object is either null or not from type object");
  }

  if (
    !(
      "point" in input &&
      typeof input.point === "string" &&
      v4.validate(input.point)
    )
  ) {
    throw new Error(
      'Object doesn\'t have the property "point" or it is not a valid uuid4',
    );
  }

  if (
    !(
      "type" in input &&
      typeof input.type === "string" &&
      actions.includes(input.type)
    )
  ) {
    throw new Error(
      `Object doesn't have the property type or it is not one of ${actions.join(
        ", ",
      )
      }`,
    );
  }

  return true;
}
