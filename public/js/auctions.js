let currentFilter = 'active';

async function loadAuctions(filter = 'active') {
  currentFilter = filter;
  const loadingSpinner = document.getElementById('loadingSpinner');
  const emptyMessage = document.getElementById('emptyMessage');
  const auctionsGrid = document.getElementById('auctionsGrid');

  loadingSpinner.style.display = 'block';
  emptyMessage.style.display = 'none';
  auctionsGrid.innerHTML = '';

  try {
    const url = filter === 'all' ? '/api/items' : `/api/items?status=${filter}`;
    const response = await fetch(url);
    const items = await response.json();

    loadingSpinner.style.display = 'none';

    if (items.length === 0) {
      emptyMessage.style.display = 'block';
      return;
    }

    items.forEach(item => {
      const card = createAuctionCard(item);
      auctionsGrid.appendChild(card);
    });
  } catch (error) {
    console.error('Failed to load auctions:', error);
    loadingSpinner.style.display = 'none';
    auctionsGrid.innerHTML = '<p class="empty-message">Failed to load auctions. Please try again.</p>';
  }
}

function createAuctionCard(item) {
  const card = document.createElement('div');
  card.className = 'auction-card';
  card.onclick = () => window.location.href = `/item/${item._id}`;

  const statusClass = `status-${item.status}`;
  const timeRemaining = getTimeRemaining(item.closingTime);
  const isExpired = new Date(item.closingTime) < new Date();

  card.innerHTML = `
    <img src="${item.imageUrl}" alt="${item.name}" class="auction-image">
    <div class="auction-content">
      <span class="status-badge ${statusClass}">${item.status.toUpperCase()}</span>
      <h3>${item.name}</h3>
      <p>${item.description.substring(0, 100)}${item.description.length > 100 ? '...' : ''}</p>
      <p><strong>Current Price:</strong> <span class="price-highlight">$${item.currentPrice.toFixed(2)}</span></p>
      <p><strong>Bids:</strong> ${item.totalBids}</p>
      <p><strong>${isExpired ? 'Ended' : 'Ends'}:</strong> ${timeRemaining}</p>
      <p><strong>Seller:</strong> ${item.sellerName}</p>
    </div>
  `;

  return card;
}

function getTimeRemaining(closingTime) {
  const now = new Date();
  const end = new Date(closingTime);
  const diff = end - now;

  if (diff < 0) {
    return 'Auction ended';
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

function filterItems(status) {
  loadAuctions(status);
}

document.addEventListener('DOMContentLoaded', () => {
  loadAuctions('active');
});
