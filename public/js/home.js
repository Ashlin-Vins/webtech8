// Load statistics on page load
async function loadStats() {
  try {
    const response = await fetch('/api/items');
    const items = await response.json();

    const activeCount = items.filter(item => item.status === 'active').length;
    const totalCount = items.length;

    // Get total bids
    let totalBids = 0;
    items.forEach(item => {
      totalBids += item.totalBids || 0;
    });

    document.getElementById('activeAuctionsCount').textContent = activeCount;
    document.getElementById('totalItemsCount').textContent = totalCount;
    document.getElementById('totalBidsCount').textContent = totalBids;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadStats();
});
