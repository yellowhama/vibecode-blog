---
author: Hama
pubDatetime: 2025-01-25T09:00:00Z
title: "Building a US Stock Screener in 2 Days with Claude Code"
slug: stock-screener
featured: false
draft: false
tags:
  - claude-code
  - rust
  - tutorial
description: "From Python prototype to Rust+PyO3 optimization in two days. How Claude Code built Lazy Quant Screener -- 586 stocks, three strategies, 3-5 minute runtime."
---

## TL;DR

- Used Claude Code for the full **instruct, generate, execute** loop to build **Lazy Quant Screener**
- Screens 586 stocks across **QVG/Value/Tenbagger** -- 3 strategies, top 20-30 picks each
- Python prototype, then **async batching**, then **Rust+PyO3 optimization (3-5 min)**
- **Cross-platform headaches (WinError 216)** solved with WSL/Windows native builds
- This isn't "chatbot Q&A." This is **"telling it what to do"** vibe coding, for real.

## Finally Did It

Posts 1 through 3 were all setup. What Karpathy said. How to build the environment. Why Rust.

I'd been playing with Claude Code already. Fetching data, running calculations, saving files. It worked.

But something was missing.

Everything I'd built so far was side dishes. A Python script here. A lightweight tool that only runs inside Linux. Bean sprouts, braised tofu, pickled radish... each one fine on its own. But can you call that cooking?

A real program should be the main course. The whole thing. One executable that does something meaningful.

So I decided to actually build something.

**"Even a non-developer can build something real with AI."**

So I tried it.

What to build? I had a lot of ideas, but:

Most were too hard.

My hardware couldn't handle them.

Or they were just insane.

So I needed something realistic, useful, and runnable on my machine.

"US stocks!"

My first real project: **Lazy Quant Screener.**

A program that automatically analyzes US stocks and picks the ones worth investing in.

Took two days.

About 6 hours of actual work? Someone who knows code could probably do it in 30 minutes.

I felt my way through it blind, touching everything one piece at a time.

---

## What's Quant?

- **Full term**: Quant = Quantitative investing / Quantitative analyst
- **Meaning**: "Making investment decisions purely with numbers"
- Using math, stats, and algorithms instead of gut feeling

## How's It Different?

- Traditional investing: CEO interviews, news articles, industry trends -- humans judge
- Quant investing: financial statements, price patterns, interest rates, volume, metrics -- **the computer follows rules**

| Metric | Formula | Meaning | Typical read |
|--------|---------|---------|--------------|
| PER | Price / EPS | Price relative to earnings | Lower = cheaper |
| PBR | Price / Book value per share | Price relative to assets | Under 1 = undervalued |
| ROE | Net income / Equity | Capital efficiency | Higher = better |

---

## Terminal Magic

Opened Claude Code. Navigated to my project directory. Said:

"Build me a stock screening tool. Use metrics like PER and ROE to find good stocks."

Claude Code started moving. No copy-pasting on my end. Claude made the files directly. `stock_screener.py` appeared. It told me to install yfinance. Then installed it itself.

Ran the first version. Got AAPL's PER value. Something working in 30 minutes.

## Requirements Keep Growing

"One stock is pointless. Handle multiple stocks at once."

Claude Code rewrote the code. Added a function to pull the S&P 500 list. Added batch processing. But it was too slow. Processing one stock at a time took 30 minutes.

"Too slow. Make it faster."

Claude switched to async. Batches of 50 at a time, 2-second delays between API calls to dodge rate limits. Down to 10 minutes.

## The Rust Pivot

"Still slow. Can we push performance further?"

Claude Code suggested it. "Fetch data with Python, run analysis logic in Rust. That'll be faster."

PyO3 -- a library to connect Python and Rust. I didn't know what PyO3 was. Claude Code did.

Created Cargo.toml, wrote the Rust code, built the Python bindings. Claude handled the compilation too. Ran it. Down to 3-5 minutes.

Could probably add Russell 2000 or Nasdaq stocks on top and it'd still hold.

| Index | Character | Stocks | Key trait | Major ETF |
|-------|-----------|--------|-----------|-----------|
| **S&P 500** | US blue chips | ~500 large cap | Most-used benchmark | SPY, IVV, VOO |
| **Nasdaq Composite** | Tech index | 3,000+ | Tech-heavy | QQQ |
| **Dow Jones 30** | Blue chip index | 30 top names | Small sample, simple avg | DIA |
| **Russell 2000** | Small-mid caps | ~2,000 | High volatility, economically sensitive | IWM |
| **Wilshire 5000 / Russell 3000** | Total market | 3,000-5,000 | Most comprehensive | VTI |

## Implementing Investment Strategies

"Don't just fetch data. Apply investment strategies. Warren Buffett style, Benjamin Graham style, Peter Lynch style."

Claude Code built scoring logic for each strategy. QVG balances Quality, Value, and Growth. Low PER gets points. High ROE gets points. That kind of thing.

Used a strategy pattern so new strategies can be added easily later.

I never even asked "what's a strategy pattern?" Claude just applied it.

| Investor | Core philosophy | Focus | Approach |
|----------|----------------|-------|----------|
| **Benjamin Graham** | Margin of safety | Undervalued assets | Metric-driven, diversified |
| **Warren Buffett** | Economic moat | Great companies, hold long | Quality-focused, concentrated |
| **Peter Lynch** | Find it in daily life | Growth + easy to understand | Everyday-life ideas |

## Cross-Platform Nightmare

Wanted to run it on my laptop too. Decided to make a standalone Windows version.

That's when the worst problem hit. A binary compiled on Linux wouldn't run on Windows. Some weird error: WinError 216.

"It won't run on Windows."

Claude Code explained why. Can't run an ELF binary on Windows. Need a Windows batch file. Then it proceeded to build one anyway. Explains everything in detail even though it's about to do the work itself.

## Code Evolving in Real Time

The wild thing about all of this: the code evolved live. Problem comes up, Claude Code edits the file right away. Compile error? Fixed instantly. Run it, check results, improve again.

I never once copy-pasted or manually edited a file. Claude Code did all of it.

## What Vibe Coding Actually Means

Two days working with Claude Code and something clicked. Vibe coding isn't just "AI writes the code." AI becomes your development partner. You solve problems together.

I describe things in words. Claude implements. Problems come up. We think through solutions together. But overall direction and final decisions are still mine.

It was a gradual progression. Python prototype, then batch processing, then Rust optimization, then strategies, then cross-platform support. At each stage Claude Code ran the code, tested it, and moved to the next step.

## The Result

Lazy Quant Screener now runs from a single batch file. Analyzes 586 US stocks. Picks the top 30 investment candidates. Top 30 per strategy, three strategies. Saves to CSV, JSON, and Markdown.

Total development time: two days. About 6.5 hours of actual work. The rest was testing and improving. Building this from scratch alone? Weeks.

## Limits Are Real

It's not perfect. Data comes only from Yahoo Finance. Not real-time -- based on yesterday's close. No backtesting, so there's no way to verify whether the strategies actually work.

Backtesting means applying your strategy to historical data. Say your rule is "buy stocks with PER under 15 and ROE above 20%." Apply it to data from 2020-2024. Simulate buying qualifying stocks every January, selling in December. Then you can see the annualized returns, and whether the strategy beat the S&P 500. Right now it picks "theoretically good stocks" but there's no proof they'd make money.

So the next upgrade is backtesting. I'm planning to tell Claude Code: "Calculate each strategy's returns over the past 5 years. Show yearly and monthly performance."

## What's Next

Once backtesting works, the ambitions will pile up.

Technical analysis. PER and ROE alone aren't enough. RSI dropping below 30, MACD golden crosses -- I want to find those too.

Portfolio management. Right now it just says "here are 30 good stocks." But I want to know how much to buy of each, and when to sell.

Alerts are a must. Not running this manually every day. When a stock hits the criteria, email or Slack notification. A web dashboard with charts would be even better.

Thinking about it, there's no end. Sector analysis, ESG scores, news sentiment analysis...

Want to push vibe coding and see where the limits are.

But as a starting point? Not bad. Time to build something actually useful.

## I'm Done with Chatbots

I've broken out of the "chatbot mode" from post 1. I don't ask Claude "what's PER?" anymore. Instead: "Find stocks with PER under 20 every day and generate a report automatically."

Feel the difference? The first is asking for information. The second is giving orders. That's vibe coding.

Installed Claude Code. Set up the Rust environment. Built something real. Posts 1 through 3 were the warmup.

Now it starts for real.
