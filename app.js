const API_URL = "https://lisehuybrecht.github.io/Photobooth/";

const form = document.getElementById("lookup-form");
const codeInput = document.getElementById("photo-code");
const submitButton = document.getElementById("submit-button");
const status = document.getElementById("status");

const photoResult = document.getElementById("photo-result");
const photo = document.getElementById("photo");
const downloadButton = document.getElementById("download-button");

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	const code = codeInput.value.trim();

	// ============================================
	// VALIDATE INPUT
	// ============================================

	if (!/^\d{13}$/.test(code)) {
		status.textContent = "Please enter a valid 13-digit code.";
		return;
	}

	// ============================================
	// UPDATE INTERFACE
	// ============================================

	submitButton.disabled = true;
	status.textContent = "Searching for your photo...";
	photoResult.hidden = true;

	try {
		// ========================================
		// REQUEST JSON FROM BACKEND
		// ========================================

		const response = await fetch(API_URL, {
			method: "GET"
		});

		if (!response.ok) {
			const errorDetails = await response.text();

			console.error("HTTP status:", response.status);
			console.error("Response:", errorDetails);

			throw new Error("API request failed: " + response.status);
		}

		// ========================================
		// READ JSON RESPONSE
		// ========================================

		const data = await response.json();

		console.log(data);

		if (!Array.isArray(data)) {
			throw new Error("Unexpected JSON response format.");
		}

		// ========================================
		// FIND ENTRY WITH MATCHING CODE
		// ========================================

		const matchingEntry = data.find(
			(entry) => String(entry.code).trim() === code,
		);

		if (!matchingEntry) {
			throw new Error("No photo found for this code.");
		}

		if (!matchingEntry.image || typeof matchingEntry.image !== "string") {
			throw new Error("The matching entry has no image.");
		}

		// ========================================
		// DISPLAY MATCHING IMAGE
		// ========================================

		const imageData = matchingEntry.image;

		if (imageData.startsWith("data:")) {
			photo.src = imageData;
		} else {
			photo.src = "data:image/jpeg;base64," + imageData;
		}

		// ========================================
		// PREPARE DOWNLOAD
		// ========================================

		downloadButton.href = photo.src;
		downloadButton.download = "photo-" + matchingEntry.id + ".jpg";

		// ========================================
		// SHOW RESULT
		// ========================================

		photoResult.hidden = false;
		status.textContent = "Your photo is ready.";
	} catch (error) {
		console.error(error);

		status.textContent =
			error.message === "No photo found for this code."
				? "No photo was found for that code."
				: "Unable to retrieve your photo. Please try again.";
	} finally {
		submitButton.disabled = false;
	}
});
