# BondEd
<<<<<<< HEAD

*Where Experience Meets Ambition*

## Overview
BondEd connects students with alumni mentors, exclusive opportunities, forums, and events.

## Getting Started
1. *Install dependencies*: npm install
2. *Build CSS*: npm run build:css
3. *Serve locally*: npm run start

## Deployment
- Host src/ on any static hosting (GitHub Pages, Netlify).
- Ensure public/output.css is generated if using the CSS build script.

## CI/CD with GitHub Actions
Create .github/workflows/ci.yml:
```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install Dependencies
        run: npm instal
