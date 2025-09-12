import { Database } from "../../../../types/database.types.ts";
import { v4 } from "@std/uuid";

export interface Action {
  user: string;
  point: string;
  type: Database["public"]["Enums"]["task_type"];
  puzzleId: string;
}

const actions = ["attack", "attack_and_claim", "repair", "claim"];

export function isActionValid(input: unknown): input is Action {
  if (input == null || typeof input !== "object") {
    throw new Error("Object is either null or not from type object");
  }

  if (
    !(
      "user" in input &&
      typeof input.user === "string" &&
      v4.validate(input.user)
    )
  ) {
    throw new Error(
      'Object doesn\'t have the property "user" or it is not a valid uuid4',
    );
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
      )}`,
    );
  }

  if (
    !(
      "puzzleId" in input &&
      typeof input.puzzleId === "string" &&
      v4.validate(input.puzzleId)
    )
  ) {
    throw new Error(
      'Object doesn\'t have the property "point" or it is not a valid uuid4',
    );
  }

  return true;
}
