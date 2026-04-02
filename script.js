const navToggle = document.querySelector(".nav-toggle");
const navPanel = document.querySelector(".nav-panel");
const navLinks = document.querySelectorAll(".nav-links a");
const body = document.body;

const setMenuState = (isOpen) => {
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navPanel.classList.toggle("is-open", isOpen);
  body.classList.toggle("menu-open", isOpen);
};

navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  setMenuState(!isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

document.addEventListener("click", (event) => {
  const clickedInsideMenu =
    navPanel.contains(event.target) || navToggle.contains(event.target);

  if (!clickedInsideMenu) {
    setMenuState(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);
  }
});

const form = document.getElementById("contactForm");
const successMessage = document.getElementById("formSuccess");
const statusMessage = document.getElementById("formStatus");
const submitButton = form.querySelector(".submit-button");
const formEndpoint = "https://formsubmit.co/ajax/ilia.dagargulia@gmail.com";

const fields = {
  name: {
    input: document.getElementById("name"),
    validate(value) {
      if (value.trim().length < 2) {
        return "Please enter at least 2 characters.";
      }

      return "";
    }
  },
  email: {
    input: document.getElementById("email"),
    validate(value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(value.trim())) {
        return "Please enter a valid email address.";
      }

      return "";
    }
  },
  message: {
    input: document.getElementById("message"),
    validate(value) {
      if (value.trim().length < 10) {
        return "Please enter at least 10 characters.";
      }

      return "";
    }
  }
};

const showError = (input, message) => {
  const formGroup = input.closest(".form-group");
  const errorField = formGroup.querySelector(".error-message");

  formGroup.classList.add("error");
  errorField.textContent = message;
  input.setAttribute("aria-invalid", "true");
};

const clearError = (input) => {
  const formGroup = input.closest(".form-group");
  const errorField = formGroup.querySelector(".error-message");

  formGroup.classList.remove("error");
  errorField.textContent = "";
  input.setAttribute("aria-invalid", "false");
};

const validateField = (field) => {
  const value = field.input.value;
  const errorMessage = field.validate(value);

  if (errorMessage) {
    showError(field.input, errorMessage);
    return false;
  }

  clearError(field.input);
  return true;
};

Object.values(fields).forEach((field) => {
  field.input.addEventListener("input", () => {
    validateField(field);
    successMessage.textContent = "";
    statusMessage.textContent = "";
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  successMessage.textContent = "";
  statusMessage.textContent = "";

  const validationResults = Object.values(fields).map((field) =>
    validateField(field)
  );

  const isFormValid = validationResults.every(Boolean);

  if (!isFormValid) {
    const firstInvalidField = Object.values(fields).find(
      (field) => field.input.getAttribute("aria-invalid") === "true"
    );

    if (firstInvalidField) {
      firstInvalidField.input.focus();
    }

    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  statusMessage.textContent = "Sending your message...";

  try {
    const response = await fetch(formEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      body: new FormData(form)
    });

    const result = await response.json();

    if (!response.ok || (result.success !== true && result.success !== "true")) {
      throw new Error("Unable to send message.");
    }

    statusMessage.textContent = "";
    successMessage.textContent =
      "Message sent successfully. I will get back to you soon.";
    form.reset();
    Object.values(fields).forEach((field) => clearError(field.input));
  } catch (error) {
    statusMessage.textContent =
      "The message could not be sent right now. Please try again in a moment.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send Message";
  }
});
