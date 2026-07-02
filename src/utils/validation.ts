export function validateForm(formId: string): boolean {
  const form = document.getElementById(formId) as HTMLFormElement;
  if (!form) return true;

  let isValid = true;
  let firstInvalidField: HTMLElement | null = null;

  // Find all required inputs, selects, and textareas within the form
  const requiredFields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[required], [data-required="true"]');

  requiredFields.forEach(field => {
    // Clear previous errors
    field.classList.remove('field-error', 'field-valid');
    const existingMsg = field.parentElement?.querySelector('.field-error-msg');
    if (existingMsg) {
      existingMsg.remove();
    }

    // Check if field has a value
    let hasValue = false;
    if (field.type === 'checkbox' || field.type === 'radio') {
       hasValue = (field as HTMLInputElement).checked;
    } else {
       hasValue = field.value.trim() !== '';
    }

    if (!hasValue) {
      isValid = false;
      field.classList.add('field-error');
      
      // Add error message
      const errorMsg = document.createElement('span');
      errorMsg.className = 'field-error-msg';
      errorMsg.textContent = 'This field is required';
      
      // Try to insert after the field or its container
      if (field.parentElement) {
        field.parentElement.appendChild(errorMsg);
      }

      if (!firstInvalidField) {
        firstInvalidField = field;
      }

      // Add listener to remove error on input
      const removeError = () => {
        field.classList.remove('field-error');
        field.classList.add('field-valid');
        const msg = field.parentElement?.querySelector('.field-error-msg');
        if (msg) msg.remove();
        field.removeEventListener('input', removeError);
        field.removeEventListener('change', removeError);
      };
      
      field.addEventListener('input', removeError);
      field.addEventListener('change', removeError);
    } else {
      field.classList.add('field-valid');
    }
  });

  if (!isValid && firstInvalidField) {
    // Scroll to the first invalid field
    (firstInvalidField as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return isValid;
}
