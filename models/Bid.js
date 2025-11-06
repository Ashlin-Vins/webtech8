const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  auctionItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionItem',
    required: true
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bidderName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
bidSchema.index({ auctionItem: 1, amount: -1 });

module.exports = mongoose.model('Bid', bidSchema);
