# Md Mubashshir Billah – Portfolio Website

A professional single-page portfolio with an AI-powered chat assistant, built with pure HTML, CSS, and JavaScript on the frontend, and an Express.js server on the backend for secure Anthropic Claude API integration.

---

## ✨ Features

- **Dark Luxury Design** – Gold (`#C9A84C`) on black (`#0D0D0D`) with Playfair Display + DM Sans typography
- **Sticky Navigation** with smooth scroll and active-link highlighting
- **Hero Section** with fade-up animations and CTA buttons
- **Stats Bar** with animated counters (CGPA, Cricket Matches, Projects, Languages)
- **Skills** as hoverable animated tags
- **Experience Timeline** with dot markers and staggered reveal
- **Media Projects** in a 3-column card grid with hover-lift effects
- **Achievements** with icon cards
- **Languages** with animated progress bars
- **AI Chat** – Ask the Claude AI anything about Mubashshir
- **Contact** section with references
- **Fully Responsive** for mobile, tablet, and desktop

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- An [Anthropic API key](https://console.anthropic.com/) (for the AI Chat)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your API key

Open the `.env` file and replace the placeholder with your real API key:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> ⚠️ **Never share your `.env` file or commit it to a public repository.**

### 3. Start the server

```bash
npm start
```

### 4. Open in browser

Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
portfolio_Mubassir/
├── index.html      ← Main HTML (all sections)
├── style.css       ← All CSS styles
├── main.js         ← Frontend JavaScript (scroll, animations, chat)
├── server.js       ← Express.js API proxy (keeps API key safe)
├── package.json    ← Node.js project config
├── .env            ← Your API key (never commit this!)
└── README.md       ← This file
```

---

## 🔐 Security Notes

- The Anthropic API key is **never sent to the browser**.
- All API calls go through `server.js` which reads the key from `.env` at runtime.
- Add `.env` to your `.gitignore` before pushing to any repository.

---

## 🎨 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | HTML5, Vanilla CSS, Vanilla JS    |
| Fonts      | Playfair Display + DM Sans (Google Fonts) |
| Icons      | Phosphor Icons                    |
| Backend    | Node.js + Express.js              |
| AI         | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Env Vars   | dotenv                            |

---

## 📞 Contact

**Md Mubashshir Billah**  
📧 mubashshirbillah@student.aiu.edu.my  
📱 +60 11-6782 0223  
🔗 [linkedin.com/in/mubashshir-billah](https://www.linkedin.com/in/mubashshir-billah)
