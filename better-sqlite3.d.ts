declare module "better-sqlite3" {
  class Statement<BindParameters extends Record<string, unknown> | unknown[] = Record<string, unknown>> {
    run(parameters?: BindParameters | unknown): { changes: number; lastInsertRowid: number | bigint };
    get(parameters?: BindParameters | unknown): unknown;
    all(parameters?: BindParameters | unknown): unknown[];
  }

  class Database {
    constructor(filename: string);
    pragma(source: string): unknown;
    exec(source: string): Database;
    prepare(source: string): Statement;
  }

  namespace Database {
    type Database = import("better-sqlite3").Database;
  }

  export default Database;
}
