document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  loadMyBids();
});

async function loadMyBids() {
  const loadingSpinner = document.getElementById('loadingSpinner');
  const emptyMessage = document.getElementById('emptyMessage');
  const myBidsList = document.getElementById('myBidsList');

  loadingSpinner.style.display = 'block';
  emptyMessage.style.display = 'none';
  myBidsList.innerHTML = '';

  try {
    const response = await fetch('/api/my-bids');
    
    if (!response.ok) {
      throw new Error('Failed to load bids');
    }

    const bids = await response.json();

    loadingSpinner.style.display = 'none';

    if (bids.length === 0) {
      emptyMessage.style.display = 'block';
      return;
    }

    // Group bids by auction item
    const bidsByItem = {};
    bids.forEach(bid => {
      const itemId = bid.auctionItem._id;
      if (!bidsByItem[itemId]) {
        bidsByItem[itemId] = {
          item: bid.auctionItem,
          bids: []
        };
      }
      bidsByItem[itemId].bids.push(bid);
    });

    // Display grouped bids
    Object.values(bidsByItem).forEach(group => {
      const bidCard = createBidCard(group.item, group.bids);
      myBidsList.appendChild(bidCard);
    });
  } catch (error) {
    console.error('Failed to load bids:', error);
    loadingSpinner.style.display = 'none';
    myBidsList.innerHTML = '<p class="empty-message">Failed to load your bids. Please try again.</p>';
  }
}

function createBidCard(item, bids) {
  const card = document.createElement('div');
  card.className = 'bid-card';

  // Sort bids by amount (highest first)
  bids.sort((a, b) => b.amount - a.amount);
  const highestBid = bids[0];

  const isWinning = item.highestBidder && highestBid.bidder === item.highestBidder.toString();
  const isActive = item.status === 'active';
  const statusClass = `status-${item.status}`;

  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
      <div>
        <h3 onclick="window.location.href='/item/${item._id}'" style="cursor: pointer; margin-bottom: 0.5rem;">
          ${item.name}
        </h3>
        <span class="status-badge ${statusClass}">${item.status.toUpperCase()}</span>
        ${isWinning && isActive ? '<span class="winning-badge">WINNING 🏆</span>' : ''}
      </div>
      <button class="btn btn-sm btn-primary" onclick="window.location.href='/item/${item._id}'">View Item</button>
    </div>

    <div class="bid-card-meta">
      <p><strong>Current Price:</strong> <span style="color: var(--success-color); font-size: 1.2rem;">$${item.currentPrice.toFixed(2)}</span></p>
      <p><strong>Your Highest Bid:</strong> <span style="color: var(--primary-color); font-size: 1.2rem;">$${highestBid.amount.toFixed(2)}</span></p>
      <p><strong>Total Bids by You:</strong> ${bids.length}</p>
      <p><strong>Ends:</strong> ${new Date(item.closingTime).toLocaleString()}</p>
    </div>

    ${bids.length > 1 ? `
      <details style="margin-top: 1rem;">
        <summary style="cursor: pointer; font-weight: 500;">View all your bids (${bids.length})</summary>
        <div style="margin-top: 0.5rem; padding-left: 1rem;">
          ${bids.map(bid => `
            <p style="margin: 0.3rem 0;">
              $${bid.amount.toFixed(2)} - ${new Date(bid.timestamp).toLocaleString()}
            </p>
          `).join('')}
        </div>
      </details>
    ` : ''}
  `;

  return card;
}
