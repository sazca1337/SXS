document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const socket = io();
    const modal = document.getElementById('purchaseModal');
    const buyButton = document.getElementById('buyButton');
    const closeModal = document.getElementById('closeModal');
    const purchaseForm = document.getElementById('purchaseForm');
    
    // Get size and color buttons
    const sizeButtons = document.querySelectorAll('.size-button');
    const colorButtons = document.querySelectorAll('.color-button');
    
    // Get form fields for selected size and color
    const selectedSizeInput = document.getElementById('selectedSize');
    const selectedColorInput = document.getElementById('selectedColor');
    
    // Variables to store selected size and color
    let selectedSize = '';
    let selectedColor = '';
    
    // Open modal when buy button is clicked
    buyButton.addEventListener('click', function() {
        // Check if size and color are selected
        if (!selectedSize || !selectedColor) {
            alert('Пожалуйста, выберите размер и цвет товара');
            return;
        }
        
        // Update the form with selected size and color
        selectedSizeInput.value = selectedSize;
        selectedColorInput.value = selectedColor;
        
        // Show the modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
    
    // Close modal when close button is clicked
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    });
    
    // Handle size selection
    sizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove selected class from all size buttons
            sizeButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selected class to clicked button
            this.classList.add('selected');
            
            // Store selected size
            selectedSize = this.textContent;
        });
    });
    
    // Handle color selection
    colorButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove selected class from all color buttons
            colorButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selected class to clicked button
            this.classList.add('selected');
            
            // Store selected color
            selectedColor = this.textContent;
        });
    });
    
    // Handle form submission
    purchaseForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form data
        const formData = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            telegram: document.getElementById('telegram').value,
            city: document.getElementById('city').value,
            itemName: document.getElementById('item-name').textContent,
            size: selectedSize,
            color: selectedColor
        };
        
        // Here you would typically send the data to a server
        socket.emit('purchase', formData);
        
        // Show success message
        alert('Спасибо за заказ! Мы свяжемся с вами в ближайшее время.');
        
        // Close the modal
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset the form
        purchaseForm.reset();
    });
}); 