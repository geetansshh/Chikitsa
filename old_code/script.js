document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const navMenu = document.querySelector('nav ul');
    const searchInput = document.getElementById('doctor-search');
    const doctorCategories = document.querySelector('.doctor-categories');
    const viewMoreBtn = document.getElementById('view-more');

    // Mobile menu toggle
    menuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('show');
    });

    // Doctor categories data
    const categories = [
        { specialty: "General Practitioners", description: "Provide general healthcare and treat a wide range of conditions." },
        { specialty: "Pediatricians", description: "Specialize in the care and treatment of infants, children, and adolescents." },
        { specialty: "Cardiologists", description: "Focus on diagnosing and treating heart and blood vessel conditions." },
        { specialty: "Neurologists", description: "Specialize in treating disorders of the nervous system." },
        { specialty: "Orthopedic Surgeons", description: "Focus on the musculoskeletal system, treating injuries and diseases of bones, joints, and muscles." },
        { specialty: "Dermatologists", description: "Treat conditions related to the skin, hair, and nails." },
        { specialty: "Oncologists", description: "Specialize in diagnosing and treating cancer." },
        { specialty: "Psychiatrists", description: "Diagnose and treat mental health conditions." },
        { specialty: "Gynecologists", description: "Specialize in women's reproductive health, pregnancy, and childbirth." },
        { specialty: "Ophthalmologists", description: "Treat eye conditions and perform eye surgeries." }
    ];

    // Function to create category element
    function createCategoryElement(category, index) {
        const categoryElement = document.createElement('div');
        categoryElement.className = `category ${index >= 4 ? 'hidden' : ''}`;
        categoryElement.innerHTML = `
            <h3>${category.specialty}</h3>
            <p>${category.description}</p>
            <a href="general-practitioners.html" class="btn">Book Now</a>
        `;
        return categoryElement;
    }

    // Initial render of categories
    categories.forEach((category, index) => {
        const categoryElement = createCategoryElement(category, index);
        doctorCategories.appendChild(categoryElement);
    });

    // View More button functionality
    viewMoreBtn.addEventListener('click', function() {
        const hiddenCategories = doctorCategories.querySelectorAll('.category.hidden');
        hiddenCategories.forEach(category => category.classList.remove('hidden'));
        this.style.display = 'none';
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const allCategories = doctorCategories.querySelectorAll('.category');
        let visibleCount = 0;

        allCategories.forEach((category, index) => {
            const specialty = category.querySelector('h3').textContent.toLowerCase();
            const description = category.querySelector('p').textContent.toLowerCase();

            if (specialty.includes(searchTerm) || description.includes(searchTerm)) {
                category.style.display = 'block';
                category.classList.remove('hidden');
                if (visibleCount < 4) {
                    category.style.order = visibleCount;
                } else {
                    category.style.order = index;
                }
                visibleCount++;
            } else {
                category.style.display = 'none';
            }
        });

        viewMoreBtn.style.display = visibleCount > 4 ? 'inline-block' : 'none';
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });

            // Close mobile menu after clicking a link
            if (navMenu.classList.contains('show')) {
                navMenu.classList.remove('show');
            }
        });
    });

    // Scroll reveal animation
    function revealOnScroll() {
        var reveals = document.querySelectorAll('.reveal');
        
        for (var i = 0; i < reveals.length; i++) {
            var windowHeight = window.innerHeight;
            var elementTop = reveals[i].getBoundingClientRect().top;
            var elementVisible = 150;
            
            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add('active');
            } else {
                reveals[i].classList.remove('active');
            }
        }
    }

    window.addEventListener('scroll', revealOnScroll);

    // Initialize scroll reveal
    revealOnScroll();
    
});