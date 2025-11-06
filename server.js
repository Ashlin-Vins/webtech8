require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const AuctionItem = require('./models/AuctionItem');
const Bid = require('./models/Bid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'auction_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auction_db';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ============= AUTHENTICATION ROUTES =============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ 
          message: 'Email already exists. Please use a different email or login.',
          field: 'email'
        });
      } else {
        return res.status(400).json({ 
          message: 'Username already taken. Please choose a different username.',
          field: 'username'
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'buyer'
    });

    await user.save();

    // Set session
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        message: 'No account found with this email. Please register first.',
        userExists: false
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Incorrect password. Please try again.',
        userExists: true
      });
    }

    // Set session
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.json({ 
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  if (req.session.userId) {
    res.json({
      id: req.session.userId,
      username: req.session.username,
      role: req.session.role
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// ============= AUCTION ITEM ROUTES =============

// Create auction item (INSERT operation)
app.post('/api/items', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Please login first' });
    }

    const { name, description, basePrice, closingTime, imageUrl } = req.body;

    const item = new AuctionItem({
      name,
      description,
      basePrice: Number(basePrice),
      closingTime: new Date(closingTime),
      seller: req.session.userId,
      sellerName: req.session.username,
      imageUrl: imageUrl || undefined
    });

    await item.save();

    res.status(201).json({ 
      message: 'Auction item created successfully',
      item 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all auction items (FETCH operation)
app.get('/api/items', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }

    const items = await AuctionItem.find(query).sort({ createdAt: -1 });

    // Update expired items
    const now = new Date();
    for (let item of items) {
      if (item.status === 'active' && item.closingTime < now) {
        item.status = item.highestBidder ? 'sold' : 'closed';
        await item.save();
      }
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single auction item
app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await AuctionItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update status if expired
    const now = new Date();
    if (item.status === 'active' && item.closingTime < now) {
      item.status = item.highestBidder ? 'sold' : 'closed';
      await item.save();
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete auction item (DELETE operation)
app.delete('/api/items/:id', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Please login first' });
    }

    const item = await AuctionItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is seller or admin
    if (item.seller.toString() !== req.session.userId && req.session.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await AuctionItem.findByIdAndDelete(req.params.id);
    await Bid.deleteMany({ auctionItem: req.params.id });

    res.json({ message: 'Auction item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's items
app.get('/api/my-items', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Please login first' });
    }

    const items = await AuctionItem.find({ seller: req.session.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============= BID ROUTES =============

// Place a bid (INSERT operation)
app.post('/api/bids', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Please login first' });
    }

    const { auctionItemId, amount } = req.body;

    const item = await AuctionItem.findById(auctionItemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Auction item not found' });
    }

    // Check if auction is active
    if (item.status !== 'active') {
      return res.status(400).json({ message: 'Auction is not active' });
    }

    // Check if auction has expired
    if (new Date() > item.closingTime) {
      item.status = item.highestBidder ? 'sold' : 'closed';
      await item.save();
      return res.status(400).json({ message: 'Auction has ended' });
    }

    // Check if seller is trying to bid on own item
    if (item.seller.toString() === req.session.userId) {
      return res.status(400).json({ message: 'Cannot bid on your own item' });
    }

    // Check if bid amount is higher than current price
    const bidAmount = Number(amount);
    if (bidAmount <= item.currentPrice) {
      return res.status(400).json({ 
        message: `Bid must be higher than current price of $${item.currentPrice}` 
      });
    }

    // Create bid
    const bid = new Bid({
      auctionItem: auctionItemId,
      bidder: req.session.userId,
      bidderName: req.session.username,
      amount: bidAmount
    });

    await bid.save();

    // Update auction item
    item.currentPrice = bidAmount;
    item.highestBidder = req.session.userId;
    item.highestBidderName = req.session.username;
    item.totalBids += 1;
    await item.save();

    res.status(201).json({ 
      message: 'Bid placed successfully',
      bid,
      item
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all bids for an item (FETCH operation)
app.get('/api/items/:id/bids', async (req, res) => {
  try {
    const bids = await Bid.find({ auctionItem: req.params.id })
      .sort({ amount: -1, timestamp: -1 });
    
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's bids
app.get('/api/my-bids', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Please login first' });
    }

    const bids = await Bid.find({ bidder: req.session.userId })
      .populate('auctionItem')
      .sort({ timestamp: -1 });
    
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============= ADMIN ROUTES =============

// Get all users (admin only)
app.get('/api/admin/users', async (req, res) => {
  try {
    if (!req.session.userId || req.session.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get statistics (admin only)
app.get('/api/admin/stats', async (req, res) => {
  try {
    if (!req.session.userId || req.session.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalUsers = await User.countDocuments();
    const totalItems = await AuctionItem.countDocuments();
    const activeItems = await AuctionItem.countDocuments({ status: 'active' });
    const totalBids = await Bid.countDocuments();

    res.json({
      totalUsers,
      totalItems,
      activeItems,
      totalBids
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============= SERVE FRONTEND =============

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/auctions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auctions.html'));
});

app.get('/create-auction', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'create-auction.html'));
});

app.get('/my-auctions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'my-auctions.html'));
});

app.get('/my-bids', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'my-bids.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/item/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'item-details.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
