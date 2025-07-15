import { describe, test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { Point } from "./point.ts";
import { Task } from "../task/task.ts";
import { attackDamage, repairHeal } from "../../../../types/game-config.ts";
import { User } from "../../../../types/alias.ts";

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
  const fractionA = "fractionA";
  const fractionB = "fractionB";
  const pointId = "pointA";
  const userFractionB: User = {
    fraction: fractionB,
    id: "SomeId",
    name: "SomeName",
  };

  const baseTask: Task = {
    created_by: userFractionB,
    id: "123",
    point: pointId,
    type: "attack",
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
      acquiredBy: args.acquiredBy ?? fractionA,
      health: args.health ?? 255,
      maxHealth: args.maxHealth ?? 255,
      pointId,
    });
    }
    
  }

  test("attack task damages the point", () => {
    const task: Task = baseTask;
    const point = getPoint();

    point.simulateTasks(task);

    expect(point.health).toBe(255 - attackDamage);
  });

  test.skip("point can only be attacked by other fraction", () => {});

  test("point can only be attacked when claimed", () => {
    const task: Task = baseTask;
    const point = getPoint({ unsetAcquredBy: true });

    point.simulateTasks(task);

    expect(point.health).toBe(255);
  });

  test("attackAndClaim task damages the point but doesn't claim when health is over 0", () => {
    const task: Task = { ...baseTask, type: "attack_and_claim" };
    const point = getPoint();

    point.simulateTasks(task);

    expect(point.health).toBe(255 - attackDamage);
    expect(point.acquiredBy).toBe(fractionA);
  });

  test("attackAndClaim can only be performed when point is claimed", () => {
    const task: Task = { ...baseTask, type: "attack_and_claim" };
    const point = getPoint({ unsetAcquredBy: true });

    point.simulateTasks(task);

    expect(point.health).toBe(255);
    expect(point.acquiredBy).toBe(null);
  });

  test("attackAdClaim attacks and claims point when health is smaller equal 0", () => {
    const task: Task = {
      ...baseTask,
      type: "attack_and_claim",
      created_by: userFractionB,
    };
    const point = getPoint({
      acquiredBy: fractionA,
      health: -1 + attackDamage,
    });

    point.simulateTasks(task);

    expect(point.health).toBe(-1);
    expect(point.acquiredBy).toBe(fractionB);
  });

  test.skip("attackAndClaim task can only be performed by other fraction", () => {});

  test("repair task repairs a damaged point", () => {
    const task: Task = {
      ...baseTask,
      type: "repair",
      created_by: userFractionB,
    };
    const point = getPoint({ acquiredBy: fractionB, health: 100 });

    point.simulateTasks(task);

    expect(point.health).toBe(100 + repairHeal);
  });

  test.skip("repair can only be performed by fraction who claims the point", () => {});

  test("repair task repairs damaged point just to max health", () => {
    const task: Task = { ...baseTask, type: "repair" };
    const point = getPoint({
      acquiredBy: fractionA,
      health: 255,
      maxHealth: 255,
    });

    point.simulateTasks(task);

    expect(point.health).toBe(255);
  });

  test("claim task claims unclaimed point", () => {
    const task: Task = {
      ...baseTask,
      type: "claim",
      created_by: userFractionB,
    };
    const point = getPoint({ unsetAcquredBy: true });

    point.simulateTasks(task);

    expect(point.acquiredBy).toBe(
      userFractionB.fraction,
    );
  });

  test("claim task not claims already claimed point", () => {
    const task: Task = {
      ...baseTask,
      type: "claim",
      created_by: userFractionB,
    };
    const point = getPoint({ acquiredBy: fractionA });

    point.simulateTasks(task);

    expect(point.acquiredBy).toBe(fractionA);
  });
});
