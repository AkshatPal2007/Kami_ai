# Scheme Saathi

English-first, bilingual government-scheme discovery web demo for a hackathon. It helps a person describe a need, asks a short follow-up when useful, and presents potential scheme information with official links and a preparation checklist. Hindi remains available with the language toggle.

## Run on Windows (PowerShell)

1. Install Node.js 20 or newer from [nodejs.org](https://nodejs.org/) if it is not already installed.
2. In File Explorer, open this project folder and double-click `run-scheme-saathi.bat`. Keep its command window open while you use the demo. This starts the server on your computer; a server started inside a Codex tool terminal cannot be reached by the in-app browser.
3. Open **Chrome or Edge as a separate app** (not the Codex in-app browser) and go to [http://localhost:3000](http://localhost:3000). Press `Ctrl+C` in the launcher window to stop.

### PowerShell alternative

Open Windows PowerShell on your computer, then move to the project folder:

   ```powershell
   Set-Location "C:\Users\Harsh\Documents\Codex\2026-10-23\referenced-chatgpt-conversation-this-is-an"
   ```

Start the rule-based demo and keep this PowerShell window open:

   ```powershell
   node .\server.js
   ```

### Turn on live Gemini AI

The Gemini integration is in the server, but live AI needs your own Google AI Studio API key. Do not paste the key into chat or browser code.

```powershell
npm install
Copy-Item .env.example .env
notepad .env
```

In Notepad, enter your key after `GEMINI_API_KEY=` and save. Get a key from [Google AI Studio](https://aistudio.google.com/apikey). `.env` is private and ignored by Git. Close the currently running server window, then double-click `run-scheme-saathi.bat` again so it loads the key. The page's status below the chat will say **Gemini AI ready** when the key is configured. If you leave the key blank, the rule-based demo still works.

PowerShell alternative, in the same window used to start the server:

```powershell
$env:GEMINI_API_KEY = "paste-your-key-here"
node .\server.js
```

The key is used only by the local server and is never sent to the browser. Gemini is instructed to use the scheme information included in the app, avoid making eligibility guarantees, and ask clarifying questions when information is missing. If Gemini is unreachable or returns an invalid response, the app shows its rule-based demo answer instead.

## What works

- English-first responsive interface, with a simple English/Hindi toggle.
- Type a question or use the microphone button to dictate into the text box (English or Hindi) in browsers that support speech recognition. The app reports microphone permission and recognition errors. Use the Listen buttons to hear the welcome message or assistant replies with the browser's built-in text-to-speech; voice availability depends on your device/browser.
- Rule-based recommendations work without an API key. After `npm install` and configuration of `GEMINI_API_KEY`, the server uses Google's official `@google/genai` SDK and provides official-scheme context to Gemini. If the call fails, the app falls back to demo responses.
- PM-KISAN, PMFBY, and myScheme information includes source links, a last-checked date, and a guided preparation checklist.
- Disclaimer explains that eligibility and final approval belong to the relevant department.

## Data and limits

Scheme facts are deliberately limited to information available from the official sources linked in the app. The eligibility matching is a demo aid, not an eligibility decision. State, district, crop notification, deadlines, and required documents can change; verify those details with the department before acting. Avoid entering Aadhaar, bank, or other sensitive numbers. This demo does not create or submit applications.

The source facts were checked on 23 October 2026. Review source pages and update the data before presenting the app as current beyond this date.

## Future phase

Phone number and telephony integration are not implemented. Speech input and read-aloud are available in the web demo through browser APIs; a future phase could connect those flows to a consent-based telephony provider with call routing and clear human handoff. No phone calls are placed by this demo.
