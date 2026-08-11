# Botanica — deploying to Netlify

Everything here is a plain file. There is no build step for the website itself; Netlify only
installs one small package so the admin functions can save data.

---

## 1. Put the files on GitHub

Netlify can host a folder you drag and drop, but drag-and-drop **cannot run the admin
functions**. To get the stylist manager working, the site needs to come from a Git repository.

1. Create a new empty repository on GitHub (private is fine).
2. Upload every file and folder from this folder, keeping the structure intact:

```
index.html  stylists.html  events.html  education.html  gallery.html  contact.html
admin.html  login.html
robots.txt  sitemap.xml  llms.txt  netlify.toml  package.json
assets/…
netlify/functions/…
```

---

## 2. Connect it to Netlify

1. Sign in at [netlify.com](https://www.netlify.com) → **Add new site → Import an existing project**.
2. Choose your GitHub repo.
3. Leave the build command **empty**. Publish directory: `.` (a full stop).
4. Deploy.

You'll get a temporary address like `botanica-abc123.netlify.app`. Check the site works there
before pointing the real domain at it.

---

## 3. Set up the admin email

The sign-in codes go out through [Resend](https://resend.com), which is free for this volume.

1. Create a Resend account and verify the salon's sending domain
   (or start with their `onboarding@resend.dev` test sender).
2. Create an API key.
3. In Netlify: **Site configuration → Environment variables**, add these four:

| Variable | What to put in it | Example |
|---|---|---|
| `OWNER_EMAIL` | Where every sign-in code gets sent. **This is the security.** | `info@botanicabycollectivespace.com` |
| `RESEND_API_KEY` | The key from Resend | `re_xxxxxxxxxxxx` |
| `SESSION_SECRET` | A long random string you invent. 32+ characters. Never share it. | `k8Fq...` (see below) |
| `MAIL_FROM` | The verified sender address | `Botanica <admin@botanicabycollectivespace.com>` |

Optionally add `ADMIN_EMAILS` — a comma-separated list of addresses allowed to *request* a
code. If you leave it out, only `OWNER_EMAIL` can. The code is always delivered to
`OWNER_EMAIL` regardless.

To generate a `SESSION_SECRET`, paste this into your browser's console (F12) and copy the result:

```js
crypto.randomUUID() + crypto.randomUUID()
```

4. **Redeploy** after adding variables — Netlify only picks them up on a new deploy.

---

## 4. Turn on storage

The roster is saved in Netlify Blobs. On most accounts this is on by default. If saving fails
with a storage error, go to **Site configuration → Blobs** and enable it, then redeploy.

---

## 5. Point the domain at it

In Netlify: **Domain management → Add a domain** → `botanicabycollectivespace.com`.
Netlify will show the DNS records to set at your registrar and will issue the HTTPS
certificate automatically.

Note the site currently lives on Webflow. Don't change the DNS until you're happy with the new
site on the Netlify address, because the switch is immediate for visitors.

---

## 6. How the admin works

- Go to **`/login`** (bookmark it — it isn't linked from the website).
- Type your email → a six-digit code is emailed **to the owner's inbox**.
- Enter the code → you're in for 8 hours.

Codes expire after 10 minutes, work once, and lock out after 5 wrong guesses.
Someone who knows the admin URL and your email address still can't get in, because the code
only ever lands in the owner's mailbox.

In the dashboard you can:

- **Edit** any stylist — name, title, category, phone, Instagram, booking link, photo, bio,
  a short notice like "on maternity leave", and which days they typically work
- **Hide** a stylist without deleting them (useful for leave)
- **Add** someone new
- **Export JSON** to keep an offline backup

Every save keeps the previous version as a dated backup in Blobs, so a mistake is recoverable.

### Opening admin.html from your computer

It will work, but in **preview mode**: no emails are sent, the code is shown on screen, and
changes are stored only in that browser. It's there so you can look around before deploying.
Once the site is on Netlify, that mode switches itself off.

---

## 7. After go-live

1. **Google Search Console** — add the property, verify, submit `sitemap.xml`.
2. **Google Business Profile** — make sure the name, address, phone and hours match this site
   character for character. For a local salon this matters more than anything on the website.
3. **Analytics** — the old site had Google Tag Manager (`GTM-MZ78KMR`). If you want it back,
   paste the GTM snippet into each page just before `</head>`.

---

## Files worth knowing about

| File | What it does |
|---|---|
| `assets/site.css` | All styling. The brand colours are the variables at the very top. |
| `assets/site.js` | Navigation, animations, the contact modal, lightbox, forms. |
| `assets/stylists.js` | The bundled copy of the roster — the safety net if the server is unreachable. |
| `assets/roster.js` | Draws the stylist cards on the public page. |
| `assets/auth.js` | The sign-in flow. |
| `netlify/functions/` | The four server endpoints. |
| `llms.txt` | A plain-language summary of the salon for AI assistants. |

---

## Still to wire up

The five enquiry forms currently validate and show a success message but don't send anywhere.
The quickest fix on Netlify is to add `netlify` and `name="..."` to each `<form>` tag —
submissions then appear in the Netlify dashboard and can be emailed on. Say the word and I'll
make that change.
