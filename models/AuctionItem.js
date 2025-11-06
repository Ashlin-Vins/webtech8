const mongoose = require('mongoose');

const auctionItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    default: function() {
      return this.basePrice;
    }
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  closingTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'sold'],
    default: 'active'
  },
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  highestBidderName: {
    type: String,
    default: null
  },
  totalBids: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/300x200?text=Auction+Item'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to check if auction is expired
auctionItemSchema.methods.isExpired = function() {
  return new Date() > this.closingTime;
};

module.exports = mongoose.model('AuctionItem', auctionItemSchema);
