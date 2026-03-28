export function to_sqlite_datetime(date = new Date()) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}
