import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "./db";
import { verifyToken, COOKIE_NAME } from "./auth";
import { getCookie } from "vinxi/http";

const requireAuth = () => {
  const token = getCookie(COOKIE_NAME);
  if (!token) throw new Error("Não autorizado");
  const payload = verifyToken(token);
  if (!payload) throw new Error("Não autorizado");
  return payload;
};

export const listPagesFn = createServerFn({ method: "GET" }).handler(async () => {
  requireAuth();
  return db.page.findMany({ orderBy: { createdAt: "desc" } });
});

export const getPageBySlugFn = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => z.object({ slug: z.string() }).parse(i))
  .handler(async ({ data }) => {
    return db.page.findFirst({ where: { slug: data.slug, status: "published" } });
  });

export const upsertPageFn = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({
    id: z.string().optional(),
    slug: z.string(),
    productName: z.string(),
    status: z.string(),
    sections: z.any(),
  }).parse(i))
  .handler(async ({ data }) => {
    requireAuth();
    if (data.id) {
      return db.page.update({ where: { id: data.id }, data: { slug: data.slug, productName: data.productName, status: data.status, sections: data.sections } });
    }
    return db.page.create({ data: { slug: data.slug, productName: data.productName, status: data.status, sections: data.sections } });
  });

export const deletePageFn = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ id: z.string() }).parse(i))
  .handler(async ({ data }) => {
    requireAuth();
    await db.page.delete({ where: { id: data.id } });
    return { ok: true };
  });
