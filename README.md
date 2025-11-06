# 🔨 Online Auction and Bidding Web Application

A full-stack online auction platform built with **Node.js**, **Express.js**, and **MongoDB**. This application allows users to create auctions, place bids, and manage their items in real-time.

## 🌟 Features

### User Module
- **User Registration & Login** with role-based authentication (Buyer, Seller, Admin)
- **Session Management** for secure user sessions
- **Password Hashing** using bcryptjs for security

### Auction Item Module
- **Create Auctions**: Sellers can list items with name, description, base price, and closing time
- **View All Auctions**: Browse active, sold, or closed auctions
- **Real-time Status Updates**: Auctions automatically expire and update status
- **Image Support**: Optional image URLs for auction items
- **My Auctions**: Sellers can view and manage their own listings

### Bidding Module
- **Place Bids**: Buyers can bid on active auctions
- **Automatic Price Updates**: Current price updates with each new bid
- **Bid History**: View all bids on an item, sorted by amount
- **My Bids**: Track all bids placed by the user
- **Winning Status**: See if you're currently winning an auction

### Admin Module
- **Dashboard Statistics**: View total users, items, and bids
- **User Management**: See all registered users and their roles
- **Item Management**: View and delete any auction item
- **Platform Overview**: Complete control over the auction platform

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS with Fetch API)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Express Sessions with bcryptjs
- **Styling**: Custom CSS with responsive design

## 📊 Database Operations (CRUD)

| Operation | Description | Collections | Routes |
|-----------|-------------|-------------|--------|
| **INSERT** | Create new users, auction items, and bids | `users`, `items`, `bids` | `POST /api/auth/register`, `POST /api/items`, `POST /api/bids` |
| **FETCH** | Retrieve all auctions, user bids, item details | `items`, `bids` | `GET /api/items`, `GET /api/my-bids`, `GET /api/items/:id` |
| **UPDATE** | Automatic status updates for expired auctions | `items` | Handled automatically on fetch |
| **DELETE** | Remove auctions and associated bids | `items`, `bids` | `DELETE /api/items/:id` |

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud database)
- npm or yarn

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/online-auction-webapp.git
   cd online-auction-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   
   Edit `.env` file:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/auction_db
   SESSION_SECRET=your_secure_random_secret_key_here
   NODE_ENV=development
   ```

   **For MongoDB Atlas (Cloud):**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auction_db
   ```

5. **Start MongoDB** (if using local MongoDB)
   ```bash
   # On Linux/Mac
   sudo systemctl start mongod
   
   # Or using MongoDB service
   mongod
   ```

6. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Access the application**
   
   Open your browser and navigate to: `http://localhost:3000`

## 📁 Project Structure

```
WEB_TECH_EXP_8/
├── models/
│   ├── User.js              # User schema (buyers, sellers, admins)
│   ├── AuctionItem.js       # Auction item schema
│   └── Bid.js               # Bid schema
├── public/
│   ├── css/
│   │   └── style.css        # Main stylesheet
│   ├── js/
│   │   ├── auth.js          # Authentication helper
│   │   ├── login.js         # Login page logic
│   │   ├── register.js      # Registration page logic
│   │   ├── home.js          # Home page logic
│   │   ├── auctions.js      # Browse auctions logic
│   │   ├── create-auction.js # Create auction logic
│   │   ├── item-details.js  # Item details & bidding logic
│   │   ├── my-auctions.js   # User's auctions logic
│   │   ├── my-bids.js       # User's bids logic
│   │   └── admin.js         # Admin panel logic
│   ├── index.html           # Home page
│   ├── login.html           # Login page
│   ├── register.html        # Registration page
│   ├── auctions.html        # Browse auctions page
│   ├── create-auction.html  # Create auction page
│   ├── item-details.html    # Item details page
│   ├── my-auctions.html     # User's auctions page
│   ├── my-bids.html         # User's bids page
│   └── admin.html           # Admin panel page
├── server.js                # Express server & API routes
├── package.json             # Dependencies & scripts
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore file
└── README.md               # This file
```

## 🔌 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Auction Item Routes
- `POST /api/items` - Create new auction (seller only)
- `GET /api/items` - Get all auction items
- `GET /api/items/:id` - Get single auction item
- `DELETE /api/items/:id` - Delete auction (seller/admin only)
- `GET /api/my-items` - Get user's own auctions

### Bid Routes
- `POST /api/bids` - Place a bid
- `GET /api/items/:id/bids` - Get all bids for an item
- `GET /api/my-bids` - Get user's bids

### Admin Routes
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/stats` - Get platform statistics (admin only)

## 👥 User Roles

### Buyer
- Browse and search auctions
- Place bids on items
- View bid history
- Track winning/losing status

### Seller
- Create new auctions
- Manage own auction listings
- View bids on their items
- Delete own auctions

### Admin
- Full platform access
- View all users and statistics
- Delete any auction item
- Monitor platform activity

## 🌐 Deployment to Render.com

### Step 1: Prepare for Deployment

1. **Create MongoDB Atlas Database** (Free tier)
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get connection string
   - Whitelist all IP addresses (0.0.0.0/0) for Render

2. **Update .env for production**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auction_db
   SESSION_SECRET=your_very_secure_random_string_here
   NODE_ENV=production
   ```

### Step 2: Deploy to Render

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/online-auction-webapp.git
   git push -u origin main
   ```

2. **Create Render Account**
   - Go to [Render.com](https://render.com)
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `online-auction-webapp`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

4. **Add Environment Variables**
   - In Render dashboard, go to "Environment"
   - Add:
     - `MONGODB_URI` - Your MongoDB Atlas connection string
     - `SESSION_SECRET` - Random secure string
     - `NODE_ENV` - `production`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (3-5 minutes)
   - Access your app at: `https://online-auction-webapp.onrender.com`

### Step 3: Post-Deployment

1. **Test the application**
   - Register a new user
   - Create an auction
   - Place a bid
   - Check admin panel

2. **Monitor logs**
   - Use Render dashboard to view logs
   - Check for any errors

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **Session Management**: Secure HTTP-only cookies
- **Input Validation**: Server-side validation for all inputs
- **Role-Based Access**: Protected routes based on user roles
- **CORS Configuration**: Controlled cross-origin requests

## 🧪 Testing the Application

### Test Accounts to Create

1. **Admin User**
   - Role: Admin
   - Can manage all platform operations

2. **Seller User**
   - Role: Seller
   - Can create and manage auctions

3. **Buyer User**
   - Role: Buyer
   - Can browse and bid on auctions

### Test Scenarios

1. **Create Auction Flow**
   - Login as seller
   - Create auction with details
   - Verify auction appears in listings

2. **Bidding Flow**
   - Login as buyer
   - Browse active auctions
   - Place bid higher than current price
   - Verify bid updates item price

3. **Admin Flow**
   - Login as admin
   - View dashboard statistics
   - Manage users and items

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

### Session Not Persisting
- Clear browser cookies
- Check SESSION_SECRET is set
- Verify MongoDB connection

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Created as part of Web Technology Experiment 8

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Live Demo**: [https://online-auction-webapp.onrender.com](https://online-auction-webapp.onrender.com)

**GitHub Repository**: [https://github.com/yourusername/online-auction-webapp](https://github.com/yourusername/online-auction-webapp)
