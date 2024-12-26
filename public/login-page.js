let currentUser = "";

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("login-btn");
  btn.onclick = async (e) => {
    e.preventDefault(); // Prevent the default form submit action

    const username = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    // For testing
    // const username = "siw92@pitt.edu";
    // const password = "0000";

    // Send the new data to the server
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      

    const result = await response.json();

    if (response.ok) {
      console.log("Data added:", result);
      currentUser = result.user;
      if(currentUser){
        document.getElementById("sign-out-btn").style.display = "block";
        document.getElementById("sign-in-btn").style.display = "none";
      }else{
        document.getElementById("sign-out-btn").style.display = "none";
        document.getElementById("sign-in-btn").style.display = "block";
      }
      console.log(currentUser);
      // If login successful, then redirect to dashboard.
      window.location.replace("/pitterest-dashboard");
    } else if (response.status === 400) {
      // If the email already exists, alert the user
      console.log("NOOOOOOOOOOO");
      alert("Incorrect Password");
    } else {
      console.error("Error adding data:", result);
    }
  };
});

