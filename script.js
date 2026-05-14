/**
 * ==========================================
 * 1. STICKY HEADER FUNCTIONALITY
 * ==========================================
 */
const header = document.getElementById("header");
let lastScrollY = 0;
let isScrolling = false;

// Optimization: Using requestAnimationFrame to throttle scroll events for better performance
window.addEventListener("scroll", () => {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const firstFoldHeight = window.innerHeight;

      // Show header: Scrolled past first fold and scrolling down
      if (currentScrollY > firstFoldHeight && currentScrollY > lastScrollY) {
        header.classList.add("show");
      } 
      // Hide header: Scrolling up or above the first fold
      else {
        header.classList.remove("show");
      }

      lastScrollY = currentScrollY;
      isScrolling = false;
    });
    isScrolling = true;
  }
});

/* =========================
      MOBILE MENU TOGGLE
========================= */

const hamburgerBtn =
  document.getElementById("hamburgerBtn");

const mobileMenu =
  document.getElementById("mobileMenu");

const mobileBackdrop =
  document.getElementById("mobileBackdrop");

const closeMenuBtn =
  document.getElementById("closeMenuBtn");

/* Open/Close menu */

hamburgerBtn.addEventListener(
  "click",
  function () {

    hamburgerBtn.classList.toggle(
      "active"
    );

    mobileMenu.classList.toggle(
      "show"
    );

    mobileBackdrop.classList.toggle(
      "show"
    );

    // Accessibility
    const expanded =
      hamburgerBtn.getAttribute(
        "aria-expanded"
      ) === "true";

    hamburgerBtn.setAttribute(
      "aria-expanded",
      !expanded
    );

    // Prevent page scroll while menu open
    document.body.style.overflow =
      mobileMenu.classList.contains("show")
      ? "hidden"
      : "";
  }
);

/* Close button */

closeMenuBtn.addEventListener(
  "click",
  closeMobileMenu
);

/* Close when backdrop clicked */

mobileBackdrop.addEventListener(
  "click",
  closeMobileMenu
);

/* Reusable close function */

function closeMobileMenu(){

  hamburgerBtn.classList.remove(
    "active"
  );

  mobileMenu.classList.remove(
    "show"
  );

  mobileBackdrop.classList.remove(
    "show"
  );

  hamburgerBtn.setAttribute(
    "aria-expanded",
    "false"
  );

  document.body.style.overflow = "";
}


/**
 * ==========================================
 * 2. IMAGE GALLERY & ZOOM FUNCTIONALITY
 * ==========================================
 */
const images = [
  { id: 1, url: "assets/hero_image.jpg", alt: "HDPE Pipes - View 1" },
  { id: 2, url: "assets/image2.jpg", alt: "Pipeline Infrastructure - View 2" },
  { id: 3, url: "assets/image3.jpg", alt: "Industrial Piping - View 3" },
  { id: 4, url: "assets/image4.webp", alt: "Pipeline System - View 4" },
  { id: 5, url: "assets/image5.jpg", alt: "Modern Pipes - View 5" }
];

// DOM Elements
const mainImage = document.getElementById("mainImage");
const thumbnailWrapper = document.getElementById("thumbnailWrapper");
const currentIndexText = document.getElementById("currentIndex");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const zoomPreview = document.getElementById("zoomPreview");
const magnifier = document.getElementById("magnifier");
const imageContainer = document.querySelector(".main-image-container");

let currentImageIndex = 0;

/**
 * Updates the main image display and triggers thumbnail rendering.
 */
function updateImage() {
  const currentImage = images[currentImageIndex];
  mainImage.style.opacity = "0.4"; // Fade out effect

  setTimeout(() => {
    mainImage.src = currentImage.url;
    mainImage.alt = currentImage.alt;
    currentIndexText.textContent = currentImageIndex + 1;
    mainImage.style.opacity = "1"; // Fade in effect
  }, 150);

  renderThumbnails();
}

/**
 * Generates thumbnail buttons. 
 * Optimization: Uses DocumentFragment to minimize DOM reflows.
 */
function renderThumbnails() {
  thumbnailWrapper.innerHTML = "";
  const fragment = document.createDocumentFragment();

  images.forEach((image, index) => {
    const thumb = document.createElement("button");
    thumb.className = `thumbnail ${index === currentImageIndex ? "active" : ""}`;
    thumb.innerHTML = `<img src="${image.url}" alt="${image.alt}">`;

    thumb.addEventListener("click", () => {
      currentImageIndex = index;
      updateImage();
    });

    fragment.appendChild(thumb);
  });

  thumbnailWrapper.appendChild(fragment);
}

/**
 * Optimization: Consolidated next/prev image logic into a single reusable function.
 */
function navigateImage(direction) {
  magnifier.style.display = "none"; // Hide magnifier during transition
  
  if (direction === 'next') {
    currentImageIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
  } else {
    currentImageIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
  }
  
  updateImage();
  zoomPreview.style.backgroundImage = `url(${images[currentImageIndex].url})`;
}

prevBtn.addEventListener("click", () => navigateImage('prev'));
nextBtn.addEventListener("click", () => navigateImage('next'));

// Arrow Button Fix: Handle magnifier visibility when hovering over navigation buttons
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    magnifier.style.display = "none";
    zoomPreview.classList.add("active");
  });

  btn.addEventListener("mouseleave", () => {
    if (window.innerWidth > 992) {
      magnifier.style.display = "flex";
    }
  });
});

// --- ZOOM LOGIC ---
let isZooming = false;

imageContainer.addEventListener("mouseenter", () => {
  if (window.innerWidth <= 992) return;
  zoomPreview.classList.add("active");
  magnifier.style.display = "flex";
});

// Optimization: requestAnimationFrame used for smooth, performant mouse tracking
imageContainer.addEventListener("mousemove", (e) => {
  if (window.innerWidth <= 992) return;
  if (!isZooming) {
    window.requestAnimationFrame(() => {
      const rect = mainImage.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      zoomPreview.style.backgroundImage = `url(${images[currentImageIndex].url})`;
      zoomPreview.style.backgroundPosition = `${x}% ${y}%`;
      magnifier.style.left = `${e.clientX - 50}px`;
      magnifier.style.top = `${e.clientY - 50}px`;
      mainImage.style.transform = "scale(1.03)";
      
      isZooming = false;
    });
    isZooming = true;
  }
});

imageContainer.addEventListener("mouseleave", () => {
  zoomPreview.classList.remove("active");
  magnifier.style.display = "none";
  mainImage.style.transform = "scale(1)";
});

// --- SWIPE LOGIC ---
let touchStartX = 0;
let touchEndX = 0;

mainImage.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

mainImage.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  if (touchEndX < touchStartX - 50) navigateImage('next'); // Swiped left
  if (touchEndX > touchStartX + 50) navigateImage('prev'); // Swiped right
}

// Initialize gallery
updateImage();


/**
 * ==========================================
 * 3. TECHNICAL SPECIFICATIONS DATA & RENDER
 * ==========================================
 */
const technicalSpecificationsData = [
  { parameter: "Pipe Diameter Range", specification: '20mm to 1600mm (3/4" to 63")' },
  { parameter: "Pressure Ratings", specification: "PN 2.5, PN 4, PN 6, PN 8, PN 10, PN 12.5, PN 16" },
  { parameter: "Standard Dimension Ratio", specification: "SDR 33, SDR 26, SDR 21, SDR 17, SDR 13.6, SDR 11" },
  { parameter: "Operating Temperature", specification: "-40°C to +80°C (-40°F to +176°F)" },
  { parameter: "Service Life", specification: "50+ Years (at 20 degrees C, PN 10)" },
  { parameter: "Material Density", specification: "0.95 - 0.96 g/cm³" },
  { parameter: "Certification Standards", specification: "IS 5984, ISO 4427, ASTM D3035" },
  { parameter: "Joint Type", specification: "Butt Fusion, Electrofusion, Mechanical" },
  { parameter: "Coil Lengths", specification: "Up to 500m (for smaller diameters)" },
  { parameter: "Country of Origin", specification: "🇮🇳 India" }
];

const technicalSpecsTableBodyElement = document.getElementById("technicalSpecsTableBody");

function renderTechnicalSpecsTable() {
  const fragment = document.createDocumentFragment();
  technicalSpecificationsData.forEach((technicalSpecItem) => {
    const technicalSpecRow = document.createElement("tr");
    technicalSpecRow.innerHTML = `
      <td>${technicalSpecItem.parameter}</td>
      <td>${technicalSpecItem.specification}</td>
    `;
    fragment.appendChild(technicalSpecRow);
  });
  technicalSpecsTableBodyElement.appendChild(fragment);
}

renderTechnicalSpecsTable();


/**
 * ==========================================
 * 4. FEATURES SECTION DATA & RENDER
 * ==========================================
 */
const featuresSectionData = [
  { icon: "assets/Bag.svg", title: "Superior Chemical Resistance", description: "HDPE pipes resist a wide range of chemicals, acids, and alkalis. Unlike metal pipes, they won't corrode, rust, or scale..." },
  { icon: "assets/Needle.svg", title: "Exceptional Flexibility & Durability", description: "HDPE pipes resist a wide range of chemicals, acids, and alkalis. Unlike metal pipes, they won't corrode, rust, or scale..." },
  { icon: "assets/Package.svg", title: "Leak-Proof Fusion Welding", description: "HDPE pipes resist a wide range of chemicals, acids, and alkalis. Unlike metal pipes, they won't corrode, rust, or scale..." },
  { icon: "assets/GearFine.svg", title: "Cost-Effective Long-Term Solution", description: "HDPE pipes resist a wide range of chemicals, acids, and alkalis. Unlike metal pipes, they won't corrode, rust, or scale..." },
  { icon: "assets/GearFine.svg", title: "Environmentally Sustainable", description: "HDPE pipes resist a wide range of chemicals, acids, and alkalis. Unlike metal pipes, they won't corrode, rust, or scale..." },
  { icon: "assets/GearFine.svg", title: "Certified Quality Assurance", description: "HDPE pipes resist a wide range of chemicals, acids, and alkalis. Unlike metal pipes, they won't corrode, rust, or scale..." }
];

const featuresGridElement = document.getElementById("featuresGridContainer");

function renderFeaturesSection() {
  const fragment = document.createDocumentFragment();
  featuresSectionData.forEach((featureItem) => {
    const featureCardElement = document.createElement("div");
    featureCardElement.className = "feature-card";
    featureCardElement.innerHTML = `
      <img src="${featureItem.icon}" alt="${featureItem.title}" class="feature-card-icon">
      <h3 class="feature-card-title">${featureItem.title}</h3>
      <p class="feature-card-description">${featureItem.description}</p>
    `;
    fragment.appendChild(featureCardElement);
  });
  featuresGridElement.appendChild(fragment);
}

renderFeaturesSection();


/**
 * ==========================================
 * 5. FAQ ACCORDION
 * ==========================================
 */
const faqAccordionContent = [
  { question: "What is the purpose of a laser cutter for sheet metal?", answer: "It is designed to cut various types of sheet metal with precision, allowing for intricate designs and shapes that are essential in manufacturing processes." },
  { question: "What is the purpose of a laser cutter for sheet metal?", answer: "It is designed to cut various types of sheet metal with precision, allowing for intricate designs and shapes that are essential in manufacturing processes." },
  { question: "What is the purpose of a laser cutter for sheet metal?", answer: "It is designed to cut various types of sheet metal with precision, allowing for intricate designs and shapes that are essential in manufacturing processes." }
];

const faqListContainerElement = document.getElementById("faqListWrapper");

function generateFaqAccordion() {
  const fragment = document.createDocumentFragment();
  
  faqAccordionContent.forEach((faqEntry) => {
    const faqCardElement = document.createElement("div");
    faqCardElement.className = "faq-card";
    faqCardElement.innerHTML = `
      <div class="faq-card-top">
        <p class="faq-question-text">${faqEntry.question}</p>
        <img src="assets/accordian-close.svg" alt="toggle icon" class="faq-toggle-icon">
      </div>
      <div class="faq-answer-text">${faqEntry.answer}</div>
    `;

    // Accordion Click Logic
    const faqTopSection = faqCardElement.querySelector(".faq-card-top");
    faqTopSection.addEventListener("click", () => {
      const currentlyOpenFaq = document.querySelector(".faq-card.active");

      // Close the previously opened card
      if (currentlyOpenFaq && currentlyOpenFaq !== faqCardElement) {
        currentlyOpenFaq.classList.remove("active");
        currentlyOpenFaq.querySelector(".faq-toggle-icon").src = "assets/accordian-close.svg";
      }

      // Toggle current card
      const isActive = faqCardElement.classList.toggle("active");
      faqCardElement.querySelector(".faq-toggle-icon").src = isActive 
        ? "assets/accordian-open.svg" 
        : "assets/accordian-close.svg";
    });

    fragment.appendChild(faqCardElement);
  });
  
  faqListContainerElement.appendChild(fragment);
}

generateFaqAccordion();


/**
 * ==========================================
 * 6. VERSATILE CAROUSEL
 * ==========================================
 */
const versatileSectionItems = Array(4).fill({
  title: "Fishnet Manufacturing",
  description: "High-performance twisting solutions for packaging yarn, strapping materials, and reinforcement threads used in modern packaging applications.",
  image: "assets/worker-mobile.svg"
});

const versatileCardsWrapper = document.getElementById("versatileCarouselWrapper");
const versatilePreviousButton = document.getElementById("versatileLeftButton");
const versatileNextButton = document.getElementById("versatileRightButton");

function renderVersatileCards() {
  const fragment = document.createDocumentFragment();
  versatileSectionItems.forEach((versatileCard) => {
    const cardElement = document.createElement("div");
    cardElement.className = "versatile-carousel-card";
    cardElement.style.backgroundImage = `url(${versatileCard.image})`;
    cardElement.innerHTML = `
      <div class="versatile-carousel-overlay"></div>
      <div class="versatile-carousel-content">
        <h3>${versatileCard.title}</h3>
        <p>${versatileCard.description}</p>
      </div>
    `;
    fragment.appendChild(cardElement);
  });
  versatileCardsWrapper.appendChild(fragment);
}

// Carousel controls
versatilePreviousButton.addEventListener("click", () => versatileCardsWrapper.scrollBy({ left: -340, behavior: "smooth" }));
versatileNextButton.addEventListener("click", () => versatileCardsWrapper.scrollBy({ left: 340, behavior: "smooth" }));

renderVersatileCards();


/**
 * ==========================================
 * 7. HDPE PROCESS DATA & RENDER
 * ==========================================
 */
const hdpeProcessData = [
  { title: "Raw Material", heading: "High-Grade Raw Material Selection", description: "Vacuum sizing tanks ensure precise outer diameter while internal pressure maintains perfect roundness and wall thickness uniformity.", points: ["PE100 grade material", "Optimal molecular weight distribution"], picture: "assets/hdpe-process.svg" },
  { title: "Extrusion", heading: "Advanced Extrusion Process", description: "State-of-the-art extrusion technology ensures consistent quality and optimal material properties.", points: ["Precision temperature control", "Uniform material flow"], picture: "assets/hdpe-process.svg" },
  { title: "Cooling", heading: "Controlled Cooling System", description: "Advanced cooling technology maintains structural integrity and dimensional accuracy.", points: ["Water bath cooling", "Temperature monitoring"], picture: "assets/hdpe-process.svg" },
  { title: "Sizing", heading: "Precision Sizing Process", description: "Vacuum sizing ensures exact diameter specifications and wall thickness.", points: ["Automated sizing control", "Quality verification"], picture: "assets/hdpe-process.svg" },
  { title: "Quality Control", heading: "Comprehensive Quality Testing", description: "Multiple quality checkpoints ensure every pipe meets international standards.", points: ["Pressure testing", "Dimensional inspection"], picture: "assets/hdpe-process.svg" },
  { title: "Marking", heading: "Product Identification", description: "Clear marking system for traceability and compliance verification.", points: ["Standard markings", "Batch tracking codes"], picture: "assets/hdpe-process.svg" },
  { title: "Cutting", heading: "Precision Cutting Process", description: "Automated cutting ensures accurate lengths and clean edges.", points: ["Length precision", "Clean cut edges"], picture: "assets/hdpe-process.svg" },
  { title: "Packaging", heading: "Protective Packaging", description: "Careful packaging ensures safe transportation and storage.", points: ["Protective wrapping", "Secure bundling"], picture: "assets/hdpe-process.svg" }
];

const hdpeButtons = document.querySelectorAll(".hdpe-step-button");
const hdpeTitleText = document.getElementById("hdpeHeading");
const hdpeDescText = document.getElementById("hdpeDescription");
const hdpeImageTag = document.getElementById("hdpeMainImage");
const hdpeListHolder = document.getElementById("hdpeFeatureList");
const hdpeMobileText = document.getElementById("hdpeMobileStep");

let hdpeCurrentIndex = 0;

function renderHdpeSection(indexValue) {
  const selectedItem = hdpeProcessData[indexValue];
  
  hdpeTitleText.textContent = selectedItem.heading;
  hdpeDescText.textContent = selectedItem.description;
  hdpeImageTag.src = selectedItem.picture;
  hdpeImageTag.alt = selectedItem.title;
  hdpeMobileText.textContent = `Step ${indexValue + 1}/${hdpeProcessData.length} : ${selectedItem.title}`;
  
  hdpeListHolder.innerHTML = "";
  const fragment = document.createDocumentFragment();
  
  selectedItem.points.forEach((pointText) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<img src="assets/CheckCircle.svg" alt=""> ${pointText}`;
    fragment.appendChild(listItem);
  });
  
  hdpeListHolder.appendChild(fragment);

  // Update button active state
  hdpeButtons.forEach(btn => btn.classList.remove("active"));
  if (hdpeButtons[indexValue]) {
    hdpeButtons[indexValue].classList.add("active");
  }
}

// Step Button events
hdpeButtons.forEach((singleButton) => {
  singleButton.addEventListener("click", function() {
    hdpeCurrentIndex = Number(this.dataset.pos);
    renderHdpeSection(hdpeCurrentIndex);
  });
});

// Arrow Button events
document.getElementById("hdpePrevBtn").addEventListener("click", () => {
  hdpeCurrentIndex = hdpeCurrentIndex < 1 ? hdpeProcessData.length - 1 : hdpeCurrentIndex - 1;
  renderHdpeSection(hdpeCurrentIndex);
});

document.getElementById("hdpeNextBtn").addEventListener("click", () => {
  hdpeCurrentIndex = hdpeCurrentIndex >= hdpeProcessData.length - 1 ? 0 : hdpeCurrentIndex + 1;
  renderHdpeSection(hdpeCurrentIndex);
});

// Initialize HDPE
renderHdpeSection(0);


/**
 * ==========================================
 * 8. PERFORMANCE SECTION OPTIONAL DRAG SCROLL
 * ==========================================
 */
const performanceScrollContainer = document.getElementById("performanceSliderArea");
let performancePressed = false;
let performanceStartX;
let performanceScrollLeft;

performanceScrollContainer.addEventListener("mousedown", (event) => {
  performancePressed = true;
  performanceStartX = event.pageX - performanceScrollContainer.offsetLeft;
  performanceScrollLeft = performanceScrollContainer.scrollLeft;
  performanceScrollContainer.style.cursor = "grabbing";
});

const endPerformanceDrag = () => {
  performancePressed = false;
  performanceScrollContainer.style.cursor = "grab";
};

performanceScrollContainer.addEventListener("mouseleave", endPerformanceDrag);
performanceScrollContainer.addEventListener("mouseup", endPerformanceDrag);

performanceScrollContainer.addEventListener("mousemove", (event) => {
  if (!performancePressed) return;
  event.preventDefault();
  const mousePosition = event.pageX - performanceScrollContainer.offsetLeft;
  const walkDistance = (mousePosition - performanceStartX) * 1.5; // Drag speed multiplier
  performanceScrollContainer.scrollLeft = performanceScrollLeft - walkDistance;
});


/**
 * ==========================================
 * 9. MISC: SOLUTIONS, RESOURCES, FORMS, FOOTER
 * ==========================================
 */

// Solutions Section
document.querySelectorAll('.solutions-learn-btn').forEach((buttonElement) => {
  buttonElement.addEventListener('click', function() {
    const solutionCard = buttonElement.closest('.solutions-single-card');
    const solutionTitle = solutionCard.querySelector('.solutions-card-heading').textContent;
    console.log('Learn more about:', solutionTitle);
  });
});

document.querySelector('.solutions-expert-btn')?.addEventListener('click', () => {
  console.log('Talk to an Expert clicked');
});

// Resources Section
document.querySelectorAll('.resources-download-button').forEach((resourceButton) => {
  resourceButton.addEventListener('click', function() {
    const resourceDocumentName = resourceButton.getAttribute('data-resource');
    console.log('Downloading:', resourceDocumentName);
  });
});

// Quote Form
document.getElementById("quoteForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  
  const formData = {
    fullName: document.getElementById("contactFullName").value,
    companyName: document.getElementById("contactCompanyName").value,
    email: document.getElementById("contactEmail").value,
    phone: document.getElementById("contactPhone").value
  };

  console.log(formData);
  alert("Request submitted successfully!");
});

// Footer hover effect
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".footer-column a, .footer-bottom-links a").forEach((footerLink) => {
    footerLink.addEventListener("mouseenter", () => footerLink.style.transform = "translateX(2px)");
    footerLink.addEventListener("mouseleave", () => footerLink.style.transform = "translateX(0px)");
  });
});