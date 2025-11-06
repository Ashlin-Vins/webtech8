let itemId;
let currentUser;
let updateInterval;

async function loadItemDetails() {
  // Get item ID from URL
  const path = window.location.pathname;
  itemId = path.split('/').pop();

  const loadingSpinner = document.getElementById('loadingSpinner');
  const itemDetails = document.getElementById('itemDetails');

  try {
    // Get current user
    currentUser = await checkAuth();

    // Fetch item details
    const response = await fetch(`/api/items/${itemId}`);
    const item = await response.json();

    if (!response.ok) {
      throw new Error(item.message || 'Item not found');
    }

    loadingSpinner.style.display = 'none';
    itemDetails.style.display = 'block';

    displayItemDetails(item);
    loadBidHistory();

    // Update time remaining every minute
    updateInterval = setInterval(() => {
      updateTimeRemaining(item.closingTime);
    }, 60000);
    
    updateTimeRemaining(item.closingTime);
  } catch (error) {
    console.error('Failed to load item:', error);
    loadingSpinner.innerHTML = '<p class="empty-message">Failed to load item details. <a href="/auctions">Back to auctions</a></p>';
  }
}

function displayItemDetails(item) {
  document.getElementById('itemImage').src = item.imageUrl;
  document.getElementById('itemName').textContent = item.name;
  document.getElementById('itemDescription').textContent = item.description;
  document.getElementById('sellerName').textContent = item.sellerName;
  document.getElementById('basePrice').textContent = item.basePrice.toFixed(2);
  document.getElementById('currentPrice').textContent = item.currentPrice.toFixed(2);
  document.getElementById('totalBids').textContent = item.totalBids;
  document.getElementById('highestBidder').textContent = item.highestBidderName || 'None yet';
  
  const closingDate = new Date(item.closingTime);
  document.getElementById('closingTime').textContent = closingDate.toLocaleString();

  const statusBadge = document.getElementById('itemStatus');
  statusBadge.textContent = item.status.toUpperCase();
  statusBadge.className = `item-status-badge status-badge status-${item.status}`;

  // Show bid section if user is logged in, not the seller, and auction is active
  const bidSection = document.getElementById('bidSection');
  const auctionEndedMessage = document.getElementById('auctionEndedMessage');

  if (item.status === 'active' && currentUser && currentUser.id !== item.seller.toString()) {
    bidSection.style.display = 'block';
    auctionEndedMessage.style.display = 'none';
    
    // Set minimum bid amount
    const bidAmountInput = document.getElementById('bidAmount');
    bidAmountInput.min = (item.currentPrice + 0.01).toFixed(2);
    bidAmountInput.placeholder = `Minimum: $${(item.currentPrice + 0.01).toFixed(2)}`;
  } else {
    bidSection.style.display = 'none';
    if (item.status !== 'active') {
      auctionEndedMessage.style.display = 'block';
    }
  }
}

function updateTimeRemaining(closingTime) {
  const now = new Date();
  const end = new Date(closingTime);
  const diff = end - now;

  const timeRemainingElement = document.getElementById('timeRemaining');

  if (diff < 0) {
    timeRemainingElement.innerHTML = '<strong>⏰ Auction has ended</strong>';
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    // Reload to update status
    setTimeout(() => location.reload(), 2000);
  } else {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let timeString = '⏰ Time Remaining: ';
    if (days > 0) {
      timeString += `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      timeString += `${hours}h ${minutes}m ${seconds}s`;
    } else {
      timeString += `${minutes}m ${seconds}s`;
    }

    timeRemainingElement.innerHTML = `<strong>${timeString}</strong>`;
  }
}

async function loadBidHistory() {
  try {
    const response = await fetch(`/api/items/${itemId}/bids`);
    const bids = await response.json();

    const bidHistoryList = document.getElementById('bidHistoryList');

    if (bids.length === 0) {
      bidHistoryList.innerHTML = '<p class="empty-message">No bids yet. Be the first to bid!</p>';
      return;
    }

    bidHistoryList.innerHTML = '';
    bids.forEach((bid, index) => {
      const bidItem = document.createElement('div');
      bidItem.className = `bid-item ${index === 0 ? 'highest' : ''}`;
      
      const bidDate = new Date(bid.timestamp);
      bidItem.innerHTML = `
        <div>
          <strong>${bid.bidderName}</strong> ${index === 0 ? '👑' : ''}
          <br>
          <small>${bidDate.toLocaleString()}</small>
        </div>
        <div>
          <strong style="color: var(--success-color); font-size: 1.2rem;">$${bid.amount.toFixed(2)}</strong>
        </div>
      `;
      bidHistoryList.appendChild(bidItem);
    });
  } catch (error) {
    console.error('Failed to load bid history:', error);
  }
}

document.getElementById('bidForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const bidAmount = document.getElementById('bidAmount').value;

  if (!confirm(`Place bid of $${parseFloat(bidAmount).toFixed(2)}?`)) {
    return;
  }

  try {
    const response = await fetch('/api/bids', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        auctionItemId: itemId,
        amount: bidAmount
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Bid placed successfully!');
      location.reload();
    } else {
      alert(data.message || 'Failed to place bid');
    }
  } catch (error) {
    console.error('Bid error:', error);
    alert('Failed to place bid. Please try again.');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  loadItemDetails();
});

// Cleanup interval on page unload
window.addEventListener('beforeunload', () => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});
