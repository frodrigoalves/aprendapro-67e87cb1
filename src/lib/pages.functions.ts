import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getPublicPage = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(255) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: page, error } = await supabaseAdmin
      .from("pages")
      .select("product_name, slug, sections")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return page;
  });
