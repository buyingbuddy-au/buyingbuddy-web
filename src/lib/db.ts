import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { to_sqlite_datetime } from "@/lib/time";
import type {
  DashboardPayload,
  DashboardStats,
  EmailCaptureRecord,
  JsonValue,
  OrderFilters,
  OrderRecord,
} from "@/lib/types";

const DEFAULT_DATA_DIRECTORY = path.join(process.cwd(), "buyingbuddy-data");
const DEFAULT_DATABASE_PATH = path.join(DEFAULT_DATA_DIRECTORY, "buyingbuddy.db");

const configuredDatabasePath = process.env.DATABASE_PATH?.trim();
export const database_path = configuredDatabasePath
  ? path.resolve(process.cwd(), configuredDatabasePath)
  : DEFAULT_DATABASE_PATH;
export const data_directory = path.dirname(database_path);
export const reports_directory = path.join(data_directory, "reports");

mkdirSync(data_directory, { recursive: true });
mkdirSync(reports_directory, { recursive: true });

const schema_sql = `
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'pending',
  product TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  listing_url TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_rego TEXT,
  vehicle_vin TEXT,
  vehicle_mileage INTEGER,
  vehicle_price_listed INTEGER,
  market_value_low INTEGER,
  market_value_high INTEGER,
  days_listed INTEGER,
  red_flags TEXT,
  listing_verdict TEXT,
  ppsr_result TEXT,
  ppsr_checked_at TEXT,
  dealer_verdict TEXT,
  dealer_reviewed_at TEXT,
  report_pdf_path TEXT,
  report_sent_at TEXT,
  negotiation_script TEXT,
  contract_included INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS email_captures (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  email TEXT NOT NULL UNIQUE,
  listing_url TEXT,
  vehicle_summary TEXT,
  converted_to_order TEXT
);
`;

const ORDER_COLUMNS = [
  "id",
  "created_at",
  "updated_at",
  "status",
  "product",
  "price_cents",
  "customer_email",
  "customer_name",
  "stripe_session_id",
  "stripe_payment_intent",
  "listing_url",
  "vehicle_make",
  "vehicle_model",
  "vehicle_year",
  "vehicle_rego",
  "vehicle_vin",
  "vehicle_mileage",
  "vehicle_price_listed",
  "market_value_low",
  "market_value_high",
  "days_listed",
  "red_flags",
  "listing_verdict",
  "ppsr_result",
  "ppsr_checked_at",
  "dealer_verdict",
  "dealer_reviewed_at",
  "report_pdf_path",
  "report_sent_at",
  "negotiation_script",
  "contract_included",
] as const;

type OrderColumn = (typeof ORDER_COLUMNS)[number];

const EMAIL_CAPTURE_COLUMNS = [
  "id",
  "created_at",
  "email",
  "listing_url",
  "vehicle_summary",
  "converted_to_order",
] as const;

type EmailCaptureColumn = (typeof EMAIL_CAPTURE_COLUMNS)[number];

const JSON_COLUMNS = new Set<OrderColumn>(["red_flags", "ppsr_result"]);

type OrderRow = Omit<OrderRecord, "red_flags" | "ppsr_result"> & {
  red_flags: string | null;
  ppsr_result: string | null;
};

let database_instance: Database.Database | null = null;

function get_database() {
  if (!database_instance) {
    database_instance = new Database(database_path);
    database_instance.pragma("journal_mode = WAL");
    database_instance.exec(schema_sql);
  }

  return database_instance;
}

function parse_json_value<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function serialize_value(column: OrderColumn | EmailCaptureColumn, value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (JSON_COLUMNS.has(column as OrderColumn)) {
    return value === null ? null : JSON.stringify(value);
  }

  return value;
}

function deserialize_order(row: OrderRow | undefined): OrderRecord | null {
  if (!row) {
    return null;
  }

  return {
    ...row,
    red_flags: parse_json_value<string[]>(row.red_flags, []),
    ppsr_result: parse_json_value<JsonValue | null>(row.ppsr_result, null),
  };
}

function deserialize_email_capture(
  row: EmailCaptureRecord | undefined,
): EmailCaptureRecord | null {
  return row ?? null;
}

export function insert_order(
  input: Partial<OrderRecord> &
    Pick<OrderRecord, "id" | "product" | "customer_email">,
) {
  const database = get_database();
  const entries = ORDER_COLUMNS.flatMap((column) => {
    const value = serialize_value(column, input[column]);
    return value === undefined ? [] : [[column, value] as const];
  });

  const columns = entries.map(([column]) => column).join(", ");
  const placeholders = entries.map(([column]) => `@${column}`).join(", ");
  const values = Object.fromEntries(entries);

  database
    .prepare(`INSERT INTO orders (${columns}) VALUES (${placeholders})`)
    .run(values);

  return get_order_by_id(input.id);
}

export function update_order(id: string, updates: Partial<OrderRecord>) {
  const database = get_database();
  const entries = ORDER_COLUMNS.flatMap((column) => {
    if (column === "id" || column === "created_at") {
      return [];
    }

    const value = serialize_value(column, updates[column]);
    return value === undefined ? [] : [[column, value] as const];
  });

  if (entries.length === 0) {
    return get_order_by_id(id);
  }

  const set_clause = entries.map(([column]) => `${column} = @${column}`).join(", ");
  const values = Object.fromEntries(entries);

  database
    .prepare(
      `UPDATE orders
       SET ${set_clause}, updated_at = datetime('now')
       WHERE id = @id`,
    )
    .run({ ...values, id });

  return get_order_by_id(id);
}

export function get_order_by_id(id: string) {
  const database = get_database();
  const row = database
    .prepare("SELECT * FROM orders WHERE id = ?")
    .get(id) as OrderRow | undefined;

  return deserialize_order(row);
}

export function get_order_by_stripe_session_id(stripe_session_id: string) {
  const database = get_database();
  const row = database
    .prepare("SELECT * FROM orders WHERE stripe_session_id = ?")
    .get(stripe_session_id) as OrderRow | undefined;

  return deserialize_order(row);
}

export function get_order_by_payment_intent(stripe_payment_intent: string) {
  const database = get_database();
  const row = database
    .prepare("SELECT * FROM orders WHERE stripe_payment_intent = ?")
    .get(stripe_payment_intent) as OrderRow | undefined;

  return deserialize_order(row);
}

export function list_orders(filters: OrderFilters = {}) {
  const database = get_database();
  const conditions: string[] = [];
  const values: Record<string, string | number> = {};

  if (filters.status && filters.status !== "all") {
    conditions.push("status = @status");
    values.status = filters.status;
  }

  if (filters.product && filters.product !== "all") {
    conditions.push("product = @product");
    values.product = filters.product;
  }

  if (filters.search) {
    conditions.push(
      "(customer_email LIKE @search OR listing_url LIKE @search OR vehicle_make LIKE @search OR vehicle_model LIKE @search)",
    );
    values.search = `%${filters.search}%`;
  }

  const where_clause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit_clause =
    typeof filters.limit === "number" && Number.isFinite(filters.limit)
      ? "LIMIT @limit"
      : "";

  if (limit_clause) {
    values.limit = filters.limit as number;
  }

  const rows = database
    .prepare(
      `SELECT * FROM orders
       ${where_clause}
       ORDER BY datetime(created_at) DESC
       ${limit_clause}`,
    )
    .all(values) as OrderRow[];

  return rows.map((row) => deserialize_order(row)).filter(Boolean) as OrderRecord[];
}

export function upsert_email_capture(
  input: Partial<EmailCaptureRecord> & Pick<EmailCaptureRecord, "id" | "email">,
) {
  const database = get_database();
  const entries = EMAIL_CAPTURE_COLUMNS.flatMap((column) => {
    const value = serialize_value(column, input[column]);
    return value === undefined ? [] : [[column, value] as const];
  });

  const values = Object.fromEntries(entries);

  database
    .prepare(
      `INSERT INTO email_captures (id, email, listing_url, vehicle_summary, converted_to_order)
       VALUES (@id, @email, @listing_url, @vehicle_summary, @converted_to_order)
       ON CONFLICT(email) DO UPDATE SET
         listing_url = excluded.listing_url,
         vehicle_summary = excluded.vehicle_summary,
         converted_to_order = COALESCE(email_captures.converted_to_order, excluded.converted_to_order)`,
    )
    .run({
      id: values.id,
      email: values.email,
      listing_url: values.listing_url ?? null,
      vehicle_summary: values.vehicle_summary ?? null,
      converted_to_order: values.converted_to_order ?? null,
    });

  return get_email_capture_by_email(input.email);
}

export function get_email_capture_by_email(email: string) {
  const database = get_database();
  const row = database
    .prepare("SELECT * FROM email_captures WHERE email = ?")
    .get(email) as EmailCaptureRecord | undefined;

  return deserialize_email_capture(row);
}

export function link_email_capture_to_order(email: string, order_id: string) {
  const database = get_database();
  database
    .prepare(
      "UPDATE email_captures SET converted_to_order = @order_id WHERE email = @email",
    )
    .run({ email, order_id });

  return get_email_capture_by_email(email);
}

export function get_dashboard_payload(): DashboardPayload {
  const database = get_database();
  const recent_orders = list_orders({ limit: 8 });

  const counts = database
    .prepare(
      `SELECT
        COUNT(CASE WHEN status IN ('pending', 'processing', 'awaiting_review') THEN 1 END) AS new_orders_count,
        COUNT(CASE WHEN status = 'awaiting_review' THEN 1 END) AS awaiting_review_count,
        COUNT(CASE WHEN status = 'complete' AND date(report_sent_at, 'localtime') = date('now', 'localtime') THEN 1 END) AS completed_today_count
       FROM orders`,
    )
    .get() as DashboardStats;

  const revenue = database
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN status != 'refunded' AND date(created_at, 'localtime') = date('now', 'localtime') THEN price_cents END), 0) AS revenue_today_cents,
        COALESCE(SUM(CASE WHEN status != 'refunded' AND datetime(created_at, 'localtime') >= datetime('now', '-7 days', 'localtime') THEN price_cents END), 0) AS revenue_week_cents,
        COALESCE(SUM(CASE WHEN status != 'refunded' AND datetime(created_at, 'localtime') >= datetime('now', '-1 month', 'localtime') THEN price_cents END), 0) AS revenue_month_cents
       FROM orders`,
    )
    .get() as Pick<
      DashboardStats,
      "revenue_today_cents" | "revenue_week_cents" | "revenue_month_cents"
    >;

  return {
    stats: {
      new_orders_count: counts.new_orders_count ?? 0,
      awaiting_review_count: counts.awaiting_review_count ?? 0,
      completed_today_count: counts.completed_today_count ?? 0,
      revenue_today_cents: revenue.revenue_today_cents ?? 0,
      revenue_week_cents: revenue.revenue_week_cents ?? 0,
      revenue_month_cents: revenue.revenue_month_cents ?? 0,
    },
    recent_orders,
  };
}

export function mark_order_refunded(stripe_payment_intent: string) {
  const existing_order = get_order_by_payment_intent(stripe_payment_intent);

  if (!existing_order) {
    return null;
  }

  return update_order(existing_order.id, { status: "refunded" });
}

export function touch_database() {
  get_database();
}

export { to_sqlite_datetime };
