# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Laravel 12 + Inertia.js + React 19 + TypeScript, Tailwind CSS v4 (Vite), MySQL (Laragon). Chosen by the user: Laravel with React.

## Users

- **Visitors** of the public landing: managers and owners of growing companies in Lima (several sites, ERP, internet providers, servers) who decide on IT support. Inferred from the brochure's language; the user has not named the audience explicitly.
- **Administrators** of the panel: people with a login who manage campaigns, the navbar, the color theme and the incoming contacts.

## Product Purpose

An administrable marketing landing whose goal is to sell one service at a time through **campaigns**. An administrator loads a campaign (angle, headline, sections, packages, call to action) from the panel, the landing shows it, and the next month a different one replaces it without touching code. The first campaign promotes **UCO360**, an outsourced IT department ("Área de TI externa") sold as a fixed monthly fee by PROINNOVATEC by Grupo CAME. The landing's conversion is scheduling an initial diagnostic meeting.

## Positioning

UCO360 replaces the reactive freelance technician ("apaga-incendios") with a preventive multidisciplinary team: weekly on-site visit, WhatsApp support with tickets, monitored backups with real restore tests, management of the client's providers (internet/ERP), a living asset inventory, and a monthly executive report in business language, for a predictable fixed monthly fee.

## Operating Context

The project is a Laravel application served locally through Laragon (`http://landing-page-innovatec.test`). A previous static landing (PROINNOVATEC, División Telcos) exists only in git history; the user asked to carry nothing over from it. Source material is the commercial brochure `Brochure_Comercial_UCO360.pdf` (9 slides, kept in the working scratch area, not in the repository).

## Capabilities and Constraints

- Built: login, admin panel (campaigns, orderable sections with per-section background, text color, alignment, spacing and width; site settings for navbar, color theme, typography, contact and footer; leads inbox), and the public landing rendering the active campaign.
- Only one campaign is active at a time; activating another archives the previous one without deleting it.
- Colors in sections, navbar and footer can reference theme color names so they follow the theme when it changes.
- Contact: ventas@proinnovatec.com, WhatsApp 970 855 741, +511 748-3615, Av. Javier Prado Este Nro. 1166 Of 801 - San Isidro, Lima, www.proinnovatec.com (from the brochure).
- Explicitly undecided: package names, contents and prices (the Packages section exists but is hidden); whether the diagnostic is free; the visitor audience in the user's own words; real social proof.

## Brand Commitments

- Name: UCO360, "by PROINNOVATEC" / "PROINNOVATEC BY GRUPO CAME".
- Palette (binding, from the brochure): night blue `#161443`, vivid blue `#1c53ee`, orange `#ff9c34`, pale cyan `#e8f9ff`. Diagonal "blade" cuts in blue and orange are a brochure motif. The theme is editable from the panel.
- Logo and an office-meeting photo were cropped from the brochure (`public/brand/`, `public/images/`); the photo is low resolution and should be replaced by the original.

## Evidence on Hand

Only the brochure: service description, four pillars, comparison against a freelance technician, implementation in three steps, monthly deliverables, contact data. No clients, testimonials, figures, response times or prices exist, and none may be invented.

## Product Principles

- The landing sells one thing clearly; it is not a catalogue of everything the company does.
- Everything a visitor reads is administrable by the panel's users, not hard-coded. The unit of administration is the campaign, not the page.
- Changing the offered angle is a routine task for a non-developer, repeated every campaign.
- Never present unverified claims (prices, clients, numbers) as facts.
