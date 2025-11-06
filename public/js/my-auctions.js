document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  loadMyAuctions();
});

async function loadMyAuctions() {
  const loadingSpinner = document.getElementById('loadingSpinner');
  const emptyMessage = document.getElementById('emptyMessage');
  const myAuctionsGrid = document.getElementById('myAuctionsGrid');

  loadingSpinner.style.display = 'block';
  emptyMessage.style.display = 'none';
  myAuctionsGrid.innerHTML = '';

  try {
    const response = await fetch('/api/my-items');
    
    if (!response.ok) {
      throw new Error('Failed to load auctions');
    }

    const items = await response.json();

    loadingSpinner.style.display = 'none';

    if (items.length === 0) {
      emptyMessage.style.display = 'block';
      return;
    }

    items.forEach(item => {
      const card = createMyAuctionCard(item);
      myAuctionsGrid.appendChild(card);
    });
  } catch (error) {
    console.error('Failed to load auctions:', error);
    loadingSpinner.style.display = 'none';
    myAuctionsGrid.innerHTML = '<p class="empty-message">Failed to load your auctions. Please try again.</p>';
  }
}

function createMyAuctionCard(item) {
  const card = document.createElement('div');
  card.className = 'auction-card';

  const statusClass = `status-${item.status}`;
  const isExpired = new Date(item.closingTime) < new Date();
  const timeRemaining = getTimeRemaining(item.closingTime);

  card.innerHTML = `
    <img src="${item.imageUrl}" alt="${item.name}" class="auction-image" onclick="window.location.href='/item/${item._id}'">
    <div class="auction-content">
      <span class="status-badge ${statusClass}">${item.status.toUpperCase()}</span>
      <h3 onclick="window.location.href='/item/${item._id}'" style="cursor: pointer;">${item.name}</h3>
      <p>${item.description.substring(0, 100)}${item.description.length > 100 ? '...' : ''}</p>
      <p><strong>Starting Price:</strong> $${item.basePrice.toFixed(2)}</p>
      <p><strong>Current Price:</strong> <span class="price-highlight">$${item.currentPrice.toFixed(2)}</span></p>
      <p><strong>Total Bids:</strong> ${item.totalBids}</p>
      ${item.highestBidderName ? `<p><strong>Highest Bidder:</strong> ${item.highestBidderName}</p>` : ''}
      <p><strong>${isExpired ? 'Ended' : 'Ends'}:</strong> ${timeRemaining}</p>
      <div class="auction-footer">
        <button class="btn btn-sm btn-primary" onclick="window.location.href='/item/${item._id}'">View Details</button>
        <button class="btn btn-sm btn-danger" onclick="deleteAuction('${item._id}')">Delete</button>
      </div>
    </div>
  `;

  return card;
}

function getTimeRemaining(closingTime) {
  const now = new Date();
  const end = new Date(closingTime);
  const diff = end - now;

  if (diff < 0) {
    return new Date(closingTime).toLocaleDateString();
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

async function deleteAuction(itemId) {
  if (!confirm('Are you sure you want to delete this auction? This action cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch(`/api/items/${itemId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (response.ok) {
      alert('Auction deleted successfully');
      loadMyAuctions();
    } else {
      alert(data.message || 'Failed to delete auction');
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert('Failed to delete auction. Please try again.');
  }
}
