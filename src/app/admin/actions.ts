"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  get_admin_cookie_value,
  is_valid_admin_password,
} from "@/lib/admin-auth";
import { save_order_review, send_order_deliverables } from "@/lib/engine";

export async function login_action(form_data: FormData) {
  const password = String(form_data.get("password") ?? "");

  if (!is_valid_admin_password(password)) {
    redirect("/admin/login?error=1");
  }

  const cookie_store = await cookies();
  cookie_store.set({
    name: ADMIN_COOKIE_NAME,
    value: get_admin_cookie_value(),
    httpOnly: true,
    maxAge: 60 * 60 * 12,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/admin");
}

export async function logout_action() {
  const cookie_store = await cookies();
  cookie_store.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

export async function save_review_action(form_data: FormData) {
  const order_id = String(form_data.get("order_id") ?? "");
  const dealer_verdict = String(form_data.get("dealer_verdict") ?? "");
  const ppsr_result = String(form_data.get("ppsr_result") ?? "");

  if (!order_id) {
    redirect("/admin/orders");
  }

  save_order_review(order_id, {
    dealer_verdict,
    ppsr_result,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order_id}`);
  redirect(`/admin/orders/${order_id}?updated=review`);
}

export async function send_report_action(form_data: FormData) {
  const order_id = String(form_data.get("order_id") ?? "");

  if (!order_id) {
    redirect("/admin/orders");
  }

  await send_order_deliverables(order_id);

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order_id}`);
  redirect(`/admin/orders/${order_id}?updated=sent`);
}
