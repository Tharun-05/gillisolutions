# Hosting the Gilli Solutions website yourselves — step by step

**What you'll have at the end**

| Thing | Where | Cost |
|---|---|---|
| Domain name (e.g. `gillisolutions.com`) | Your registrar, later Cloudflare | Yearly renewal only |
| Website files and history | GitHub, in your company's account | Free |
| Hosting, HTTPS certificate, speed | Cloudflare Pages, your company's account | Free |
| Contact form emails | Web3Forms → your Gmail | Free |
| Adding logos and photos | Your site's `/admin/` page | Free |

Every account is in **your company's name**. The code is yours, so you can move to any other
host at any time. Plan for about **2 hours** for the first setup, spread over a day or two
(domain changes take a few hours to take effect).

> Menu names on Cloudflare and GitHub change from time to time. If a button isn't named
> exactly as written here, look for the closest match.

---

## Part 1 — Create the two accounts (15 minutes)

Use a **company email** for both (for example `gillisolutions@gmail.com`), not a personal one,
so the accounts stay with the company if someone leaves.

1. **GitHub:** go to github.com → **Sign up**.
2. **Cloudflare:** go to cloudflare.com → **Sign up** → choose the **Free** plan whenever asked.
3. **Turn on two-step login on both** (Settings → Password and authentication / Security).
   Save the **recovery codes** they show you somewhere safe, like a printed copy in the office file.
   *Losing access to these accounts is now the biggest risk, so don't skip this.*
4. **Add a second owner** (a second trusted person) on both, so one person leaving or losing
   a phone never locks the company out.

## Part 2 — Put the website on GitHub (15 minutes)

If the website repository already exists on GitHub, use it. Otherwise:

1. GitHub → **+** (top right) → **New repository** → name it `gillisolutions` →
   **Private** → **Create repository**.
2. Unzip `gilli-solutions-website.zip` on your computer.
3. On the new repository page click **uploading an existing file**, drag in **all** the
   unzipped files and folders, and click **Commit changes**.
   (Developers can use `git push` instead.)

Hidden files whose names start with a dot (`.github`, `.gitignore`, `.htaccess`) may not show in
your file browser. If they don't upload, it doesn't matter for Cloudflare hosting.

## Part 3 — Put the website online with Cloudflare Pages (15 minutes)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** (or *Import an existing Git repository*).
2. Allow Cloudflare to access GitHub and choose the `gillisolutions` repository.
3. Enter these build settings exactly:

   | Setting | Value |
   |---|---|
   | Production branch | `main` |
   | Framework preset | `None` |
   | Build command | `pip install pillow && python tools/build.py --out _site` |
   | Build output directory | `_site` |
   | Environment variable | Name `PYTHON_VERSION`, value `3.12` |

4. Click **Save and Deploy**. After 1–2 minutes you get a free address like
   `gillisolutions.pages.dev`.
5. **Open it and check every page**, the estimator, the WhatsApp button and the
   contact form (send yourself a test enquiry).

Your real domain still shows the old cPanel site at this point. Nothing has changed for visitors yet.

## Part 4 — Connect your domain to Cloudflare (30 minutes + waiting)

**You already own your domain**, so you don't buy anything. You only change two settings at the
company you pay for the domain.

1. Find where your domain is registered: go to **lookup.icann.org**, type your domain, and
   note the **Registrar** name. Log in to that company's website (this may be your hosting
   company's billing area, not cPanel).
2. Cloudflare dashboard → **Add a domain** → type your domain → choose the **Free** plan.
3. Cloudflare copies your existing settings automatically. **Check that the list includes
   `MX` records** if you use email on your domain — those keep your email working.
4. Cloudflare shows **two nameservers**, like `ana.ns.cloudflare.com` and `bob.ns.cloudflare.com`.
5. At your registrar: open the domain → **Nameservers** → choose **Custom** → replace the
   existing ones with Cloudflare's two → **Save**.
6. Wait. Cloudflare emails you when the domain is **Active** — usually within a few hours,
   occasionally up to 48.

*Buying a brand-new domain instead?* Cloudflare dashboard → **Domain Registration** →
**Register Domains** → search, pay, done. It is already connected, so skip to Part 5.

## Part 5 — Show the website on your domain (5 minutes)

1. Cloudflare → **Workers & Pages** → your project → **Custom domains** → **Set up a custom domain**.
2. Add `yourdomain.com` → confirm. Then add `www.yourdomain.com` the same way.
3. Within a few minutes both addresses show the new website, with the HTTPS padlock set up
   automatically.

## Part 6 — Email on your domain (only if you use it)

If you have addresses like `info@yourdomain.com`, they currently live on the cPanel hosting.
Choose **one** option before cancelling cPanel:

- **Just receive mail in Gmail (free):** Cloudflare → your domain → **Email** →
  **Email Routing** → turn on → add `info@yourdomain.com` → forward to your Gmail.
- **Full mailboxes that can also send from `info@`:** sign up for a business email service
  (Zoho Mail has offered a free plan for small teams; Google Workspace is paid) and follow
  its setup steps, which add a few records in Cloudflare.

Before cancelling cPanel, **download any old emails you want to keep** (cPanel → Email Accounts
→ Check Email, or connect the mailbox to Outlook or Thunderbird).

## Part 7 — Turn on the admin page for logos and photos (10 minutes)

1. In GitHub, open `admin/config.yml` → ✏️ **Edit** → change `CHANGE-ME/gillisolutions` to your
   GitHub name and repository (as in the address `github.com/NAME/gillisolutions`) →
   **Commit changes**.
2. Each person who will add logos or photos follows **ADMIN-GUIDE.md** to create their sign-in token.
3. Test it: open `yourdomain.com/admin/`, add a test client, save, wait 2 minutes, check the home
   page, then remove the test client.

## Part 8 — Final checks (10 minutes)

On your phone **and** a computer, using your real domain:

- [ ] Home page loads with the padlock (https)
- [ ] Products, a product page, Services, Projects, About and Contact all open
- [ ] The contact form sends, and the email arrives in Gmail
- [ ] The WhatsApp button opens WhatsApp with a message
- [ ] An old link such as `yourdomain.com/Products.html` still works
- [ ] A wrong address such as `yourdomain.com/xyz` shows the "page not found" page
- [ ] Email to `info@yourdomain.com` arrives (if you use it)

## Part 9 — Cancel the cPanel hosting (after one week)

Wait **one full week** with everything working. Then:

1. Download a final backup from cPanel (File Manager → compress `public_html` → download),
   and your old emails if not done yet.
2. With your hosting company, cancel **hosting only**. Read the cancellation screen carefully
   and make sure the **domain is not included** in the cancellation.
3. If the domain was registered through the hosting company, it can stay there. Its
   nameservers now point to Cloudflare. Just keep paying its yearly renewal, or do Part 10.

## Part 10 — Optional: move the domain itself to Cloudflare (at renewal time)

Cloudflare Registrar charges the domain at cost, the same price every year, and keeps everything
in one place. It doesn't support every domain ending, so check yours is listed.

1. At your current registrar: turn off **Domain lock**, and request the **transfer code**
   (also called EPP or auth code).
2. Cloudflare → **Domain Registration** → **Transfer Domains** → select your domain → enter
   the code → pay. This adds one year to the registration, so nothing is lost.
3. Approve the confirmation email if one arrives. It completes in about 5–7 days, and the website
   keeps working throughout.

A domain can't be transferred within 60 days of being registered or transferred, so do this a
month or two before the renewal date.

---

## Looking after the website

| How often | What to do |
|---|---|
| **Any time** | Add client logos and project photos at `/admin/` (ADMIN-GUIDE.md) |
| **Monthly** | Send yourself a test enquiry from the contact form. Open the site on a phone. |
| **Every 3 months** | GitHub → repository → **Code** → **Download ZIP**, and keep it as an offline backup. |
| **Yearly** | Domain renewal. Turn on **auto-renew** at your registrar, keep a valid card on file, and keep the renewal reminder email address checked. |
| **Yearly** | Admin sign-in tokens expire (up to one year). Create new ones (ADMIN-GUIDE.md). |
| **When someone leaves** | Remove them from GitHub and Cloudflare, and delete their tokens. |

**Security headers are automatic.** Cloudflare reads them from `_headers`, which the build
keeps up to date. If you add an outside service (for example a YouTube video), ask the developer
to add it to the site's security policy, or browsers will block it.

**If the website ever looks broken after a change:** Cloudflare → **Workers & Pages** → your
project → **Deployments** → find the last working version → **⋯** → **Rollback**. The site is
restored within a minute.

**If a domain renewal is missed:** the website and email stop working, but registrars give a
grace period (often around 30 days). Renew immediately at your registrar and everything returns.
