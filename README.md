# 🛒 SmartStore – Full Stack E-commerce Platform

SmartStore is a modern full-stack e-commerce application built with **Next.js, Node.js, and MongoDB (Mongoose)**.  
It includes authentication, product management (CRUD), cart system, checkout flow, and protected routes with SSR & ISR rendering.

---

## 🚀 Live Features

### 🔐 Authentication System
SmartStore supports multiple authentication methods using NextAuth:

- Email & Password login (Credentials Provider)
- Google OAuth
- GitHub OAuth
- JWT-based session management
- Secure protected routes

---

### 👤 Authorization Rules

#### 🟢 Guest Users:
- Can view products (GET / GET by ID only)
- Cannot access protected pages (e.g. Quotes page)
- Cannot perform CRUD operations

#### 🔵 Logged-in Users:
- Full CRUD operations on products
- Access protected pages
- Add products to cart
- Complete checkout process

---

### 💬 Protected Quotes Page
- Accessible only after login
- Demonstrates SSR authentication protection
- Redirects unauthenticated users to `/signin`

---

### 🛍️ Product Management (CRUD)
Full CRUD functionality for products:

- Create product
- Read all products
- Read product by ID
- Update product
- Delete product

Built using:
- Next.js API Routes (Node.js backend)
- MongoDB with Mongoose

---

### 🛒 Cart System
- Add products to cart
- Update quantity
- Remove items
- User-based persistent cart (MongoDB)
- Real-time cart updates

---

### 💳 Checkout System
- Server-side cart validation
- Stock validation before order creation
- Order creation stored in MongoDB
- Automatic cart clearing after successful order
- Order status tracking (pending / completed)

---

## ⚡ Rendering Strategies

SmartStore uses modern Next.js rendering techniques:

### SSR (Server-Side Rendering)
- Protected pages (checkout, quotes)
- User-specific data (cart, orders)

### ISR (Incremental Static Regeneration)
- Product listing pages
- Optimized performance and caching

---

## 🧠 Backend Architecture

- Node.js API routes inside Next.js
- MongoDB + Mongoose ODM
- Modular structure:
  - models/
  - lib/
  - api/

---

## 🧰 Tech Stack

- Next.js (Pages Router)
- React.js
- Node.js
- MongoDB & Mongoose
- NextAuth.js
- TailwindCSS
- bcryptjs
- JWT Sessions

---

## 📁 Project Structure
pages/
├── api/
│ ├── auth/
│ ├── products/
│ ├── cart/
│ ├── checkout/
│ └── quotes/
│
├── products/
├── cart.js
├── checkout.js
├── quotes.js
├── signin.js
└── signup.js

models/
├── User.model.js
├── Product.model.js
├── Order.model.js
└── Cart.model.js

lib/
├── db.connection.js
├── auth.js
├── requireAuth.js
├── cart.js
└── validation.js


---

## 🔐 Authentication Flow

1. User signs up or logs in using:
   - Email & Password
   - Google OAuth
   - GitHub OAuth

2. Session is created using NextAuth JWT

3. Protected routes validate session:

```js
const session = await getServerSession(context.req, context.res, authOptions);
Unauthorized users are redirected to /signin
🛍️ Checkout Flow
User adds items to cart
Server validates cart and stock
Order is created in MongoDB
Cart is cleared after successful checkout
Order confirmation is returned
🔒 Protected Route Example
if (!session) {
  return {
    redirect: {
      destination: "/signin",
      permanent: false,
    },
  };
}
📊 Key Features
Full authentication system (Credentials + OAuth)
Role-based access control
Secure checkout flow
Persistent cart system
SSR + ISR hybrid rendering
Scalable Node.js + MongoDB backend
🚀 Getting Started
1. Clone the repository
git clone https://github.com/your-username/smartstore.git
cd smartstore
2. Install dependencies
npm install
3. Setup environment variables
MONGODB_URI=your_mongodb_url
NEXTAUTH_SECRET=your_secret

GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret

GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret
4. Run the project
npm run dev
📌 Future Improvements
Stripe / PayPal integration
Admin dashboard
Email notifications
Order tracking system
Product reviews & ratings
Wishlist feature
👩‍💻 Author

Built with ❤️ by Ryhab Farouq

⭐ Support

If you like this project, give it a ⭐ on GitHub!


---

