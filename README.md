# 💰 Fintrack — Expense Tracker Application

A production-ready full-stack expense tracker with React.js, Node.js/Express.js, and MongoDB.

---

## 🏗️ Project Structure

```
expense-tracker/
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/database.js       # MongoDB connection (pooling)
│   │   ├── controllers/
│   │   │   ├── authController.js        # JWT auth
│   │   │   ├── transactionController.js # Full CRUD + bulk delete
│   │   │   ├── analyticsController.js   # 7 aggregation pipelines
│   │   │   └── budgetController.js
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT guard
│   │   │   ├── validate.js      # Validation result handler
│   │   │   └── errorHandler.js  # Global error + 404
│   │   ├── models/
│   │   │   ├── User.js          # (bcrypt, refresh token)
│   │   │   ├── Transaction.js   # (compound indexes)
│   │   │   └── Budget.js        # (unique constraints)
│   │   ├── routes/              # Auth, Transactions, Analytics, Budgets
│   │   ├── utils/
│   │   │   ├── logger.js        # Winston logger
│   │   │   └── apiResponse.js   # Standard response helpers
│   │   ├── validators/          # express-validator schemas
│   │   ├── app.js               # Express app (security stack)
│   │   └── server.js            # Entry + graceful shutdown
│   └── package.json
│
└── client/                     # React.js + Vite Frontend
    ├── src/
    │   ├── api/
    │   │   ├── axiosInstance.js  # Axios + auto token refresh
    │   │   └── index.js          # API service layer
    │   ├── components/
    │   │   ├── charts/Charts.jsx # Recharts: Area, Pie, Bar
    │   │   ├── layout/           # AppLayout + Sidebar
    │   │   └── ui/               # Modal + TransactionModal
    │   ├── pages/
    │   │   ├── Dashboard.jsx     # Overview + charts
    │   │   ├── Transactions.jsx  # Table + filters + pagination
    │   │   ├── Analytics.jsx     # Deep analytics
    │   │   ├── Budgets.jsx       # Budget management
    │   │   ├── Settings.jsx      # Profile + preferences
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── store/authStore.js    # Zustand auth state
    │   ├── utils/constants.js    # Categories, formatters
    │   ├── App.jsx               # Router + React Query
    │   └── index.css             # Complete design system
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local: `mongodb://localhost:27017` or Atlas URI)

### 1. Configure Environment

**`server/.env`** (already created):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/expense_tracker
JWT_SECRET=dev_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=dev_refresh_secret_key_2024
CLIENT_URL=http://localhost:5173
```

**`client/.env`** (already created):
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Run Development Servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

- 🌐 Frontend: http://localhost:5173
- ⚡ Backend API: http://localhost:5000/api
- ❤️ Health: http://localhost:5000/api/health

---

## 🌐 API Reference

### Auth
| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Public |
| POST | `/api/auth/logout` | Protected |
| GET/PATCH | `/api/auth/me` | Protected |

### Transactions
| Method | Route | Description |
|---|---|---|
| GET | `/api/transactions` | List (filter+paginate) |
| POST | `/api/transactions` | Create |
| GET/PUT/DELETE | `/api/transactions/:id` | CRUD |
| DELETE | `/api/transactions/bulk` | Bulk delete |

**Query Params:** `page, limit, type, category, startDate, endDate, minAmount, maxAmount, search, sortBy, order`

### Analytics Endpoints
| Route | Description |
|---|---|
| `/api/analytics/summary` | Total balance/income/expense |
| `/api/analytics/monthly?year=2026` | 12-month breakdown |
| `/api/analytics/yearly` | All years comparison |
| `/api/analytics/categories?type=expense&month=10&year=2026` | By category |
| `/api/analytics/trends?year=2026&month=10` | Daily spending |
| `/api/analytics/top-transactions` | Top N by amount |
| `/api/analytics/payment-methods` | Payment method breakdown |

### Budgets
| Method | Route |
|---|---|
| GET | `/api/budgets?year=2026&month=10` |
| POST | `/api/budgets` |
| PUT/DELETE | `/api/budgets/:id` |

---

## 🔒 Security Measures

| Layer | Technology |
|---|---|
| HTTP Headers | Helmet |
| CORS | Restricted to client origin |
| Rate Limiting | 100 req/15min global, 20 req/15min auth |
| NoSQL Injection | express-mongo-sanitize |
| Password Hashing | bcryptjs (salt: 12) |
| Authentication | JWT access + refresh token rotation |
| Input Validation | express-validator (backend) + Zod (frontend) |
| Body Size Limit | 10kb max |

---

## 🗄️ MongoDB Indexes

```javascript
// Transaction — optimized for user-scoped date queries
{ user: 1, date: -1 }
{ user: 1, type: 1, date: -1 }
{ user: 1, category: 1, date: -1 }

// Budget — unique per user/category/period/month/year
{ user: 1, category: 1, period: 1, month: 1, year: 1 } // unique
```

---

## 🎨 UI Features

- **Dark Theme** with teal/purple/coral accent palette
- **Glassmorphism** stat cards with gradient backgrounds
- **5 Chart Types**: Area (income vs expense), Donut (categories), Bar (daily/yearly)
- **Animated Progress Bars** for budget usage
- **Data Tables** with sorting, filtering, pagination
- **Toast Notifications** for all CRUD operations
- **Responsive Layout** with collapsible sidebar
