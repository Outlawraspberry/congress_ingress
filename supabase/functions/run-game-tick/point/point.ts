import { Task } from "../task/task.ts";
import { attackDamage, repairHeal } from "../../../../types/game-config.ts";

export class Point {
  private _acquiredBy: string | undefined;
  private _maxHealth: number;
  private _health: number;
  private _pointId: string;

  constructor(
    args: {
      acquiredBy?: string;
      maxHealth: number;
      health: number;
      pointId: string;
    },
  ) {
    this._acquiredBy = args.acquiredBy;
    this._maxHealth = args.maxHealth;
    this._health = args.health;
    this._pointId = args.pointId;
  }

  static fromRecord(
    record: Record<string, unknown>,
  ): { point?: Point; error?: Error } {
    if (
      !("acquired_by" in record &&
        record.acquired_by != null &&
        typeof record.acquired_by === "string")
    ) {
      return {
        error: new Error('"acquired_by" is not set, or is not a string'),
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
        "point_id" in record &&
        record.point_id != null &&
        typeof record.point_id === "string"
      )
    ) {
      return { error: new Error('"point_id" is not set, or is not a string') };
    }

    return {
      point: new Point({
        acquiredBy: record.acquired_by,
        health: record.health,
        maxHealth: record.max_health,
        pointId: record.point_id,
      }),
    };
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
    if (this._acquiredBy === undefined) {
      this._acquiredBy = task.created_by.fraction;
    }
  }

  get acquiredBy(): string | undefined {
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
