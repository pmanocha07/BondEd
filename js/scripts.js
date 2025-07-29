// Simple interactivity for the demo
document.addEventListener('DOMContentLoaded', function() {
    // Load partials dynamically
    const sections = ['header', 'hero', 'features', 'directory', 'mentorship', 'opportunities', 'community', 'events', 'testimonials', 'cta', 'footer'];
    sections.forEach(section => {
        fetch(`partials/${section}.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                document.getElementById(section).innerHTML = data;
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    });

    // Calendar day hover effect
    const days = document.querySelectorAll('.calendar-day');
    days.forEach(day => {
        day.addEventListener('click', () => {
            days.forEach(d => d.classList.remove('bg-indigo-100', 'ring-2', 'ring-indigo-500'));
            day.classList.add('bg-indigo-100', 'ring-2', 'ring-indigo-500');
        });
    });

    // Card hover animations
    const cards = document.querySelectorAll('.forum-card, .job-card, .mentor-card');
    cards.forEach(card => {
        card.style.transition = 'all 0.3s ease';
    });
});
