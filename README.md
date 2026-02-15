# Expense Tracker

Full-stack expense tracking application with **Django** (Python) backend, **PostgreSQL** database, and **Next.js** frontend. Includes full CRUD (UI + REST APIs), a data dashboard, and third-party exchange-rate API integration.

---

## Local setup

### Prerequisites

- **Python** 3.9+ (3.11+ recommended)
- **Node.js** 18+
- **PostgreSQL** (running locally or via Docker)
- **npm** or **yarn**

### Clone and prepare

```bash
git clone <repo-url>
cd Sample
```

### Backend (Django)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend (Next.js)

```bash
cd frontend
npm install
```

---

## Environment variables

### Backend (`backend/.env`)

Copy from `backend/.env.example`:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key (change in production) |
| `DEBUG` | `True` / `False` |
| `ALLOWED_HOSTS` | Comma-separated hosts (e.g. `localhost,127.0.0.1`) |
| `DATABASE_URL` | Full PostgreSQL URL, e.g. `postgresql://user:password@localhost:5432/expenses_db` |
| Or use separate: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | |
| `CORS_ALLOWED_ORIGINS` | Frontend origin(s), e.g. `http://localhost:3000,http://127.0.0.1:3000` |

### Frontend (`frontend/.env.local`)

Copy from `frontend/.env.example`:

```bash
cp frontend/.env.example frontend/.env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL (e.g. `http://localhost:8000` for local) |

---

## Database and migrations

1. Create a PostgreSQL database (e.g. `expenses_db`).
2. Set `DATABASE_URL` in `backend/.env` (or `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`).
3. Run migrations:

```bash
cd backend
source .venv/bin/activate
python manage.py migrate
```

Optional: create a superuser for Django admin:

```bash
python manage.py createsuperuser
```

---

## How to run locally

### Backend

```bash
cd backend
source .venv/bin/activate
python manage.py runserver
```

- API: **http://localhost:8000**
- REST: **http://localhost:8000/api/expenses/**  
- Admin: **http://localhost:8000/admin/**

### Frontend

```bash
cd frontend
npm run dev
```

- App: **http://localhost:3000**

Use the UI at http://localhost:3000; it talks to the backend at http://localhost:8000. Ensure `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000`.

---

## Deployment

- **Backend:** Deploy the `backend/` Django app with a PostgreSQL database (e.g. **Render** Web Service + PostgreSQL, or **Railway**). Set env: `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS` (your backend domain), `DATABASE_URL`, `CORS_ALLOWED_ORIGINS` (your frontend URL). Run migrations in the release phase or once after first deploy (`python manage.py migrate`).
- **Frontend:** Deploy the `frontend/` Next.js app (e.g. **Vercel**). Set `NEXT_PUBLIC_API_BASE_URL` to your deployed backend URL (e.g. `https://your-app.onrender.com`). Ensure the backend CORS list includes this frontend origin.

After deployment, the **live link** is your frontend URL (e.g. `https://your-app.vercel.app`). Open it to use the full UI and CRUD.

---

## How to test

### 1. UI flow to test CRUD (step-by-step)

1. **List:** Open the app (e.g. http://localhost:3000). You should see the expense list (or “No expenses yet”).
2. **Create:** Click **Add expense** (or go to `/expenses/new`). Fill amount, currency, category, date, and optionally merchant/description. Submit. You should be redirected to the list and see the new expense.
3. **View:** Click **View** on a row (or open `/expenses/<id>`). Check that details match.
4. **Update:** From the list or detail, click **Edit**. Change fields and save. Confirm the list/detail shows the updated data.
5. **Delete:** Click **Delete** on the list or detail. Confirm in the dialog. The expense should disappear from the list.

### 2. Report / visualization page

- **Path:** **`/dashboard`**
- Open **Dashboard** in the nav or go to `http://localhost:3000/dashboard`.
- You should see: **summary metrics** (total spent, count, average), **category breakdown** (bar and pie), and **trend over time** (by month).
- Add or edit an expense, then refresh the dashboard; the charts and totals should reflect the new data.

### 3. Third-party API feature

- **Path:** **`/rates`**
- Open **Exchange rates** in the nav or go to `http://localhost:3000/rates`.
- The page calls the backend **`GET /api/rates/?from=USD&to=EUR`**, which uses the **Frankfurter** API. You should see “1 USD = X.XXXX EUR” (or the chosen pair). Change “From”/“To” and click **Update** to fetch another rate. This demonstrates the third-party API integration (Frankfurter) via the backend and UI.

---

## REST API reference

All under base URL `http://localhost:8000/api` (or your deployed backend URL).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expenses/` | List expenses |
| POST | `/expenses/` | Create expense (JSON body) |
| GET | `/expenses/<id>/` | Get one expense |
| PUT / PATCH | `/expenses/<id>/` | Update expense |
| DELETE | `/expenses/<id>/` | Delete expense |
| GET | `/expenses/summary/` | Dashboard aggregates (by category, by month, totals) |
| GET | `/rates/?from=USD&to=EUR` | Exchange rate (Frankfurter API) |

Example create:

```bash
curl -X POST http://localhost:8000/api/expenses/ \
  -H "Content-Type: application/json" \
  -d '{"amount":"25.00","currency":"USD","category":"food","date":"2025-02-14","merchant":"Cafe"}'
```
