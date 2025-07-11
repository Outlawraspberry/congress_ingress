import type { Database } from './database.types';

export type Fraction = Database['public']['Tables']['fraction']['Row'];
export type Point = Database['public']['Tables']['point']['Row'];
export type User = Database['public']['Tables']['user']['Row'];
export type Game = Database['public']['Tables']['game']['Row'];
