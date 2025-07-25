// src/components/SmartHomeSetup.js

export function renderSmartHomeForm() {
  // Listen for form submission and collect inputs
  const form = document.getElementById("homeForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const sqft = document.getElementById("squareFootage").value;
    const region = document.getElementById("region").value;

    // Store or pass this info to task generator
    console.log("Submitted:", { sqft, region });

    // Dispatch a custom event to let other modules know
    document.dispatchEvent(new CustomEvent("homeSetupSubmitted", {
      detail: { sqft, region }
    }));
  });
}

