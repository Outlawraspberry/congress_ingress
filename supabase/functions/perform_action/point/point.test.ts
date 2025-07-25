import { describe, test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { Point } from "./point.ts";
import { attackDamage, repairHeal } from "../../../../types/game-config.ts";
import { UserGameData } from "../../../../types/alias.ts";
import { Action } from "../action/action.ts";

describe("Point works when", () => {
  test("static fromRecord returns a Point instance when every field is valid", () => {
    const record = {
      acquired_by: "abc",
      max_health: 255,
      health: 255,
      id: "point",
    };

    const { point } = Point.fromRecord(record);

    expect(point).toBeDefined();
    expect(point?.acquiredBy).toBe(record.acquired_by);
    expect(point?.maxHealth).toBe(record.max_health);
    expect(point?.health).toBe(record.health);
    expect(point?.pointId).toBe(record.id);
  });

  test("static fromRecord returns a Point instance when all but acquiredBy is filled", () => {
    const record = {
      max_health: 255,
      health: 255,
      id: "point",
    };

    const { point } = Point.fromRecord(record);

    expect(point).toBeDefined();
    expect(point?.acquiredBy).toBe(null);
    expect(point?.maxHealth).toBe(record.max_health);
    expect(point?.health).toBe(record.health);
    expect(point?.pointId).toBe(record.id);
  });
});

describe("Point task simulate works when", () => {
  const factionA = "fractionA";
  const factionB = "fractionB";
  const pointId = "pointA";

  const userFactionA: UserGameData = {
    faction_id: factionB,
    user_id: "SomeId",
    last_action: "",
  };

  const userFactionB: UserGameData = {
    faction_id: factionA,
    user_id: "SomeIdA",
    last_action: "",
  };

  const baseAction: Action = {
    point: pointId,
    type: "attack",
    user: userFactionB.user_id,
  };

  function getPoint(args: {
    health?: number;
    maxHealth?: number;
    acquiredBy?: string | undefined;
    unsetAcquredBy?: boolean;
  } = {}): Point {
    if (args.unsetAcquredBy) {
      return new Point({
        acquiredBy: null,
        health: args.health ?? 255,
        maxHealth: args.maxHealth ?? 255,
        pointId,
      });
    } else {
      return new Point({
        acquiredBy: args.acquiredBy ?? factionA,
        health: args.health ?? 255,
        maxHealth: args.maxHealth ?? 255,
        pointId,
      });
    }
  }

  test("attack task damages the point", () => {
    const task: Action = baseAction;
    const point = getPoint();

    point.simulateTasks(task, userFactionA);

    expect(point.health).toBe(255 - attackDamage);
  });

  test.skip("point can only be attacked by other fraction", () => {});

  test("point can only be attacked when claimed", () => {
    const task: Action = baseAction;
    const point = getPoint({ unsetAcquredBy: true });

    point.simulateTasks(task, userFactionA);

    expect(point.health).toBe(255);
  });

  test("attackAndClaim task damages the point but doesn't claim when health is over 0", () => {
    const task: Action = {
      ...baseAction,
      type: "attack_and_claim",
    };
    const point = getPoint();

    point.simulateTasks(task, userFactionA);

    expect(point.health).toBe(255 - attackDamage);
    expect(point.acquiredBy).toBe(factionA);
  });

  test("attackAndClaim can only be performed when point is claimed", () => {
    const task: Action = {
      ...baseAction,
      type: "attack_and_claim",
    };
    const point = getPoint({ unsetAcquredBy: true });

    point.simulateTasks(task, userFactionA);

    expect(point.health).toBe(255);
    expect(point.acquiredBy).toBe(null);
  });

  test("attackAdClaim attacks and claims point when health is smaller equal 0", () => {
    const task: Action = {
      ...baseAction,
      type: "attack_and_claim",
      user: userFactionB.user_id,
    };
    const point = getPoint({
      acquiredBy: factionA,
      health: -1 + attackDamage,
    });

    point.simulateTasks(task, userFactionA);

    expect(point.health).toBe(point.maxHealth);
    expect(point.acquiredBy).toBe(factionB);
  });

  test.skip("attackAndClaim task can only be performed by other fraction", () => {});

  test("repair task repairs a damaged point", () => {
    const task: Action = {
      ...baseAction,
      type: "repair",
      user: userFactionB.user_id,
    };
    const point = getPoint({
      acquiredBy: factionB,
      health: 100,
      maxHealth: 255,
    });

    point.simulateTasks(task, userFactionA);

    expect(point.health).toBe(100 + repairHeal);
  });

  test.skip("repair can only be performed by fraction who claims the point", () => {});

  test("repair task repairs damaged point just to max health", () => {
    const task: Action = { ...baseAction, type: "repair" };
    const point = getPoint({
      acquiredBy: factionA,
      health: 255,
      maxHealth: 255,
    });

    point.simulateTasks(task, userFactionA);

    expect(point.health).toBe(255);
  });

  test("claim task claims unclaimed point", () => {
    const task: Action = {
      ...baseAction,
      type: "claim",
      user: userFactionA.user_id,
    };
    const point = getPoint({ unsetAcquredBy: true });

    expect(point.acquiredBy).toBeNull();

    point.simulateTasks(task, userFactionA);

    expect(point.acquiredBy).toBe(
      userFactionA.faction_id,
    );
  });

  test("claim task not claims already claimed point", () => {
    const task: Action = {
      ...baseAction,
      type: "claim",
      user: userFactionB.user_id,
    };
    const point = getPoint({ acquiredBy: factionA });

    point.simulateTasks(task, userFactionA);

    expect(point.acquiredBy).toBe(factionA);
  });
});
