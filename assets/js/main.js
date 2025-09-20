document.addEventListener('DOMContentLoaded', () => {
fetch('http://localhost:3000/registeration')
    .then(response => {
      // Check if the request was successful (status code 200-299)
      if (!response.ok) {
        // If not, throw an error to be caught by the .catch() block
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Parse the JSON data from the response body
      return response.json();
    })
    .then(data => {
      // Log the retrieved data to the console
      console.log('Data from API:', data);
      // You can now use 'data' to update your webpage
    })
    .catch(error => {
      // Handle any errors that occurred during the fetch operation
      console.error('Fetch error:', error);
    });
});
