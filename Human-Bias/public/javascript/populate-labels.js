async function fetchLabels() {
    try {
      
      const baseURL = window.location.origin;
      const response = await fetch(`${baseURL}/fetch-labels`);
      const labels = await response.json();
      return labels;
    } catch (error) {
      console.error('Error fetching labels:', error);
      return [];
    }
  }
  
async function populateDropdown() {
    const dropdown = document.getElementById('traitDropdown');
    const labels = await fetchLabels();

    labels.forEach(label => {
        const option = document.createElement('option');
        option.value = label.toLowerCase();
        option.text = label;
        dropdown.add(option);
    });
}

function updateHeader() {
    const dropdown = document.getElementById('traitDropdown');
    const selectedTrait = dropdown.options[dropdown.selectedIndex].text;
    document.getElementById('selectedTrait').innerText = "Selected Trait: " + selectedTrait;
}

populateDropdown();