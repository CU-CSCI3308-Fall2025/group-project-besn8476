document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("post-modal-backdrop");
  const modalImg = document.getElementById("modal-image");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-description");
  const modalContact = document.getElementById("modal-contact");
  const modalCondition = document.getElementById("modal-condition");
  const modalPrice = document.getElementById("modal-price");
  const modalLocation = document.getElementById("modal-location");
  const modalListed = document.getElementById("modal-listed");
  const closeBtn = document.querySelector(".post-modal-close");

  // If we're on a page without the modal (like home/login), just stop
  if (!modal) {
    return;
  }

  const formatPrice = (rawPrice) => {
    if (rawPrice === null || rawPrice === undefined || rawPrice === "") {
      return "$—";
    }
    const asNum = Number(rawPrice);
    return Number.isFinite(asNum) ? `$${asNum.toFixed(2)}` : "$—";
  };

  // When user clicks "View Details"
  document.querySelectorAll(".post-card-view").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name || "No title";
      const description = btn.dataset.description || "No description available.";
      const contact = btn.dataset.contacts || "No contact provided.";
      const condition = btn.dataset.condition || "Condition: —";
      const price = formatPrice(btn.dataset.price);
      const location = btn.dataset.location || "Location: —";
      const listed = btn.dataset.listed || "Listed: —";
      const img = btn.dataset.img || "https://via.placeholder.com/400x250?text=No+Image+Available";

      modalTitle.textContent = name;
      modalDesc.textContent = description;
      modalContact.textContent = `Contact: ${contact}`;
      modalCondition.textContent = condition;
      modalPrice.textContent = price;
      modalLocation.textContent = `Location: ${location}`;
      modalListed.textContent = `Listed: ${listed}`;
      modalImg.src = img;

      modal.classList.remove("hidden");
    });
  });

  // Close button
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }

  // Click outside the modal to close
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });

  // ESC key to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modal.classList.add("hidden");
    }
  });
});
