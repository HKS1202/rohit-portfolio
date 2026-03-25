# Himanshu Kumar — Portfolio Website

A clean, editorial-style personal portfolio website built with vanilla HTML, CSS, and JavaScript.
Designed to be fast, responsive, and recruiter-ready.

---

## 📁 Project Structure

```
himanshu-portfolio/
├── index.html          ← Main HTML (all sections + structure)
├── css/
│   └── style.css       ← All styles, design tokens, responsive rules
├── js/
│   └── main.js         ← Scroll reveal, nav, mobile drawer, contact form
├── assets/             ← Add your resume PDF and any images here
│   └── (empty — add resume.pdf here)
└── README.md           ← This file
```

---

## 🚀 Getting Started

1. **Open locally** — just double-click `index.html` in your browser. No build step needed.
2. **Deploy** — drop the entire folder onto Netlify, Vercel, or GitHub Pages.

---

## 🛠️ Customisation Checklist

### 1. Update your real links
Open `index.html` and search for `himanshukumar` — replace with your actual handles:
- Email: `himanshukumar@gmail.com`
- GitHub: `https://github.com/himanshukumar`
- LinkedIn: `https://linkedin.com/in/himanshukumar`

### 2. Add your resume PDF
1. Put your resume PDF in `assets/resume.pdf`
2. Open `js/main.js` and find `downloadResume()` and `viewResume()`
3. Replace the `alert()` calls with:
```js
// For download:
window.open('assets/resume.pdf', '_blank');

// For view (Google Docs):
window.open('https://docs.google.com/YOUR_RESUME_LINK', '_blank');
```

### 3. Add a real photo (optional)
In `index.html`, find `.photo-circle` and replace the `HK` initials with an `<img>` tag:
```html
<div class="photo-circle">
  <img src="assets/photo.jpg" alt="Himanshu Kumar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />
</div>
```

### 4. Update project GitHub links
In `index.html`, replace `https://github.com/himanshukumar` on each project card
with the specific repo URL (e.g. `https://github.com/himanshukumar/iot-maintenance`).

---

## 🎨 Design System

| Token         | Value       | Usage                   |
|---------------|-------------|-------------------------|
| `--cream`     | `#f0f0c0`   | Page background         |
| `--ink`       | `#1a1a2e`   | Primary text / nav bg   |
| `--blue`      | `#1d2f8f`   | Hero name accent        |
| `--coral`     | `#e8553e`   | CTA buttons / dots      |
| `--teal`      | `#00897b`   | Availability tag        |
| `--violet`    | `#7c3aed`   | Empathy Engine card     |
| `--mustard`   | `#d4a017`   | E-Commerce card         |

Fonts: **Playfair Display** (headings) + **DM Sans** (body)

---

## 📦 Sections

| # | Section     | Description                                              |
|---|-------------|----------------------------------------------------------|
| 1 | **Hero**    | Name, role, CTA buttons, stats, floating glyphs          |
| 2 | **About**   | Bio text + 4 highlight cards                             |
| 3 | **Skills**  | Categorised pill badges on dark background               |
| 4 | **Projects**| 5 cards (1 featured 2-col + 4 regular) with impact lines |
| 5 | **Experience** | Vertical timeline with dates, roles, tags             |
| 6 | **Contact** | Links (email, GitHub, LinkedIn) + message form           |

---

## 📱 Responsive Behaviour

- **≥ 1000px** — Full desktop layout, 3-column project grid
- **≤ 900px**  — Stacked layout, hamburger menu, mobile drawer
- **≤ 560px**  — Compact hero, single-column everything

---

## ⚡ Features

- Smooth scroll-triggered fade-in animations
- Nav auto-hides on scroll down, reappears on scroll up
- Active nav link highlights based on scroll position
- Mobile drawer with overlay and hamburger toggle
- Contact form sends messages to your email inbox (FormSubmit)
- Optional message backup to Google Sheets (Apps Script webhook)
- Optional admin-style message table in Supabase (`contact_messages`)
- Resume pill buttons (vertical, right side) — connect to your PDF

---

## Contact Message Storage (Point 2 and 3)

The form now supports 3 destinations:
1. Email inbox (already enabled)
2. Google Sheets
3. Supabase table

### Google Sheets (Point 2)
1. Create a Google Sheet with columns:
  Timestamp | Name | Email | Message | Source
2. Open Extensions > Apps Script and paste a webhook script that appends incoming JSON.
3. Deploy as Web App and copy the HTTPS URL.
4. In [my-portfolio-main/js/main.js](js/main.js), set:
  - `GOOGLE_SHEETS_WEBHOOK_URL = 'YOUR_WEB_APP_URL'`

### Supabase (Point 3)
1. Create a Supabase project.
2. Create table `contact_messages` with columns:
  - `id` bigint identity primary key
  - `name` text
  - `email` text
  - `message` text
  - `source` text
  - `created_at` timestamptz
3. Enable insert policy for anon role (RLS policy).
4. In [my-portfolio-main/js/main.js](js/main.js), set:
  - `SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co'`
  - `SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'`
  - optional: `SUPABASE_TABLE`

---

*Built with plain HTML, CSS, and JavaScript — no frameworks, no dependencies.*
