document.addEventListener('DOMContentLoaded', () => {
    const entryPoint = "/retrieve-data/";
    const pageId = document.body.id;

    const container = document.getElementById('data-container');
    const row = document.createElement('div');
    row.className = 'row';
    row.id = 'pin-container';
    
    switch (pageId) {
        //for main page loading
        case 'main':
            fetch(`${entryPoint}${pageId}`)
                .then(response => response.json())
                .then(data => {
                    createPostArea(data, row, "main");
                    container.appendChild(row);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
          fetch('/get-session')
        .then(response => response.json())
        .then(session => {
            const signOutBtn = document.getElementById('landing-sign-out-btn');
            const signInBtn = document.getElementById('landing-sign-in-btn');
            const helloMessage = document.getElementById('hello-message');
            const landingDashBtn = document.getElementById('landing-dash-btn');
            const landingRecoBtn = document.getElementById('landing-reco-btn');
            
            if (session.user) {
                signOutBtn.style.display = 'block'; // Display sign-out button
                signInBtn.style.display = 'none';   // Hide sign-in button
                helloMessage.innerHTML = "Welcome, "+session.name;
              landingDashBtn.style.display = 'block';
              landingRecoBtn.style.display = 'block';
             
            } else {
                signOutBtn.style.display = 'none';  // Hide sign-out button
                signInBtn.style.display = 'block';  // Display sign-in button
                landingDashBtn.style.display = 'none';
                landingRecoBtn.style.display = 'none';
            }
        })
        .catch(error => console.error('Error fetching session data:', error));
            break;
        
        //for dashboard loading
        case 'dash':
            fetch(`${entryPoint}${pageId}`)
                .then(response => response.json())
                .then(data => {
                    createPostArea(data, row, "dash");
                    container.appendChild(row);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
            break;
    }
});

//create Post area for different pages
function createPostArea(data, row, page) {
    //console.log("data", data);
    data.forEach(doc => {
        const col = document.createElement('div');
        col.className = 'col'; //col-3 col-md-4 col-lg-3 pin

        // Create the anchor tag to wrap the entire card
        let cardWrapper;
        if (page === 'dash') {
            cardWrapper = document.createElement('a');
            cardWrapper.href = `/post-update.html?postid=${doc._id}`; // Link to the edit page
            cardWrapper.classList.add('card-link');
        } else {
            cardWrapper = document.createElement('div');
        }
        cardWrapper.className = 'data-item';
        cardWrapper.setAttribute('data-id', doc._id); // Setting the _id as data attribute

        const title = document.createElement('h5');
        title.textContent = doc.title;
        cardWrapper.appendChild(title);

        const description = document.createElement('p');
        description.textContent = `${doc.description}`;
        cardWrapper.appendChild(description);

        const location = document.createElement('p');
        location.textContent = `Location: ${doc.location}`;
        cardWrapper.appendChild(location);

        const category = document.createElement('p');
        category.textContent = `Category: ${doc.category}`;
        cardWrapper.appendChild(category);

        const link = document.createElement('a');
        link.href = doc.link;
        link.textContent = doc.link;
        link.target = '_blank';
        const linkParagraph = document.createElement('p');
        linkParagraph.textContent = 'Link: ';
        linkParagraph.appendChild(link);
        cardWrapper.appendChild(linkParagraph);

        // If the card is a link, append the cardWrapper to the column. Otherwise, wrap the card contents.
        if (page === 'dash') {
            col.appendChild(cardWrapper);
        } else {
            const card = document.createElement('div');
            card.className = 'pin-body';
            card.appendChild(cardWrapper);
            col.appendChild(cardWrapper);
        }

        row.appendChild(col);
    });
    return row;
}

const logout = async () => {
  try {
    const response = await fetch('/logout', {
      method: 'POST', // Specify the method
      headers: {
        'Content-Type': 'application/json' // Set the headers appropriately, if needed
      }
    });

    const data = await response.json(); // Decode the JSON response
    if (response.ok) {
      //console.log('Logout successful:', data.message); // Log the success message
      //window.location.href = '/login'; // Redirect to the login page
      
    } else {
      throw new Error('Failed to logout.'); // Handle errors if response is not OK
    }
  } catch (error) {
    console.error('Error:', error); // Log errors
  }
}

// You can call logout when needed, for example, by attaching it to a button click

document.querySelector('.sign-out-btn').addEventListener('click', logout);

