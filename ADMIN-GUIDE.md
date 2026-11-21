# Adding client logos and project photos

New logos appear in the scrolling strip on the home page and on the Projects page.
New project photos appear first in the Projects gallery, and the newest 6 show on the home page.

---

## One-time setup (the developer does this once)

1. Open `admin/config.yml` and replace `CHANGE-ME/gillisolutions` with your GitHub
   **owner/repository** name (as in the address `github.com/owner/repository`). Push the change.
2. Complete the hosting setup in **HOSTING-GUIDE.md**, so saves go live automatically.

## One-time setup (each staff member)

You need a GitHub account with access to the website's repository, and an **access token**,
which is like a password just for the content manager.

1. On GitHub, go to your profile picture → **Settings** → **Developer settings**
   → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. **Token name:** `Gilli website content`. **Expiration:** up to 1 year.
3. **Repository access:** *Only select repositories* → choose the website repository.
4. **Permissions → Repository permissions → Contents:** *Read and write*.
5. Click **Generate token** and copy it. GitHub shows it only once — keep it somewhere safe,
   like a password manager. Don't share it or post it anywhere.

## Adding a client logo

1. Open **your-website-address/admin/** (for example `https://example.com/admin/`).
2. Choose **Sign in using access token**, paste your token, and sign in.
3. Click **Client logos** → **Client logos (scrolling strip…)**.
4. Click **Add Client**. A new empty entry appears at the top.
5. Type the **Client name** and choose the **Logo** file from your computer.
6. Click **Save**.

The website updates by itself in about **1–2 minutes**. Refresh the home page to see it.

**Good logos:** PNG with a transparent or white background, cropped close to the logo,
at least 300 pixels wide. Logos with coloured backgrounds still work but show as a coloured block.

## Adding a project photo

Same steps, but choose **Project photos**, click **Add Project**, type the project or client
name (this becomes the caption, e.g. *Anna Vilas, Kochi*), choose the photo and **Save**.

Photos straight from a phone are fine — they're resized automatically before upload.
Landscape (wide) photos look best in the gallery.

## Putting a project on the installations map

The Projects page has a map of India showing where your systems are installed. It appears
automatically once **at least 3 projects** have a city. Until then it stays hidden.

Open a project (or add one) and fill in:

| Field | What to enter |
|---|---|
| **City** | Choose from the list. Leave empty to keep the project off the map. |
| **Area (Bengaluru only)** | For Bengaluru projects, choose the area (HSR Layout, Whitefield…). It appears in the Bengaluru close-up. |
| **Kitchen type** | Restaurant, hotel, hospital… Used by the map's filter buttons. |
| **Year installed** | Optional. |
| **Products installed** | Tick what you supplied. The map card links to those products. |
| **Show a Google Maps link** | Only for **public** places like restaurants and cafés. Leave **off** for hospitals, schools, offices and private kitchens. |

The map only ever shows the **city or area**, never an exact address.

**Your city or area isn't in the list?** Cities over 100,000 people are included. For a
smaller town, choose the nearest city. To add a missing Bengaluru area, ask the developer
(it's one line in `src/content/places.json`).

**Want to see the map before the real data is in?** Open `your-site/map-preview.html`.
It shows the map with sample locations, and isn't linked from the site or shown in search engines.

## Changing the order, editing or removing

- **Reorder:** drag an entry up or down in the list, then **Save**.
- **Edit:** click an entry, change the name or replace the image, then **Save**.
- **Remove:** open the entry's menu (⋮) → **Remove**, then **Save**.

## If something goes wrong

- **"Not found" or sign-in fails:** the token may have expired, or doesn't have *Contents: Read and
  write* on this repository. Create a new token (steps above).
- **Saved, but the site didn't change after 5 minutes:** on GitHub, open the repository's
  **Actions** tab. A red ✗ means the update failed; send the developer a link to it.
