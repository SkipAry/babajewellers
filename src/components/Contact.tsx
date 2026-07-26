"use client";

import { useState, type FormEvent } from "react";
import { occasions, site, telLink, whatsappLink } from "@/data/site";
import { trackEvent } from "@/lib/analytics";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

type Status = "idle" | "submitting" | "success" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    if (!data.get("consent")) {
      setStatus("error");
      setErrorMsg("Please accept the privacy consent to continue.");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch(site.formEndpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("success");
      trackEvent("form_submit_success", {
        occasion: String(data.get("occasion") || ""),
      });
      form.reset();
    } catch {
      setStatus("error");
      setErrorMsg(
        `We could not send your enquiry. Please try again, or reach us directly on ${site.phoneDisplay} or WhatsApp.`
      );
      trackEvent("form_submit_error");
    }
  }

  const inputClass =
    "w-full rounded-sm border border-maroon/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-gold-dark";
  const labelClass = "mb-1.5 block text-sm font-medium text-maroon-deep";

  return (
    <section id="contact" className="bg-ivory py-16 pb-28 md:py-24 md:pb-24">
      <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          {/* Form */}
          <div>
            <SectionHeading
              align="left"
              label="Send an Enquiry"
              title="Tell Us What You Are Looking For"
              intro="Share a few details and we will get back to you — or simply message us on WhatsApp."
            />

            {status === "success" ? (
              <Reveal className="mt-10">
                <div
                  role="status"
                  className="border-l-2 border-gold bg-white p-8 shadow-sm"
                >
                  <p className="font-display text-2xl font-bold text-maroon-deep">
                    Thank you — we have received your enquiry.
                  </p>
                  <p className="mt-3 text-base text-ink/70">
                    Our team will contact you soon. For anything urgent, call{" "}
                    <a href={telLink} className="font-semibold text-maroon">
                      {site.phoneDisplay}
                    </a>{" "}
                    or message us on WhatsApp.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-6 text-sm font-semibold text-maroon underline-offset-4 hover:underline"
                  >
                    Send another enquiry
                  </button>
                </div>
              </Reveal>
            ) : (
              <form onSubmit={handleSubmit} className="mt-10 grid gap-5 sm:grid-cols-2">
                {/* Honeypot — Formspree discards submissions where this is filled */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="company">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="_gotcha"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label htmlFor="fullName" className={labelClass}>
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    className={inputClass}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="mobile" className={labelClass}>
                    Mobile Number *
                  </label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    inputMode="tel"
                    pattern="[0-9+\-\s]{10,15}"
                    autoComplete="tel"
                    className={inputClass}
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div>
                  <label htmlFor="occasion" className={labelClass}>
                    Occasion *
                  </label>
                  <select
                    id="occasion"
                    name="occasion"
                    required
                    defaultValue=""
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Select occasion
                    </option>
                    {occasions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="interest" className={labelClass}>
                    Interested In
                  </label>
                  <input
                    id="interest"
                    name="interest"
                    type="text"
                    className={inputClass}
                    placeholder="e.g. bridal set, bangles, jhumkas"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="message" className={labelClass}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className={inputClass}
                    placeholder="Tell us a little about what you have in mind."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-start gap-3 text-sm text-ink/60">
                    <input
                      type="checkbox"
                      name="consent"
                      required
                      className="mt-0.5 h-4 w-4 accent-maroon"
                    />
                    <span>
                      I agree that Baba Jewellers may contact me about this
                      enquiry. My details will not be shared with third
                      parties. *
                    </span>
                  </label>
                </div>

                {status === "error" ? (
                  <p
                    role="alert"
                    className="border-l-2 border-maroon bg-white p-4 text-sm text-maroon-deep sm:col-span-2"
                  >
                    {errorMsg}
                  </p>
                ) : null}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full rounded-sm bg-maroon px-8 py-4 text-base font-semibold text-gold-light transition-colors hover:bg-maroon-deep disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {status === "submitting" ? "Sending…" : "Send Enquiry"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Direct contact panel */}
          <Reveal delay={0.1}>
            <div className="border border-maroon/15 bg-white p-7 md:p-8">
              <h3 className="font-display text-xl font-bold text-maroon-deep">
                Reach Us Directly
              </h3>
              <dl className="mt-6 space-y-6 text-sm leading-relaxed">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-caps text-ink/50">
                    Phone
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={telLink}
                      onClick={() => trackEvent("cta_call", { placement: "contact_panel" })}
                      className="font-display text-xl font-bold text-maroon hover:text-maroon-deep"
                    >
                      {site.phoneDisplay}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-caps text-ink/50">
                    WhatsApp
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent("cta_whatsapp", { placement: "contact_panel" })}
                      className="font-medium text-maroon underline-offset-4 hover:underline"
                    >
                      Start a WhatsApp chat →
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-caps text-ink/50">
                    Instagram
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={site.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent("cta_instagram", { placement: "contact_panel" })}
                      className="font-medium text-maroon underline-offset-4 hover:underline"
                    >
                      @babajewellersofficial →
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-caps text-ink/50">
                    Business Hours
                  </dt>
                  <dd className="mt-1 text-ink/80">{site.businessHours}</dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
