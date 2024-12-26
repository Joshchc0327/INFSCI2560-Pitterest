let currentUser = "";
document.addEventListener('DOMContentLoaded', () => {
    fetch('/get-session')
        .then(response => response.json())
        .then(session => {
            const signOutBtn = document.getElementById('sign-out-btn');
            const signInBtn = document.getElementById('sign-in-btn');
            const helloMessage = document.getElementById('hello-message');
            if (session.user) {
                helloMessage.innerHTML = "Welcome, "+session.name;
                currentUser=session;
                console.log("YYYYY"+session.user);
            } else {
                signOutBtn.style.display = 'none';  // Hide sign-out button
                signInBtn.style.display = 'block';  // Display sign-in button
            }
        })
        .catch(error => console.error('Error fetching session data:', error));
  
    const params = new URLSearchParams(window.location.search);
    const postid = params.get('postid');
    const contentElement = document.getElementById('content');
  
    const addButton = document.getElementById('addpostBtn');
    const updateButton = document.getElementById('updatepostBtn');
    const deleteButton = document.getElementById('deletepostBtn');

    if (postid) {
        //console.log("postid: " + postid);
        // Edit mode: Fetch and display existing data for editing
        const addPostLink = document.getElementById('addBtn');
        addPostLink.remove();
      
        fetch(`/get-post-data/${postid}`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch');
                return response.json();
            })
            .then(post => {
                //console.log("(post.js)post: ", post);
                document.getElementById('postid').value = post._id;
                document.getElementById('title').value = post.title;
                document.getElementById('description').value = post.description;
                document.getElementById('location').value = post.location;
                document.getElementById('link').value = post.link;
                document.getElementById('category').value = post.category;
                document.getElementById('userid').value = post.userid;
            })
            .catch(error => console.error('Error:', error));

        if (updateButton) {
            updateButton.addEventListener('click', handleUpdateSubmit);
        }

        if (deleteButton) {
            deleteButton.addEventListener('click', handleDeleteSubmit);
        }
    } else {
        //console.log("No ID");
        const addPostLink = document.getElementById('addBtn');
        addPostLink.remove();
        if (addButton) {
            addButton.addEventListener('click', handleAddSubmit);
        }
    }
  
  document.getElementById('post-create-form').addEventListener('submit', handleFormSubmit);
});

function handleAddSubmit(e) {
    //console.log("Add button clicked");
    e.preventDefault(); // Prevent the default form submit action

    const useridValue = currentUser.user;
    const titleValue = document.getElementById("title").value;
    const desValue = document.getElementById("description").value;
    const locValue = document.getElementById("location").value;
    const linkValue = document.getElementById("link").value;
    const categoryValue = document.getElementById("category").value;
    if(!checkRequiredFields()){
      return;
    }
    
    fetch("/post-create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: titleValue,
            description: desValue,
            location: locValue,
            link: linkValue,
            category: categoryValue,
            userid: useridValue
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
            document.getElementById("title").value = '';
            document.getElementById("description").value = '';
            document.getElementById("location").value = '';
            document.getElementById("link").value = '';
            document.getElementById("category").value = '';

            // Refresh page
            //window.location.reload();
            window.location.href = "/pitterest-dashboard.html";
        })
        .catch(error => {
            // Handle errors with a more descriptive message
            console.error("Error occurred:", error);
            alert(error.message || "Error occurred while adding data.");
        });
}

function handleUpdateSubmit(e) {
    //console.log('Updating post');
    e.preventDefault(); // Prevent the default form submit action

    // Check required fields (you might want to reuse checkRequiredFields function here)
    if (!checkRequiredFields()) {
        return;
    }

    // Get form data
    const postId = document.getElementById("postid").value;
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const location = document.getElementById("location").value;
    const link = document.getElementById("link").value;
    const category = document.getElementById("category").value;
    const userId = document.getElementById("userid").value;

    // Prepare data object
    const data = {
        title: title,
        description: description,
        location: location,
        link: link,
        category: category,
        userid: userId,
    };

    // Send PUT request to update post data
    fetch(`/update-data/${postId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        //console.log("Post updated successfully:", result);
        alert("Post updated successfully!");
        // Optionally, redirect to the dashboard or another page
        window.location.href = "/pitterest-dashboard.html";
    })
    .catch(error => {
        console.error("Error updating post:", error);
        alert("Error occurred while updating the post.");
    });
}


function handleDeleteSubmit(e) {
    //console.log('Deleting post');
    e.preventDefault(); // Prevent the default form submit action

    const postidValue = document.getElementById('postid').value;
    fetch(`/delete-post/${postidValue}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            //console.log("Post deleted:", result);
            // Redirect to the dashboard page
            window.location.href = "/pitterest-dashboard.html";
        })
        .catch(error => {
            // Handle errors
            console.error("Error deleting data:", error);
            alert("Error occurred while deleting data.");
        });
}   

function handleFormSubmit(e) {
  e.preventDefault();
  
  const linkInput = document.getElementById('link');
  const linkValue = linkInput.value;
  
  if (!isValidHttpUrl(linkValue)) {
    alert('Please enter a valid URL for the link.');
    return; // Stop the form from submitting
  }
}

document.getElementById('link').addEventListener('input', function (e) {
  const inputLink = e.target.value;
  if (inputLink && !isValidHttpUrl(inputLink)) {
    e.target.setCustomValidity('Please enter a valid URL.');
    e.target.reportValidity();
  } else {
    e.target.setCustomValidity('');
  }
});

function isValidHttpUrl(string) {
  let url;
  
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

//check if fields validated
function checkRequiredFields(){
  const useridValue = currentUser.user;
  const titleValue = document.getElementById("title").value;
  const desValue = document.getElementById("description").value;
  const locValue = document.getElementById("location").value;
  const linkValue = document.getElementById("link").value;
  const categoryValue = document.getElementById("category").value;

  // Validate title (required field)
  if (!titleValue) {
    alert('Please enter a title.');
    return false;
  }

  // Validate description (required field)
  if (!desValue) {
    alert('Please enter a description.');
    return false;
  }

  // Validate location (required field)
  if (!locValue) {
    alert('Please enter a location.');
    return false;
  }

  // Validate link (optional field, but must be a valid URL if provided)
  if (linkValue && !isValidHttpUrl(linkValue)) {
    alert('Please enter a valid URL for the link.');
    return false;
  }

  // Validate category (required to select an option other than the default)
  if (categoryValue === "Choose a category") {
    alert('Please choose a category.');
    return false;
  }
  
  return true; 
}