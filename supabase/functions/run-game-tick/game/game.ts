import { Game as IGame } from "../../../../types/alias.ts";

export class Game implements IGame {
  id: number;
  state: "playing" | "paused";
  tick: number;

  constructor(args: {
    id: number;
    state: "playing" | "paused";
    tick: number;
  }) {
    this.id = args.id;
    this.state = args.state;
    this.tick = args.tick;
  }
}
