// Set minimum datetime to current time
document.addEventListener('DOMContentLoaded', () => {
  requireAuth();

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('closingTime').min = now.toISOString().slice(0, 16);
});

document.getElementById('createAuctionForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const description = document.getElementById('description').value;
  const basePrice = document.getElementById('basePrice').value;
  const closingTime = document.getElementById('closingTime').value;
  const imageUrl = document.getElementById('imageUrl').value;

  // Validate closing time is in the future
  if (new Date(closingTime) <= new Date()) {
    alert('Closing time must be in the future');
    return;
  }

  try {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description,
        basePrice,
        closingTime,
        imageUrl: imageUrl || undefined
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Auction created successfully!');
      window.location.href = `/item/${data.item._id}`;
    } else {
      alert(data.message || 'Failed to create auction');
    }
  } catch (error) {
    console.error('Create auction error:', error);
    alert('Failed to create auction. Please try again.');
  }
});
