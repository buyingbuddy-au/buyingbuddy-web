import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE_NAME = "buyingbuddy_admin";

function hash_value(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function get_admin_password() {
  return process.env.ADMIN_PASSWORD?.trim() ?? "";
}

export function is_valid_admin_password(candidate: string) {
  const configured = get_admin_password();

  if (!configured) {
    return true;
  }

  return candidate === configured;
}

export function get_admin_cookie_value() {
  const configured = get_admin_password();
  return configured ? hash_value(configured) : "development-open";
}

export async function is_admin_authenticated() {
  const configured = get_admin_password();

  if (!configured) {
    return true;
  }

  const cookie_store = await cookies();
  return cookie_store.get(ADMIN_COOKIE_NAME)?.value === get_admin_cookie_value();
}

export async function require_admin_page_access() {
  const authenticated = await is_admin_authenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }
}

export function is_admin_request(request: Request) {
  const configured = get_admin_password();

  if (!configured) {
    return true;
  }

  const header_password = request.headers.get("x-admin-password");
  if (header_password && is_valid_admin_password(header_password)) {
    return true;
  }

  const cookie_header = request.headers.get("cookie") ?? "";
  return cookie_header.includes(`${ADMIN_COOKIE_NAME}=${get_admin_cookie_value()}`);
}
