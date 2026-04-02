# grandwestvet.com

Static WordPress export prepared for Cloudflare Pages.

## What this repo now includes

- Cloudflare Pages cache and security headers in `_headers`
- A Pages Function at `functions/api/forms.js` for form submissions
- A reusable client-side form bridge at `assets/js/forms-handler.js`
- A post-export cleanup script at `scripts/post-export-optimize.ps1`
- Local dev/deploy config in `wrangler.toml`

## Cloudflare Pages setup

1. Create or open the Pages project.
2. Set the build command to blank.
3. Set the build output directory to the repo root `.` if needed.
4. Redeploy after every new Simply Static export.

## Required secrets

Add these in Cloudflare Pages under `Settings -> Variables and Secrets`.

Supported option A:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `FORM_TO_EMAIL`

Supported option B:

- `RESEND_API_KEY`
- `CONTACT_FROM_NAME`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

Use `.dev.vars.example` as the local template for `wrangler pages dev`.

## Resend notes

- Verify a sending domain or subdomain in Resend for the address you plan to send from
- Use that verified address in `RESEND_FROM_EMAIL` or `CONTACT_FROM_EMAIL`
- Point `FORM_TO_EMAIL` or `CONTACT_TO_EMAIL` at the inbox that should receive website submissions

## After each fresh Simply Static export

Run:

```powershell
.\scripts\post-export-optimize.ps1 -Root .
```

That script:

- removes known unused WordPress/plugin export folders
- removes broken static-site WordPress API leftovers from HTML
- removes the old reCAPTCHA include
- injects the Cloudflare/Resend form handler into pages that contain Elementor forms
