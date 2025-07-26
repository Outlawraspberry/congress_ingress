import { attackDamage, repairHeal } from "../../../../types/game-config.ts";
import { TaskType, UserGameData } from "../../../../types/alias.ts";
import { Action } from "../action/action.ts";

export class Point {
  private _acquiredBy: string | null;
  private _maxHealth: number;
  private _health: number;
  private _pointId: string;

  constructor(args: {
    acquiredBy?: string | null;
    maxHealth: number;
    health: number;
    pointId: string;
  }) {
    this._acquiredBy = args.acquiredBy ?? null;
    this._maxHealth = args.maxHealth;
    this._health = args.health;
    this._pointId = args.pointId;
  }

  static fromRecord(record: Record<string, unknown>): {
    point?: Point;
    error?: Error;
  } {
    if (record == null || typeof record !== "object") {
      return {
        error: new Error("Input has to be of type object"),
      };
    }

    if (
      !(
        "max_health" in record &&
        record.max_health != null &&
        typeof record.max_health === "number"
      )
    ) {
      return {
        error: new Error('"max_health" is not set, or is not a number'),
      };
    }

    if (
      !(
        "health" in record &&
        record.health != null &&
        typeof record.health === "number"
      )
    ) {
      return { error: new Error('"health" is not set, or is not a number') };
    }

    if (
      !("id" in record && record.id != null && typeof record.id === "string")
    ) {
      return { error: new Error('"id" is not set, or is not a string') };
    }

    if (
      !(
        "acquired_by" in record &&
        record.acquired_by != null &&
        typeof record.acquired_by === "string"
      )
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

  simulateTasks(task: Action, user: UserGameData): void {
    console.log(
      `User ${user.user_id}} tries to ${task.type} on ${this.pointId}`,
    );

    if (task.type === "attack") return this.handleAttack(user);
    if (task.type === "attack_and_claim") {
      return this.handleAttackAndClaim(user);
    }
    if (task.type === "repair") return this.handleRepair(user);
    if (task.type === "claim") return this.handleClaim(user);
  }

  private handleAttack(user: UserGameData) {
    if (this._acquiredBy == null) {
      this.throwIsNotAcquired(user, "attack");
    }
    if (this._acquiredBy == user.faction_id) {
      this.throwIsInSameFaction(user, "attack");
    }

    this._health -= attackDamage;
    console.log(`User ${user.user_id}} attacked ${this.pointId}`);
  }

  private handleAttackAndClaim(user: UserGameData) {
    if (this._acquiredBy == null) {
      this.throwIsNotAcquired(user, "attack_and_claim");
    }
    if (this._acquiredBy == user.faction_id) {
      this.throwIsInSameFaction(user, "attack_and_claim");
    }

    this.handleAttack(user);

    if (this._health <= 0) {
      this._acquiredBy = user.faction_id;
      this._health = this._maxHealth;

      console.log(`User ${user.user_id}} attacked and claimed ${this.pointId}`);
    }
  }

  private handleRepair(user: UserGameData) {
    if (this._acquiredBy == null) {
      this.throwIsNotAcquired(user, "repair");
    }
    if (this._acquiredBy != user.faction_id) {
      this.throwIsInOtherFaction(user, "repair");
    }

    this._health = Math.min(this._maxHealth, this.health + repairHeal);
    console.log(`User ${user.user_id}} repaired ${this.pointId}`);
  }

  private handleClaim(user: UserGameData) {
    if (this._acquiredBy != null) {
      this.throwIsInOtherFaction(user, "claim");
    }

    this._acquiredBy = user.faction_id;
    console.log(`User ${user.user_id}} claimed ${this.pointId}`);
  }

  private throwIsNotAcquired(user: UserGameData, type: TaskType): void {
    throw new Error(
      `User ${user.user_id} cannot ${type} the point ${this.pointId} because the point is not claimed!`,
    );
  }

  private throwIsInSameFaction(user: UserGameData, type: TaskType): void {
    throw new Error(
      `User ${user.user_id}} cannot ${type} point ${this.pointId} because he is in the same faction`,
    );
  }

  private throwIsInOtherFaction(user: UserGameData, type: TaskType): void {
    throw new Error(
      `User ${user.user_id}} cannot ${type} point ${this.pointId} because he is in faction ${user.faction_id}, but the point is acquired by ${this._acquiredBy}`,
    );
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
