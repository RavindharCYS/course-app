document.addEventListener('DOMContentLoaded', function() {
    // Module accordion functionality
    const moduleHeaders = document.querySelectorAll('.module-header');
    
    moduleHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const isOpen = content.style.display === 'block';
            
            // Close all modules
            document.querySelectorAll('.module-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // Open clicked module if it was closed
            if (!isOpen) {
                content.style.display = 'block';
            }
        });
    });

    // Wishlist button functionality
    const wishlistBtn = document.querySelector('.wishlist-button');
    wishlistBtn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
        this.classList.toggle('active');
    });

    // Enroll button functionality
    const enrollBtn = document.querySelector('.enroll-button');
    enrollBtn.addEventListener('click', function() {
        // Add your enrollment logic here
        alert('Enrollment functionality coming soon!');
    });
});