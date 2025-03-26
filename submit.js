// submit.js for CSS Art Gallery
document.addEventListener('DOMContentLoaded', function() { // see login.js for explanation abt this event listener
    // DOM Elements
    const loginRequiredMessage = document.getElementById('login-required');
    const submissionForm = document.getElementById('submission-form');
    const previewButton = document.getElementById('preview-button');
    const previewFrame = document.getElementById('preview-frame');
    const submissionMessage = document.getElementById('submission-message');
    const userDisplay = document.getElementById('user-display');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Check if user is logged in
    function checkLoginStatus() {  // this is the same function we used in login.js. Refer login.js for explanation
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            userDisplay.textContent = `Welcome, ${currentUser.username}!`;
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            
            // Show submission form and hide login required message
            loginRequiredMessage.style.display = 'none';
            submissionForm.style.display = 'block';
        } else {
            userDisplay.textContent = '';
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            
            // if user is not logged in, hide submission form and show login required message
            loginRequiredMessage.style.display = 'flex'; //use CSS flexbox to occupy entire space of window
            submissionForm.style.display = 'none'; // hide form
        }
    }

    // Initialize submissions in localStorage if it doesn't exist
    // Check if localstorage has any data under key 'artSubmissions'
    // If not, initialize this list
    if (!localStorage.getItem('artSubmissions')) {
        localStorage.setItem('artSubmissions', JSON.stringify([]));
    }

    // Handle the preview button click
    // Preview buttn lets us preview html and css are we have entered
    previewButton.addEventListener('click', function() {
        const htmlCode = document.getElementById('html-code').value;
        const cssCode = document.getElementById('css-code').value;
        
	/*TEST CASE:
	 * User must submit HTML and CSS code both.
	 * If either or both not submitted, raise alert and end function execution*/
        if (!htmlCode || !cssCode) {
            alert('Please enter both HTML and CSS code to preview.');
            return;
        }
        
        // Create preview
	// Use template literals to create preview content
        const previewContent = ` 
            <style>
                ${cssCode} 
            </style>
            ${htmlCode}
        `;
        
        // Clear previous preview
	/*TEST CASE:
	 * Make sure any previous preview or HTML CSS code is not present
	 * avoid clash while rendering current HTML or CSS code*/
        previewFrame.innerHTML = ''; //Remove any previous code from screen. see submit.html for element
        
        // Create a sandbox iframe for the preview
        const iframe = document.createElement('iframe'); //create new iframe element
	// create a new iframe to hold the image
	//iframes are used to embed multimedia, maps, widget and render html/css within an existing webpage
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        previewFrame.appendChild(iframe); //display it on the screen
        
        // Write the preview content to the iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
	/*For above line:
	 * iframe.contentDocument: if iframe and its parent doc are same-origin, returns Document
	 * iframe.contentWindow.document: if same-origin, parent can access iframe's doc and internal DOM*/
        iframeDoc.open();
        iframeDoc.write(previewContent);
        iframeDoc.close();
	// write and close the image data to the iframe for display
    });

    // Handle form submission
    submissionForm.addEventListener('submit', function(e) {
        e.preventDefault(); //prevent page refresh after form submission
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) { //test case for user not logged in already defined in login.js
            alert('You must be logged in to submit artwork.');
            return;
        }
        
        // Get form values
        const title = document.getElementById('art-title').value;
        const description = document.getElementById('art-description').value;
        const category = document.getElementById('art-category').value;
        const tags = document.getElementById('art-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const htmlCode = document.getElementById('html-code').value;
        const cssCode = document.getElementById('css-code').value;
        
        // Create submission object
        const submission = { // we make an object to store the data
            id: Date.now().toString(), //set timestamp to uniquely identify artwork
            title: title,
            description: description,
            category: category,
            tags: tags,
            htmlCode: htmlCode,
            cssCode: cssCode,
            author: currentUser.username,
            dateSubmitted: new Date().toISOString(),
            likes: 0,
        };
        
        // Save submission to localStorage
        const submissions = JSON.parse(localStorage.getItem('artSubmissions'));
        submissions.push(submission);
        localStorage.setItem('artSubmissions', JSON.stringify(submissions));
	/*We want to add the data, so we read the 'artSubmissions' in jSON format, then add or push 
	 * this submission into the list, then commit to local storage.*/
        
        // Success message
        submissionMessage.textContent = 'Your artwork has been submitted successfully!';
        submissionMessage.style.color = 'green';
        
        // Reset form
        submissionForm.reset();
        previewFrame.innerHTML = '<p class="preview-placeholder">Preview will appear here</p>';
	// clear all text data and reset the preview panel
        
        // Redirect to gallery page after a delay
        setTimeout(() => {
            window.location.href = 'gallery.html';
        }, 200);
    });

    // Handle code editor expand buttons
    const expandButtons = document.querySelectorAll('.btn-expand');
    expandButtons.forEach(button => {
        button.addEventListener('click', function() {
		// code editor expand button
            const editorContainer = this.closest('.code-editor-container'); // returns node that matches query selector
            const editor = editorContainer.querySelector('.code-editor'); //we read which button was clicked to know which editor to change
            
            if (editor.classList.contains('expanded')) {
		//if list was already expanded
                editor.classList.remove('expanded');
                editor.style.height = editor.getAttribute('data-original-height'); //then unexpand it
                this.textContent = 'Expand'; //change button text back to 'expand'
            } else {
                editor.classList.add('expanded'); // but if it not expanded
                editor.setAttribute('data-original-height', editor.style.height); // expand it
                editor.style.height = '400px';
                this.textContent = 'Collapse';
            }
        });
    });

    // Logout functionality
    logoutBtn.addEventListener('click', function() {
	    // checking if user is trying to logout again
        localStorage.removeItem('currentUser'); // remove currentUser from local storage
        checkLoginStatus(); //run this function to ensure all changes happen
        // Redirect to homepage after logout
        window.location.href = 'index.html';
    });

    // Initialize login status check
    checkLoginStatus();
    /*TEST CASE:
     * When this function runs, we first want to check whether user is logged in, then make the appropriate changes to the webpage.*/
});
