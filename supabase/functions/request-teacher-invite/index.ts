import { createClient } from "https://esm.sh/@supabase/supabase-js@2.118.0";

const responseHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
};

function jsonResponse(status: number, body: Record<string, string>, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...responseHeaders,
      "Access-Control-Allow-Origin": origin,
    },
  });
}

Deno.serve(async (request: Request) => {
  const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const requestOrigin = request.headers.get("origin") ?? "";

  if (!allowedOrigins.includes(requestOrigin)) {
    return new Response("Origin not allowed", { status: 403 });
  }

  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        ...responseHeaders,
        "Access-Control-Allow-Origin": requestOrigin,
      },
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" }, requestOrigin);
  }

  let email: string;
  try {
    const body = await request.json();
    email =
      body && typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
  } catch {
    return jsonResponse(400, { error: "Invalid request" }, requestOrigin);
  }

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return jsonResponse(400, { error: "Enter a valid email address" }, requestOrigin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("FROM_EMAIL");
  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !fromEmail) {
    console.error("Teacher invite email service is not fully configured.");
    return jsonResponse(503, { error: "Invite email service unavailable" }, requestOrigin);
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientIp = request.headers.get("cf-connecting-ip") ?? forwardedFor ?? "unknown";
  const ipDigest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(clientIp),
  );
  const ipHash = Array.from(new Uint8Array(ipDigest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: code, error: issueError } = await supabase.rpc(
    "issue_teacher_invite",
    { input_email: email, input_ip_hash: ipHash },
  );

  if (issueError) {
    console.error("Could not issue teacher invite:", issueError.message);
    return jsonResponse(500, { error: "Could not process invite request" }, requestOrigin);
  }

  if (code) {
    try {
      const mailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: "Tu invitación docente a Lumora",
          text: `Tu código privado para activar el espacio docente de Lumora es: ${code}\n\nEl código vence en 24 horas y solo puede utilizarse una vez. Si no solicitaste esta invitación, ignora este correo.`,
          html: `<p>Tu código privado para activar el espacio docente de Lumora es:</p><p style="font-size:20px;font-weight:bold;letter-spacing:2px">${code}</p><p>El código vence en 24 horas y solo puede utilizarse una vez. Si no solicitaste esta invitación, ignora este correo.</p>`,
        }),
      });

      if (mailResponse.ok) {
        return jsonResponse(
          200,
          {
            message:
              "Si la solicitud pudo procesarse, recibirás un correo con el código de invitación.",
          },
          requestOrigin,
        );
      }

      console.error(
        "Email provider rejected teacher invite with status:",
        mailResponse.status,
      );
    } catch (mailError) {
      console.error("Could not contact the email provider:", mailError);
    }

    const { error: cancelError } = await supabase.rpc(
      "cancel_unsent_teacher_invite",
      { input_code: code },
    );
    if (cancelError) {
      console.error("Could not cancel unsent teacher invite:", cancelError.message);
    }
    return jsonResponse(502, { error: "Could not send invite email" }, requestOrigin);
  }

  return jsonResponse(
    200,
    {
      message:
        "Si la solicitud pudo procesarse, recibirás un correo con el código de invitación.",
    },
    requestOrigin,
  );
});
