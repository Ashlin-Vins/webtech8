document.addEventListener('DOMContentLoaded', () => {
  requireAdmin();
  loadStats();
  loadUsers();
  loadAllItems();
});

async function loadStats() {
  try {
    const response = await fetch('/api/admin/stats');
    const stats = await response.json();

    document.getElementById('totalUsersCount').textContent = stats.totalUsers;
    document.getElementById('totalItemsCount').textContent = stats.totalItems;
    document.getElementById('activeItemsCount').textContent = stats.activeItems;
    document.getElementById('totalBidsCount').textContent = stats.totalBids;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

async function loadUsers() {
  const loadingSpinner = document.getElementById('usersLoadingSpinner');
  const usersTable = document.getElementById('usersTable');

  try {
    const response = await fetch('/api/admin/users');
    const users = await response.json();

    loadingSpinner.style.display = 'none';

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Role</th>
          <th>Joined</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(user => `
          <tr>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="status-badge status-${user.role === 'admin' ? 'active' : user.role === 'seller' ? 'sold' : 'closed'}">${user.role.toUpperCase()}</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
          </tr>
        `).join('')}
      </tbody>
    `;

    usersTable.appendChild(table);
  } catch (error) {
    console.error('Failed to load users:', error);
    loadingSpinner.style.display = 'none';
    usersTable.innerHTML = '<p class="empty-message">Failed to load users</p>';
  }
}

async function loadAllItems() {
  const loadingSpinner = document.getElementById('itemsLoadingSpinner');
  const itemsGrid = document.getElementById('itemsGrid');

  try {
    const response = await fetch('/api/items?status=all');
    const items = await response.json();

    loadingSpinner.style.display = 'none';

    if (items.length === 0) {
      itemsGrid.innerHTML = '<p class="empty-message">No items found</p>';
      return;
    }

    items.forEach(item => {
      const card = createAdminItemCard(item);
      itemsGrid.appendChild(card);
    });
  } catch (error) {
    console.error('Failed to load items:', error);
    loadingSpinner.style.display = 'none';
    itemsGrid.innerHTML = '<p class="empty-message">Failed to load items</p>';
  }
}

function createAdminItemCard(item) {
  const card = document.createElement('div');
  card.className = 'auction-card';

  const statusClass = `status-${item.status}`;

  card.innerHTML = `
    <img src="${item.imageUrl}" alt="${item.name}" class="auction-image" onclick="window.location.href='/item/${item._id}'">
    <div class="auction-content">
      <span class="status-badge ${statusClass}">${item.status.toUpperCase()}</span>
      <h3 onclick="window.location.href='/item/${item._id}'" style="cursor: pointer;">${item.name}</h3>
      <p><strong>Seller:</strong> ${item.sellerName}</p>
      <p><strong>Current Price:</strong> $${item.currentPrice.toFixed(2)}</p>
      <p><strong>Total Bids:</strong> ${item.totalBids}</p>
      <p><strong>Created:</strong> ${new Date(item.createdAt).toLocaleDateString()}</p>
      <div class="auction-footer">
        <button class="btn btn-sm btn-primary" onclick="window.location.href='/item/${item._id}'">View</button>
        <button class="btn btn-sm btn-danger" onclick="adminDeleteItem('${item._id}')">Delete</button>
      </div>
    </div>
  `;

  return card;
}

async function adminDeleteItem(itemId) {
  if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch(`/api/items/${itemId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (response.ok) {
      alert('Item deleted successfully');
      location.reload();
    } else {
      alert(data.message || 'Failed to delete item');
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert('Failed to delete item. Please try again.');
  }
}
