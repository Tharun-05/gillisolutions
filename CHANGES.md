# Audit & changes

## 1. Urgent — do these yourselves

1. **Remove `IMG-20250108-WA0000.jpg` from the repository and its history.** It is a personal
   biodata document (name, phone, home address, salary) and was publicly reachable on the live
   site, because the old workflow published the whole repository. Deleting it in a new commit is
   not enough; use `git filter-repo --path IMG-20250108-WA0000.jpg --invert-paths` or BFG, then
   force-push.
2. **Delete `mailService.py`.** It was never used by the site and is a place where an email
   password would end up committed. If a real password was ever in it, change that password.
3. Hosting: the recommended setup is free Cloudflare Pages (**HOSTING-GUIDE.md**), which publishes
   only the public website files. If you stay on cPanel, old files on the server must be removed
   once by hand (**DEPLOY-CPANEL.md**, step 2). Either way, delete the biodata image from the
   current cPanel server now.

## 2. Bugs fixed

| Problem | Where | Fix |
|---|---|---|
| Script crashed on most pages (product-detail code, carousel and `emailjs.init` ran everywhere) | `script.js` | Every feature now checks its elements exist first |
| Forced 3–4 s loader on every page; hero hidden 3 s for a non-existent "door animation" | `page-loader-simple.js`, `script.js` | Removed |
| Testimonial slider never moved (`\${…}` escaped inside template literal) | `service.js`, `product-details.js` | Slider removed (fabricated testimonials); pattern not reused |
| Chatbot answered about ovens, fridges, espresso machines in US dollars | `support_chat.js` | Rebuilt around real products and services |
| Chat rendered visitor text as HTML (XSS) | `support_chat.js` | Visitor text is always plain text; AI output is escaped |
| "hi" matched inside "this", "which"; "duct" would match "product" | `support_chat.js` | Whole-word matching |
| Identical fake reviews ("super strong motor") on every product, including filters and dampers | `script.js` | Removed |
| Filter sizes in feet (`10'x20'`) instead of inches; duplicated spec line; typo "installationS" | `script.js` | Corrected |
| Footer links like `services.html#maintenance` didn't open the matching tab | `services.html` | Services are now sections with working anchors |
| Contact form redirected visitors to web3forms.com; EmailJS handler never attached | all forms | One form, sent in the background, confirmation shown on the page |
| Project thumbnails downloaded full-size images (Unsplash-style parameters ignored by ImageKit) | `clients.html` | Proper ImageKit resizing (`?tr=w-640…`) |
| `Products.html` vs `products.html` would overwrite each other on Windows/macOS | — | Old capitalised links are redirected from `404.html` |
| Emergency line `+1 234 567 8911` (US placeholder) | `contact.html` | Removed |
| Arrow keys on product page hijacked even while typing | `product-navigation.js` | Ignored while focus is in a form field |

## 3. Redundant code removed

- Libraries never used: Three.js (its `GLTFLoader` path doesn't exist in that version), GSAP,
  Swiper, EmailJS, jQuery, Lightbox2, AOS, and two versions of Font Awesome (~1 MB in total).
  Replaced with a few inline SVG icons and a native `<dialog>` lightbox.
- Unused files: `home.html` (duplicate of `index.html`, now a redirect), `menu-fix.js`,
  `product-details.js`, `home.css`, `test.html`, `.vscode/settings.json`.
- Menu functions copy-pasted into five files; header and footer hand-copied into eight pages.
  Now defined once in `tools/build.py`.
- 12 overlapping CSS files (≈ 6,500 lines, `:root` defined three times) → one `site.css`.
- Large commented-out blocks (old team members, certifications, pricing plans, newsletter).

## 4. Content changes to review

- **Services** copy rewritten for ventilation (old text was a generic template about ovens and
  freezers). Bullet lists are proposed wording — please check they match what you offer.
- **Testimonials** removed — they named a freezer breakdown and placeholder people. Add real
  quotes from clients when you have them.
- **Home "Why choose us" stats** (40% productivity, 95% safety rating) removed as unsupported.
- **Certification claims** (NSF, UL, AMCA) changed to "design reference" wording. Only claim
  certifications you hold.
- **Conflicting facts** — choose one value each in `src/site.json`: installations
  (250+ / 425 / 500), hours (Mon–Sat vs Mon–Fri + Sat half-day), warranty (90 days / 1 yr / 2 yrs).
- **Privacy notice** is a short plain-language draft; have it reviewed.
- **Social links** pointed to `#`; they're hidden until you add real URLs in `src/site.json`.
- **Product photos**: six are hot-linked from Bing, Amazon, MDPI and a watermarked CGTrader
  3D model. Replace with your own photos.

## 5. Security hardening

- Content-Security-Policy on every page (see README → Security). Tested against four simulated
  attacks — injected inline script, outside script, data sent to an outside server, image beacon —
  all blocked by the browser, while every feature works with zero blocked requests.
- Inline scripts and `onerror=` handlers moved into script files.
- Third-party code self-hosted and pinned (MapLibre 6.16.0, map fonts); no CDN scripts on public pages.
- HSTS (HTTPS-only) on Cloudflare; long-term caching only for versioned vendor files.

## 6. New

- Interactive black-and-gold scenes at the top of Products, Services, Projects, About, Contact and the 404 page.

- Airflow estimator with live hood schematic, and "send this estimate" into the enquiry form.
- "Ask Gilli" assistant with suggested questions, chat handoff to the team, and optional AI mode.
- WhatsApp buttons on every enquiry point.
- Product search and category filters; product spec tables; quote button prefills the form.
- SEO: page descriptions, Open Graph tags, LocalBusiness and Product structured data, `robots.txt`.
- Accessibility: skip link, keyboard focus styles, labelled controls, reduced-motion support,
  video pause button.
