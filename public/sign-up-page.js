let currentUser = "";

document.addEventListener("DOMContentLoaded", () => {

  fetch("/get-session")
    .then((response) => response.json())
    .then((data) => {
      currentUser = data.user;
      if (currentUser) {
        document.getElementById("sign-out-btn").style.display = "block";
        document.getElementById("sign-in-btn").style.display = "none";
      } else {
        document.getElementById("sign-out-btn").style.display = "none";
        document.getElementById("sign-in-btn").style.display = "block";
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
  
  function handleAddSubmit(e) {
    //console.log("Add button clicked");
    e.preventDefault(); // Prevent the default form submit action
    
      const f_name = document.getElementById("firstname").value;
  const l_name = document.getElementById("lastname").value;
  const email = document.getElementById("email").value;
  const passwords = document.getElementById("password").value;
  const re_passwords = document.getElementById("re-password").value;
    fetch("/create-account", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: email,
            password: passwords,
            email: email,
            name: f_name,
            last_name: l_name,
        }),
    })
        .then(response => {
            // Check if the response is not okay
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || `HTTP error! status: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(result => {
            // Clear the form fields after the submission attempt
            document.getElementById("firstname").value = '';
            document.getElementById("lastname").value = '';
            document.getElementById("email").value = '';
            document.getElementById("password").value = '';
            document.getElementById("re-password").value = '';

            // Refresh page
            window.location.reload();
        })
        .catch(error => {
            // Handle errors with a more descriptive message
            console.error("Error occurred:", error);
            alert(error.message || "Error occurred while adding data.");
        });
}
  
  document.getElementById('sign-up-btn').addEventListener('click', handleAddSubmit);
});