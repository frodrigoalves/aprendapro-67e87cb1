import { createServerFn } from "@tanstack/react-start";

export const bootstrapAdmin = createServerFn({ method: "POST" }).handler(
  async () => {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      return { created: false, reason: "missing-env" as const };
    }

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    // Check if any user already exists
    const { data: list, error: listError } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (listError) {
      console.error("listUsers failed:", listError);
      return { created: false, reason: "list-failed" as const };
    }
    if (list.users.length > 0) {
      return { created: false, reason: "already-exists" as const };
    }

    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) {
      console.error("createUser failed:", createError);
      return { created: false, reason: "create-failed" as const };
    }

    return { created: true, email };
  },
);
