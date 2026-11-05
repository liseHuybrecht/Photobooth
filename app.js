// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const API_URL = "YOUR_RENDER_API_URL";


// --------------------------------------------------
// HTML ELEMENT REFERENCES
// --------------------------------------------------

const form = document.getElementById("lookup-form");
const codeInput = document.getElementById("photo-code");
const submitButton = document.getElementById("submit-button");
const status = document.getElementById("status");

const photoResult = document.getElementById("photo-result");
const photo = document.getElementById("photo");
const downloadButton = document.getElementById("download-button");


// --------------------------------------------------
// FORM SUBMISSION
// --------------------------------------------------

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    // Read the visitor's input.
    const code = codeInput.value.trim();

    // Validate the 13-digit code.
    if (!/^\d{13}$/.test(code)) {
        status.textContent = "Please enter a valid 13-digit code.";
        return;
    }

    // Update interface while waiting for API.
    submitButton.disabled = true;
    status.textContent = "Searching for your photo...";
    photoResult.hidden = true;


    try {

        // --------------------------------------------------
        // SEND CODE TO RENDER BACKEND
        // --------------------------------------------------

        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                code: code
            })
        });


        if (!response.ok) {
            throw new Error("API request failed: " + response.status);
        }


        // --------------------------------------------------
        // READ JSON RESPONSE
        // --------------------------------------------------

        const data = await response.json();


        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("No entries were returned.");
        }


        // --------------------------------------------------
        // SELECT ONLY THE LAST ENTRY
        // --------------------------------------------------

        const lastEntry = data[data.length - 1];


        if (!lastEntry.image) {
            throw new Error("The last entry does not contain an image.");
        }


        // --------------------------------------------------
        // DISPLAY IMAGE
        // --------------------------------------------------

        let imageData = lastEntry.image;

        if (imageData.startsWith("data:")) {

            photo.src = imageData;

        } else {

            photo.src = "data:image/jpeg;base64," + imageData;

        }


        // --------------------------------------------------
        // DOWNLOAD IMAGE
        // --------------------------------------------------

        downloadButton.href = photo.src;

        downloadButton.download = "photo-" + lastEntry.id + ".jpg";


        // Show the image section.
        photoResult.hidden = false;

        status.textContent = "Your photo is ready.";


    } catch (error) {

        console.error(error);

        status.textContent =
            "Unable to retrieve your photo. Please try again.";

    } finally {

        // Re-enable submit button.
        submitButton.disabled = false;

    }

});