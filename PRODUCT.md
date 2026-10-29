# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Laravel 12 + Inertia.js + React 19 + TypeScript, Tailwind CSS v4 (Vite), MySQL (Laragon). Chosen by the user: Laravel with React.

## Users

- **Visitors** of the public landing: audience not yet defined (open decision, see below).
- **Administrators** of the panel: people with a login who manage the landing. The user wants support for panel users.

## Product Purpose

An administrable marketing landing page whose goal is to sell, via marketing, one product or service at a time. The core idea is **campaigns**: an administrator loads a campaign (a product or service with all its landing content) from the panel, the landing shows it, and the following month they load a different one without touching code. The landing is managed from an admin panel behind a login.

## Positioning

Open decision: depends on the product or service, which the user will provide later.

## Operating Context

The project is a Laravel application served locally through Laragon (`http://landing-page-innovatec.test`). A previous static landing (PROINNOVATEC, División Telcos) exists only in git history; the user explicitly asked to carry nothing over from it.

## Capabilities and Constraints

- Built so far (basics only): authentication (login) and an admin panel shell with a sidebar.
- Not built yet, by the user's instruction: the public landing itself. Do not program it until the user supplies the product or service and its content.
- Confirmed: only one campaign is active (shown on the landing) at a time; activating another archives the previous one without deleting it.
- Explicitly undecided (the user said "not yet known"): how a campaign's content is structured (fixed template of fields vs. orderable sections), the visitor's conversion action (lead form, WhatsApp, phone/email, online purchase), the product or service itself, and the visitor audience.

## Evidence on Hand

None for the landing. No product copy, testimonials, customers, pricing, images or brand assets have been provided for the new landing, and none may be invented.

## Product Principles

- The landing sells one thing clearly; it is not a catalogue of everything the company does.
- Everything a visitor reads is administrable by the panel's users, not hard-coded. The unit of administration is the campaign, not the page.
- Changing the offered product or service is a routine task for a non-developer, repeated every campaign.
- Start with the basics and add features only when the user asks for them.
