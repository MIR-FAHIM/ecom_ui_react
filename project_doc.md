# Project Shifting Guide

This repository keeps the current main version as the source of truth. Client-specific apps should be built from configuration and feature flags, not by copying the project into a new repository.

## Current Client Modes

| Mode | App Name | API Base URL | Customer Site | Seller Panel |
| --- | --- | --- | --- | --- |
| default | MyZoo | `https://myzooapi.myzoo.asia/public` | enabled | enabled |
| `pharmavan` | PharmaVan | `https://pharmavanapi.braintodo.com/public` | disabled | disabled |

## How To Run

Default main app:

```bash
npm run dev
```

PharmaVan app:

```bash
npm run dev:pharmavan
```

Build the default main app:

```bash
npm run build
```

Build PharmaVan:

```bash
npm run build:pharmavan
```

## Where Client Settings Live

Shared config is read from:

```text
src/api/config/index.jsx
```

Client-specific text, menu names, and small UI overrides live in:

```text
src/config/projectSettings.js
```

Example:

```js
pharmavan: {
  textOverrides: {
    Sellers: "Distributors",
    "Add Seller": "Add Distributor",
    "All Sellers": "All Distributors",
    Brands: "Manufacturer",
    "Brand Management": "Manufacturer Management",
  },
}
```

PharmaVan settings live in:

```text
.env.pharmavan
```

Important values:

```env
VITE_CLIENT_KEY=pharmavan
VITE_APP_NAME=PharmaVan
VITE_SITE_NAME=PharmaVan
VITE_APP_LOGO_URL=
VITE_API_BASE_URL=https://pharmavanapi.braintodo.com/public
VITE_IMAGE_FILE_URL=https://pharmavanapi.braintodo.com/storage/app/public
VITE_ADMIN_ONLY=true
VITE_SELLER_PANEL=false
VITE_COMPANY_ID=3
```

Change `VITE_COMPANY_ID` when the PharmaVan backend has its own company id.

Set `VITE_APP_LOGO_URL` to a public logo path or URL when a client logo is available. If it is empty for a non-default client, the sidebar uses a simple first-letter mark.

## Routing Behavior

When `VITE_ADMIN_ONLY=true`:

- The customer storefront routes are not registered.
- `/` redirects into `/admin`.
- Unknown public routes redirect into `/admin`.
- If the user is not logged in as admin, the admin guard sends them to `/admin-login`.
- The admin navbar hides the customer website shortcut.

When `VITE_SELLER_PANEL=false`, the `/seller` panel and seller auth routes are not registered.

## Adding Another Client

1. Create a new env file, for example `.env.clientname`.
2. Set the app name, API URL, image URL, company id, and feature flags.
3. Add scripts in `package.json`:

```json
"dev:clientname": "vite --mode clientname",
"build:clientname": "vite build --mode clientname"
```

4. If the client needs different admin menus, add menu flags or a client menu config instead of editing the sidebar directly.

## Rule Of Thumb

Use this same repository when the app is the same product with different branding, base URL, company id, routes, or menus.

Create a separate repository only when a client needs permanent custom business logic that should not stay in the main product.
