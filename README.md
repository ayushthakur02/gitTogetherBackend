# GitTogether Backend

REST API for GitTogether — a developer dating app where you discover people through a feed, star profiles you're interested in, and get matched when the interest is mutual.

## Tech Stack

- **Runtime:** Node.js + Express 5
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (cookie-based)
- **Media:** Cloudinary (client-side signed uploads)

## Getting Started

```bash
npm install
npm run dev
```

The server runs on port `3069`.

### Environment Variables

Create a `.env` file in the root:

```env
MONGO_URI=
JWT_SECRET_KEY=
ORIGIN_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## API Reference

### Auth — `/auth`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/signup` | No | Create account |
| POST | `/auth/login` | No | Login, sets cookie |
| POST | `/auth/logout` | No | Clears cookie |
| GET | `/auth/me` | Yes | Get logged-in user |

### Profile — `/profile`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/profile/view` | Yes | Get own profile |
| PATCH | `/profile/edit` | Yes | Update profile fields |
| PATCH | `/profile/change-password` | Yes | Change password |
| DELETE | `/profile/delete/:id` | Yes | Delete account |

Allowed fields for `/profile/edit`: `age`, `skills`, `bio`, `profilePic`, `morePhotos`

### Users — `/user`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/user/feed` | Yes | Paginated feed of undiscovered users |
| GET | `/user/requests` | Yes | Profiles that starred you |
| GET | `/user/matches` | Yes | Your mutual matches |
| GET | `/user/:id` | Yes | Get a user by ID |

Query params for paginated routes: `?page=1&limit=10`

### Requests — `/request`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/request/send/:status/:recipientID` | Yes | Star or dismiss a profile |
| PATCH | `/request/review/:requestID/:action` | Yes | Star or dismiss an incoming request |
| GET | `/request/details/:requestID` | Yes | Get request details |

`status` values: `starred`, `dismissed`  
`action` values: `star`, `dismiss`

Starring someone who already starred you auto-creates a match.

### Uploads — `/upload`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/upload/signature` | Yes | Cloudinary upload signature (authenticated users) |
| GET | `/upload/signature/signup` | No | Cloudinary upload signature (during signup) |

The frontend uses these signatures to upload images directly to Cloudinary. Store the returned `secure_url` in `profilePic` or `morePhotos`.
