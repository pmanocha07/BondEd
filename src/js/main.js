// Simple interactivity for BondEd

document.addEventListener('DOMContentLoaded', () => {
  // Calendar day selection
  const days = document.querySelectorAll('.calendar-day');
  days.forEach(day => {
    day.addEventListener('click', () => {
      days.forEach(d => d.classList.remove('bg-indigo-100', 'ring-2', 'ring-indigo-500'));
      day.classList.add('bg-indigo-100', 'ring-2', 'ring-indigo-500');
    });
  });

  // Hover transitions for cards
  const cards = document.querySelectorAll('.forum-card, .job-card, .mentor-card');
  cards.forEach(card => {
    card.style.transition = 'all 0.3s ease';
  });
});