import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "./db";
import { signToken, verifyPassword, hashPassword, verifyToken, COOKIE_NAME } from "./auth";
import { setCookie, getCookie, deleteCookie } from "vinxi/http";

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ email: z.string().email(), password: z.string().min(6) }).parse(i))
  .handler(async ({ data }) => {
    const user = await db.user.findUnique({ where: { email: data.email } });
    if (!user) throw new Error("Credenciais inválidas");
    const valid = await verifyPassword(data.password, user.password);
    if (!valid) throw new Error("Credenciais inválidas");
    const token = signToken(user.id);
    setCookie(COOKIE_NAME, token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" });
    return { ok: true };
  });

export const logoutFn = createServerFn({ method: "POST" })
  .handler(async () => {
    deleteCookie(COOKIE_NAME, { path: "/" });
    return { ok: true };
  });

export const getSessionFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const token = getCookie(COOKIE_NAME);
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload) return null;
    const user = await db.user.findUnique({ where: { id: payload.userId }, select: { id: true, email: true, role: true } });
    return user;
  });

export const bootstrapAdminFn = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ email: z.string().email(), password: z.string().min(6) }).parse(i))
  .handler(async ({ data }) => {
    const count = await db.user.count();
    if (count > 0) throw new Error("Admin já existe");
    const password = await hashPassword(data.password);
    await db.user.create({ data: { email: data.email, password, role: "admin" } });
    return { ok: true };
  });
