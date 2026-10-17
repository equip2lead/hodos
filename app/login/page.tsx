"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Email magic link for now (free, works today). Phone SMS/WhatsApp codes come
// once an SMS provider is connected in Supabase Auth.
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/";
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setError(error.message);
      setState("error");
    } else {
      setState("sent");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-5 py-12">
      <a href="/" className="font-bold text-hodos-red">← Hodos</a>
      <h1 className="font-display text-3xl font-extrabold">Connexion · Log in</h1>
      {state === "sent" ? (
        <p className="rounded-2xl bg-hodos-blush p-4">
          Lien envoyé à <b>{email}</b>. Ouvrez votre e-mail pour vous connecter.
          <br />
          Link sent to <b>{email}</b>. Open your email to sign in.
        </p>
      ) : (
        <form onSubmit={send} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-bold">
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-14 rounded-2xl border-[1.5px] border-zinc-200 px-4 text-base font-medium"
            />
          </label>
          <button
            disabled={state === "sending"}
            className="min-h-14 rounded-2xl bg-hodos-red text-lg font-bold text-white disabled:opacity-60"
          >
            {state === "sending" ? "…" : "Recevoir un lien · Send me a link"}
          </button>
          {state === "error" && <p className="text-sm text-hodos-deep">{error}</p>}
        </form>
      )}
    </main>
  );
}
