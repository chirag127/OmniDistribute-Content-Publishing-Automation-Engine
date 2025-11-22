# Multi-Platform Deployment Setup Guide

This guide explains how to set up automatic deployment to Netlify, Vercel, and Cloudflare Pages for your Hugo site.

## Prerequisites

You need to add the following **Secrets** to your GitHub repository:

1.  Go to your repository on GitHub.
2.  Click **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret**.

## 1. Netlify Setup

1.  **Create a Netlify Account**: Sign up at [netlify.com](https://www.netlify.com/).
2.  **Get `NETLIFY_AUTH_TOKEN`**:
    -   Go to User Settings > Applications > Personal Access Tokens.
    -   Click **New access token**.
    -   Copy the token and add it as `NETLIFY_AUTH_TOKEN` in GitHub Secrets.
3.  **Get `NETLIFY_SITE_ID`**:
    -   Create a new site in Netlify (you can manually deploy the `public` folder once or link it to your repo initially to create the site placeholder).
    -   Go to Site Settings > General > Site details.
    -   Copy the **API ID** (Site ID) and add it as `NETLIFY_SITE_ID` in GitHub Secrets.

## 2. Vercel Setup

1.  **Create a Vercel Account**: Sign up at [vercel.com](https://vercel.com/).
2.  **Get `VERCEL_TOKEN`**:
    -   Go to Account Settings > Tokens.
    -   Create a new token.
    -   Copy it and add it as `VERCEL_TOKEN` in GitHub Secrets.
3.  **Install Vercel CLI** (optional but helpful for getting IDs): `npm i -g vercel`
4.  **Get `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`**:
    -   The easiest way is to link your project locally once. Run `vercel link` in your project root.
    -   It will create a `.vercel` folder.
    -   Look inside `.vercel/project.json`.
    -   Copy `orgId` -> `VERCEL_ORG_ID`.
    -   Copy `projectId` -> `VERCEL_PROJECT_ID`.
    -   Add both to GitHub Secrets.

## 3. Cloudflare Pages Setup

1.  **Create a Cloudflare Account**: Sign up at [cloudflare.com](https://www.cloudflare.com/).
2.  **Get `CLOUDFLARE_API_TOKEN`**:
    -   Go to My Profile > API Tokens.
    -   Create a token with the **Cloudflare Pages** template (Edit Cloudflare Pages).
    -   Copy the token and add it as `CLOUDFLARE_API_TOKEN` in GitHub Secrets.
3.  **Get `CLOUDFLARE_ACCOUNT_ID`**:

# Multi-Platform Deployment Setup Guide

This guide explains how to set up automatic deployment to Netlify, Vercel, and Cloudflare Pages for your Hugo site.

## Prerequisites

You need to add the following **Secrets** to your GitHub repository:

1.  Go to your repository on GitHub.
2.  Click **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret**.

## 1. Netlify Setup

1.  **Create a Netlify Account**: Sign up at [netlify.com](https://www.netlify.com/).
2.  **Get `NETLIFY_AUTH_TOKEN`**:
    -   Go to User Settings > Applications > Personal Access Tokens.
    -   Click **New access token**.
    -   Copy the token and add it as `NETLIFY_AUTH_TOKEN` in GitHub Secrets.
3.  **Get `NETLIFY_SITE_ID`**:
    -   Create a new site in Netlify (you can manually deploy the `public` folder once or link it to your repo initially to create the site placeholder).
    -   Go to Site Settings > General > Site details.
    -   Copy the **API ID** (Site ID) and add it as `NETLIFY_SITE_ID` in GitHub Secrets.

## 2. Vercel Setup

1.  **Create a Vercel Account**: Sign up at [vercel.com](https://vercel.com/).
2.  **Get `VERCEL_TOKEN`**:
    -   Go to Account Settings > Tokens.
    -   Create a new token.
    -   Copy it and add it as `VERCEL_TOKEN` in GitHub Secrets.
3.  **Install Vercel CLI** (optional but helpful for getting IDs): `npm i -g vercel`
4.  **Get `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`**:
    -   The easiest way is to link your project locally once. Run `vercel link` in your project root.
    -   It will create a `.vercel` folder.
    -   Look inside `.vercel/project.json`.
    -   Copy `orgId` -> `VERCEL_ORG_ID`.
    -   Copy `projectId` -> `VERCEL_PROJECT_ID`.
    -   Add both to GitHub Secrets.

## 3. Cloudflare Pages Setup

1.  **Create a Cloudflare Account**: Sign up at [cloudflare.com](https://www.cloudflare.com/).
2.  **Get `CLOUDFLARE_API_TOKEN`**:
    -   Go to My Profile > API Tokens.
    -   Create a token with the **Cloudflare Pages** template (Edit Cloudflare Pages).
    -   Copy the token and add it as `CLOUDFLARE_API_TOKEN` in GitHub Secrets.
3.  **Get `CLOUDFLARE_ACCOUNT_ID`**:
    -   Go to the Cloudflare Dashboard.
    -   The Account ID is usually in the URL (e.g., `dash.cloudflare.com/<ACCOUNT_ID>`) or on the sidebar of the Workers & Pages overview.
    -   Add it as `CLOUDFLARE_ACCOUNT_ID` in GitHub Secrets.
4.  **Set `CLOUDFLARE_PROJECT_NAME`**:
    -   Create a new Pages project in Cloudflare (Connect to Git or Direct Upload).
    -   The name you give your project (e.g., `my-hugo-site`) is the Project Name.
    -   Add it as `CLOUDFLARE_PROJECT_NAME` in GitHub Secrets.

## 4. Firebase Hosting Setup

1.  **Create a Firebase Project**: Go to [console.firebase.google.com](https://console.firebase.google.com/).
2.  **Get `FIREBASE_SERVICE_ACCOUNT`**:
    -   Go to Project Settings > Service accounts.
    -   Click **Generate new private key**.
    -   Open the downloaded JSON file and copy its entire content.
    -   Add it as `FIREBASE_SERVICE_ACCOUNT` in GitHub Secrets.
3.  **Get `FIREBASE_PROJECT_ID`**:
    -   Go to Project Settings > General.
    -   Copy the **Project ID**.
    -   Add it as `FIREBASE_PROJECT_ID` in GitHub Secrets.

## 5. Azure Static Web Apps Setup

1.  **Create a Static Web App**: Go to [portal.azure.com](https://portal.azure.com/) and create a "Static Web App".
2.  **Get `AZURE_STATIC_WEB_APPS_API_TOKEN`**:
    -   Once created, go to the resource overview page.
    -   Click **Manage deployment token**.
    -   Copy the token.
    -   Add it as `AZURE_STATIC_WEB_APPS_API_TOKEN` in GitHub Secrets.

## Summary of Secrets to Add

| Secret Name                       | Service    | Description                      |
| :-------------------------------- | :--------- | :------------------------------- |
| `NETLIFY_AUTH_TOKEN`              | Netlify    | Personal Access Token            |
| `NETLIFY_SITE_ID`                 | Netlify    | Site API ID                      |
| `VERCEL_TOKEN`                    | Vercel     | Personal Access Token            |
| `VERCEL_ORG_ID`                   | Vercel     | Organization ID                  |
| `VERCEL_PROJECT_ID`               | Vercel     | Project ID                       |
| `CLOUDFLARE_API_TOKEN`            | Cloudflare | API Token with Pages permissions |
| `CLOUDFLARE_ACCOUNT_ID`           | Cloudflare | Account ID                       |
| `CLOUDFLARE_PROJECT_NAME`         | Cloudflare | Name of the Pages project        |
| `FIREBASE_SERVICE_ACCOUNT`        | Firebase   | Service Account JSON content     |
| `FIREBASE_PROJECT_ID`             | Firebase   | Project ID                       |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Azure      | Deployment Token                 |
