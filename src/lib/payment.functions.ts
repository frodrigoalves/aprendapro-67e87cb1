import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "./db";
import { randomUUID } from "crypto";

const ASAAS_URL = process.env.ASAAS_BASE_URL ?? "https://api.asaas.com/v3";
const ASAAS_KEY = process.env.ASAAS_API_KEY ?? "";

const asaas = (path: string, opts?: RequestInit) =>
  fetch(`${ASAAS_URL}${path}`, {
    ...opts,
    headers: { "access_token": ASAAS_KEY, "Content-Type": "application/json", ...opts?.headers },
  }).then(r => r.json());

export const createPixChargeFn = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({
    productType: z.enum(["slides", "word", "planilha"]),
    quantity: z.number(),
    tier: z.string(),
  }).parse(i))
  .handler(async ({ data }) => {
    const value = calcPrice(data.productType, data.quantity, data.tier);
    const charge = await asaas("/payments", {
      method: "POST",
      body: JSON.stringify({
        billingType: "PIX",
        value,
        dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString().split("T")[0],
        description: `Criador — ${data.productType}`,
      }),
    });
    const pix = await asaas(`/payments/${charge.id}/pixQrCode`);
    return { chargeId: charge.id, value, qrCode: pix.encodedImage, copyPaste: pix.payload };
  });

export const checkPaymentFn = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => z.object({ chargeId: z.string() }).parse(i))
  .handler(async ({ data }) => {
    const charge = await asaas(`/payments/${data.chargeId}`);
    if (charge.status === "RECEIVED" || charge.status === "CONFIRMED") {
      const token = randomUUID();
      await db.paymentToken.create({
        data: { token, expiresAt: new Date(Date.now() + 30 * 60 * 1000), metadata: { chargeId: data.chargeId } },
      });
      return { paid: true, token };
    }
    return { paid: false };
  });

export const validateTokenFn = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ token: z.string() }).parse(i))
  .handler(async ({ data }) => {
    const record = await db.paymentToken.findUnique({ where: { token: data.token } });
    if (!record || record.used || record.expiresAt < new Date()) return { valid: false };
    await db.paymentToken.update({ where: { token: data.token }, data: { used: true } });
    return { valid: true };
  });

function calcPrice(type: string, qty: number, tier: string): number {
  if (type === "slides") {
    const base = 65;
    const extra = qty > 10 ? Math.ceil((qty - 10) / 3) * 12 : 0;
    return base + extra;
  }
  if (type === "word") {
    if (tier === "complex") return 79;
    if (qty > 5) return 59;
    return 39;
  }
  if (type === "planilha") {
    if (tier === "bi") return 127;
    if (tier === "dashboard") return 97;
    if (tier === "formulas") return 65;
    return 49;
  }
  return 49;
}
