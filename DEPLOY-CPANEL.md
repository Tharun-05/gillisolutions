> **Only needed if you stay on cPanel.** The recommended setup is free Cloudflare hosting,
> described in **HOSTING-GUIDE.md**. If you follow that guide, you can ignore this file.

# Publishing the website to cPanel

After this one-time setup, every change pushed to GitHub — including logos and photos added
at `/admin/` — is built and uploaded to your cPanel hosting automatically in about 1–2 minutes.

## 1. Back up the current site (5 minutes)

cPanel → **File Manager** → select everything in `public_html` → **Compress** → download the zip.
If anything goes wrong, you can restore from this.

## 2. Remove the old site's files

The automatic upload adds and updates files, but **never deletes files it didn't upload**,
so the old site's files must be removed once by hand.

cPanel → **File Manager** → `public_html` → **Settings** (top right) → tick **Show Hidden Files**.
Then delete:

**Delete first — this is private information that is publicly accessible right now:**
- `IMG-20250108-WA0000.jpg` (a personal biodata document)

**Old site files:**
`about.css`, `about.js`, `clients.css`, `clients.js`, `common.css`, `contact.css`, `contact.js`,
`home.css`, `index.css`, `mailService.py`, `menu-fix.js`, `page-loader-simple.js`,
`page-loader.css`, `product-detail.css`, `product-details.js`, `product-navigation.css`,
`product-navigation.js`, `products.css`, `Products.html`, `script.js`, `service.js`,
`services.css`, `styles.css`, `support_chat.js`, `test.html`, and the folders `.github`
and `.vscode` if present.

Don't delete anything you don't recognise from this list (such as `cgi-bin`, `.well-known`,
or folders belonging to email or other sites).

## 3. Merge the existing .htaccess

Still in `public_html`, open `.htaccess` if it exists. If it has lines cPanel added (for example
`# BEGIN cPanel-generated handler` or `AddHandler application/x-httpd-ea-php…`), copy them into the
marked section at the bottom of `.htaccess` in this repository, then commit. The deploy replaces
the server's file with this one.

## 4. Create an FTP account for deployments

cPanel → **FTP Accounts** → **Add FTP Account**:
- **Log in:** `deploy` (cPanel adds `@your-domain`)
- **Password:** use the generator; save it for step 5
- **Directory:** `public_html`

Then click **Configure FTP Client** next to the new account and note the **FTP server** name.
If it's a hosting server name like `server123.yourhost.com`, use that in step 5. It matches the
server's security certificate, which the deploy checks.

## 5. Add the FTP details to GitHub

GitHub → your repository → **Settings** → **Secrets and variables** → **Actions**:

| Type | Name | Value |
|---|---|---|
| Secret | `FTP_SERVER` | the FTP server name from step 4 |
| Secret | `FTP_USERNAME` | e.g. `deploy@your-domain.com` |
| Secret | `FTP_PASSWORD` | the password from step 4 |
| Variable *(only if needed)* | `FTP_SERVER_DIR` | leave unset when the FTP account opens in `public_html` (step 4). Otherwise e.g. `public_html/` |

## 6. Turn off GitHub Pages and start automatic deploys

GitHub → repository → **Settings** → **Pages** → set **Source** to *None* / unpublish.
Otherwise the old copy at `…github.io` stays online alongside your real domain, and search
engines see two copies of the site.

The cPanel deploy is set to run only when started by hand. To deploy automatically on every
save, open `.github/workflows/deploy-cpanel.yml` and follow the note at the top.

## 7. Deploy

GitHub → **Actions** → **Deploy to cPanel** → **Run workflow**. The first run uploads everything
(a few minutes). A green ✓ means it's live. Open your domain and check the home page,
products, the contact form, and `/admin/`.

## 8. Switch on HTTPS (if not already forced)

When `https://your-domain` opens with a padlock (cPanel → **SSL/TLS Status** → *Run AutoSSL*
if needed), open `.htaccess` and remove the `# ` from the three lines under **HTTPS**. Commit,
and every visit is redirected to the secure address.

## Troubleshooting

- **Deploy fails with a certificate error:** set `FTP_SERVER` to the server hostname from
  step 4, not `ftp.your-domain.com`.
- **Deploy fails to connect:** some hosts don't allow encrypted FTP. In
  `.github/workflows/deploy-cpanel.yml` change `protocol: ftps` to `protocol: ftp` (less secure —
  ask your host about FTPS first).
- **"500 Internal Server Error" after deploying:** a line in `.htaccess` isn't supported by your
  host. Rename `.htaccess` in File Manager to restore the site, and send the developer the
  error from cPanel → **Errors**.
