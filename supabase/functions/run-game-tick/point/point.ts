import { Task } from "../task/task.ts";
import { attackDamage, repairHeal } from "../../../../types/game-config.ts";
import { Json } from "../../../../types/database.types.ts";

export class Point {
  private _acquiredBy: string | null;
  private _maxHealth: number;
  private _health: number;
  private _pointId: string;

  constructor(
    args: {
      acquiredBy?: string | null;
      maxHealth: number;
      health: number;
      pointId: string;
    },
  ) {
    this._acquiredBy = args.acquiredBy ?? null;
    this._maxHealth = args.maxHealth;
    this._health = args.health;
    this._pointId = args.pointId;
  }

  static fromRecord(
    record: Json,
  ): { point?: Point; error?: Error } {
    if (record == null || typeof record !== "object") {
      return {
        error: new Error("Input has to be of type object"),
      };
    }

    if (
      !("max_health" in record &&
        record.max_health != null &&
        typeof record.max_health === "number")
    ) {
      return {
        error: new Error('"max_health" is not set, or is not a number'),
      };
    }

    if (
      !("health" in record &&
        record.health != null &&
        typeof record.health === "number")
    ) {
      return { error: new Error('"health" is not set, or is not a number') };
    }

    if (
      !(
        "id" in record &&
        record.id != null &&
        typeof record.id === "string"
      )
    ) {
      return { error: new Error('"id" is not set, or is not a string') };
    }

    if (
      !("acquired_by" in record &&
        record.acquired_by != null &&
        typeof record.acquired_by === "string")
    ) {
      return {
        point: new Point({
          acquiredBy: null,
          health: record.health,
          maxHealth: record.max_health,
          pointId: record.id,
        }),
      };
    } else {
      return {
        point: new Point({
          acquiredBy: record.acquired_by,
          health: record.health,
          maxHealth: record.max_health,
          pointId: record.id,
        }),
      };
    }
  }

  simulateTasks(task: Task): void {
    if (task.type === "attack") return this.handleAttack(task);
    if (task.type === "attack_and_claim") {
      return this.handleAttackAndClaim(task);
    }
    if (task.type === "repair") return this.handleRepair(task);
    if (task.type === "claim") return this.handleClaim(task);
  }

  private handleAttack(task: Task) {
    if (
      this._acquiredBy != null && this._acquiredBy != task.created_by.fraction
    ) {
      this._health -= attackDamage;
    }
  }

  private handleAttackAndClaim(task: Task) {
    if (
      this._acquiredBy != task.created_by.fraction && this.acquiredBy != null
    ) {
      this.handleAttack(task);

      if (this._health <= 0) {
        this._acquiredBy = task.created_by.fraction;
      }
    }
  }

  private handleRepair(task: Task) {
    if (
      this._acquiredBy == task.created_by.fraction && this._acquiredBy != null
    ) {
      this._health = Math.min(this._maxHealth, this.health + repairHeal);
    }
  }

  private handleClaim(task: Task) {
    if (this._acquiredBy == null) {
      this._acquiredBy = task.created_by.fraction;
    }
  }

  get acquiredBy(): string | null {
    return this._acquiredBy;
  }

  get maxHealth(): number {
    return this._maxHealth;
  }

  get health(): number {
    return this._health;
  }

  get pointId(): string {
    return this._pointId;
  }
}
