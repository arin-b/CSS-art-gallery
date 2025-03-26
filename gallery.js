// gallery.js - JavaScript for the gallery page
document.addEventListener('DOMContentLoaded', function() { //check if all content is loaded then execute code
    // DOM Elements
    const galleryContainer = document.getElementById('gallery-container');
    const artworkModal = document.getElementById('artwork-modal');
    artworkModal.style.display = 'none';
    const searchInput = document.getElementById('search-gallery');
    const categoryFilter = document.getElementById('filter-category');
    const sortFilter = document.getElementById('filter-sort');
    const userDisplay = document.getElementById('user-display');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const modalCloseBtn = document.querySelector('.btn-close-modal'); //querySelector used to select specific class
    
    // Pagination settings
    const itemsPerPage = 9; //allowing only 12 artwork to be displayed on one page
    let currentPage = 1; //by default we start from page 1 as current page
    
    // Check login status - function common across all .js files
    function checkLoginStatus() { //checks whether user is logged in
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            userDisplay.textContent = `Welcome, ${currentUser.username}!`;
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            
            // Enable like buttons for logged-in users because only logged-in users can liek things
            enableLikeButtons();
        } else {
            userDisplay.textContent = '';
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            
            // Disable like buttons for logged-out users
            disableLikeButtons();
        }
    }
    
    // Enable like buttons for logged-in users
    function enableLikeButtons() {
        const likeButton = document.getElementById('btn-like');
	// read all the like buttons on the page
        if (likeButton) {
            likeButton.disabled = false; //make button interactable
            likeButton.classList.remove('disabled'); //make button look interactive to user
        }
    }
    
    // Disable like buttons for logged-out users
    function disableLikeButtons() {
        const likeButton = document.getElementById('btn-like');
        if (likeButton) {
            likeButton.disabled = true; //disable interaction
            likeButton.classList.add('disabled'); //make button look disabled
            likeButton.title = 'Login to like artworks'; //inform users they need to be logged in to like artwork
        }
    }
    
    // Load submissions from localStorage
    function loadSubmissions() { // load image and style data from homepage
        return JSON.parse(localStorage.getItem('artSubmissions')) || []; //get all art submissions
    }
    
    // Filter and sort submissions
    function filterAndSortSubmissions(submissions) {
        const searchTerm = searchInput.value.toLowerCase(); //search filter option that was chosen
        const category = categoryFilter.value; //category selected by user
        const sortOrder = sortFilter.value; //if user wanted to sort 
        
        // Filter by search term and category
        let filtered = submissions.filter(submission => {
            const matchesSearch = submission.title.toLowerCase().includes(searchTerm) || 
                                 submission.description.toLowerCase().includes(searchTerm) ||
                                 submission.author.toLowerCase().includes(searchTerm) ||
                                 submission.tags.some(tag => tag.toLowerCase().includes(searchTerm));
	/*TEST CASE:
	 * Above statement reads user's input and looks for artwork submissions that match their terms in;
	 * title, description, author and tags. 
	 * following lines check whether any art matches category or name. 
	 * ONLY return matches and not something that is different*/
                                 
            const matchesCategory = category === 'all' || submission.category === category;
            
            return matchesSearch && matchesCategory;
        });
        
        // Sort submissions
        switch (sortOrder) {
	    //sort them
	    //TEST CASE: if user wants sorted by newest
            case 'newest':
                filtered.sort((a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted));
                break;
	    //TEST CASE: if user wants sorted by oldest
            case 'oldest':
                filtered.sort((a, b) => new Date(a.dateSubmitted) - new Date(b.dateSubmitted));
                break;
	    //TEST CASE: if user wants sorted by popularity
            case 'popular':
                filtered.sort((a, b) => b.likes - a.likes);
                break;
        }
        
        return filtered;  //return filtered and sorted information
    }
    
    // Render gallery items with pagination
    function renderGallery() { //function to render the content in the gallery
        const submissions = loadSubmissions();
        const filteredSubmissions = filterAndSortSubmissions(submissions); //read and filter submissions
        
        // Calculate pagination
        const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage); //calculate how many pages we need
        const startIndex = (currentPage - 1) * itemsPerPage; //calculate starting index for current page
        const endIndex = startIndex + itemsPerPage; // calculate ending index for current page
        const currentPageItems = filteredSubmissions.slice(startIndex, endIndex); //get items for that page
        
        // Clear existing content before replacing with new set
        galleryContainer.innerHTML = '';
        /*TEST CASE:
	 * Either there are no artwork available, or no artwork for particular filter
	 * Let user know that their filters cannot find any artwork*/
        if (currentPageItems.length === 0) {
            galleryContainer.innerHTML = '<div class="no-results">No artworks found. Try adjusting your filters.</div>';
            return;
        }
        
        // Create gallery items
	    // Go through current items and add them to the page
        currentPageItems.forEach(item => {
            const isCurrentUserAuthor = JSON.parse(localStorage.getItem('currentUser'))?.username === item.author;
            //check if the user is the creator of the artwork
            const galleryItem = document.createElement('div'); // create gallery item
            galleryItem.className = 'gallery-item'; // add the basic class
            galleryItem.setAttribute('data-category', item.category); // get the category
            galleryItem.setAttribute('data-id', item.id); // get the ID
            
            // now display the gallery item and its properties we go above
	    /*TEST CASE:
	     * in the code below, if the user is the creator of a particular artwork, make sure
	     * that they see the delete button to delete their art if they want.*/
            galleryItem.innerHTML = `
                <div class="artwork-display">
                    <div class="artwork-preview">
                        <div class="css-art-container" id="preview-${item.id}"></div>
                    </div>
                    <div class="artwork-hover">
                        <button class="btn-view">View</button>
                        ${isCurrentUserAuthor ? '<button class="btn-delete">Delete</button>' : ''}
                    </div>
                </div>
                <div class="artwork-info">
                    <h3>${item.title}</h3>
                    <p class="artwork-author">by ${item.author}</p>
                    <div class="artwork-meta">
                        <span class="category ${item.category}">${item.category}</span>
                        <span class="likes">${item.likes} likes</span>
                    </div>
                </div>
            `;
            
            galleryContainer.appendChild(galleryItem);
	    //after completing the element in the html section, commit it to the code so that it appears in the webpage
            
            // Render the CSS art preview in an iframe
            const previewContainer = galleryItem.querySelector(`#preview-${item.id}`);
            const iframe = document.createElement('iframe');
	    //create a new function to grab the preview from before
            iframe.style.width = '400';
            iframe.style.height = '400';
            iframe.style.border = 'none';
            previewContainer.appendChild(iframe); // add the new IFRAME
            
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
	    //This reads the data to insert into the iframe, and checks for compatibility to work with all versions of the web browser. 
            iframeDoc.open(); //prepare to insert the data
            iframeDoc.write(`
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        overflow: hidden;
                    }
                    ${item.cssCode}
                </style>
                ${item.htmlCode}
            `);
            iframeDoc.close(); //commit data to iframe and close it
            
            // Add event listener to view button - used when we click to view a specific image
            galleryItem.querySelector('.btn-view').addEventListener('click', () => {
                openArtworkModal(item); //open the artwork modal for this item
            });
            
            // Add event listener to delete button if current user is author
            if (isCurrentUserAuthor) {
		//only the user who created the artwork can delete it
                galleryItem.querySelector('.btn-delete').addEventListener('click', () => {
                    if (confirm('Are you sure you want to delete this artwork?')) {
                        deleteArtwork(item.id); //check if user really wants to delete the item
                    }
                });
            }
        });
        
        // Update pagination to reflect the new number of artwork
        updatePagination(totalPages);
    }
    
    // Update pagination controls
    function updatePagination(totalPages) {
	//update the number of pages
        const paginationContainer = document.querySelector('.gallery-pagination');
	//we will edit data within the container that holds the pages. so first clear the container
        paginationContainer.innerHTML = '';
        
	    /*TEST CASE:
	     * If there is only one page or no page at all then we don't have to render anything.*/
        if (totalPages <= 1) return;
        
        // Previous button
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
	    // create a functionality to check if there is a previous page
            prevButton.className = 'btn-prev'; // create new html button
            prevButton.innerHTML = '&larr; Prev'; //will hold the 'btn-rev' data for display
            prevButton.addEventListener('click', () => { //we want to do stuff when the button is clicked, so:
                currentPage--; //reduce page number by 1
                renderGallery(); //update gallery page
                window.scrollTo(0, 0); //scroll back to the top
            });
            paginationContainer.appendChild(prevButton); //commit the data to be displayed
	}
        // Page numbers
        const maxVisiblePages = 5; //no. of pages that can be displayed at one time
        let startPage = Math.max(1, currentPage - 2); //define starting page and ending page
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) { //if end page is less than  5
            startPage = Math.max(1, endPage - maxVisiblePages + 1); //set new starting page and display from there
        }
	
        
        // First page
	//Check if starting number is 1. if not, that means there are earlier pages
        if (startPage > 1) {
            const firstPageButton = document.createElement('button');
	    //if there are earlier buttons, we want to set a first page button that user can click
            firstPageButton.className = 'btn-page';
            firstPageButton.textContent = '1';
            firstPageButton.addEventListener('click', () => { //define what happens when user clicks
                currentPage = 1; //goes back to page 1
                renderGallery(); //gallery updates
                window.scrollTo(0, 0); //scroll to top
            });
            paginationContainer.appendChild(firstPageButton); //commit the data
            
		/*TEST CASE:
		 * If we start from page 3 or more, we don't want to dsplay page'2' and more*/
            if (startPage > 2) {
                const ellipsis = document.createElement('span'); //make a span element to add text (ellipsis = ...)
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...'; //indicates that we have skipped a page
                paginationContainer.appendChild(ellipsis); //commit the change
            }
        }
        
        // Page buttons
        for (let i = startPage; i <= endPage; i++) { //reads through start and end page and add buttons
            const pageButton = document.createElement('button'); //create buttons first
            pageButton.className = 'btn-page' + (i === currentPage ? ' active' : '');
            pageButton.textContent = i; //show number of the page
            pageButton.addEventListener('click', () => { //when user clicks what happens
                currentPage = i; //go to page
                renderGallery(); //update
                window.scrollTo(0, 0); //send to top
            });
            paginationContainer.appendChild(pageButton);
        }
        
        // Last page
        if (endPage < totalPages) { //after creating all pages, check if next button is needed
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);
            }
            
            const lastPageButton = document.createElement('button');
            lastPageButton.className = 'btn-page';
            lastPageButton.textContent = totalPages;
            lastPageButton.addEventListener('click', () => {
                currentPage = totalPages;
                renderGallery();
                window.scrollTo(0, 0);
            });
            paginationContainer.appendChild(lastPageButton);
        }
	
        // Next button
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.className = 'btn-next';
            nextButton.innerHTML = 'Next &rarr;';
            nextButton.addEventListener('click', () => {
                currentPage++;
                renderGallery();
                window.scrollTo(0, 0);
            });
            paginationContainer.appendChild(nextButton);
        }
    }
    
    // Open artwork modal
	// After they hover on a picture and click 'view' button, following code will render the picture
    function openArtworkModal(artwork) {
        // Set modal content
        document.getElementById('modal-title').textContent = artwork.title; //artwork name
        document.getElementById('modal-author').textContent = artwork.author; //creator
        document.getElementById('modal-description').textContent = artwork.description; //description
        document.getElementById('modal-category').textContent = artwork.category;
        document.getElementById('modal-date').textContent = new Date(artwork.dateSubmitted).toLocaleDateString();
        document.getElementById('modal-views').textContent = artwork.views || 0;
        document.getElementById('like-count').textContent = artwork.likes;
        document.getElementById('modal-html-code').textContent = artwork.htmlCode; //its html code
        document.getElementById('modal-css-code').textContent = artwork.cssCode; //its css code
        
        // Render the artwork in the modal
        const modalArtworkDisplay = document.getElementById('modal-artwork-display');
        modalArtworkDisplay.innerHTML = '';
        
        const iframe = document.createElement('iframe'); //create iframe to render preview
        iframe.style.width = '400px';
        iframe.style.height = '400px';
        iframe.style.border = 'none';
        modalArtworkDisplay.appendChild(iframe); //append it after creation
        
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }
                ${artwork.cssCode}
            </style>
            ${artwork.htmlCode}
        `);
        iframeDoc.close();
        
        // Update view count
        updateViewCount(artwork.id);
        
        // Show modal
        artworkModal.style.display = 'flex';
        
        // Set up like button state
        setupLikeButton(artwork.id);
    }
    
    // Update view count
    function updateViewCount(artworkId) {
        const submissions = loadSubmissions(); //get all data in storage
        const index = submissions.findIndex(s => s.id === artworkId); // check with ID for which image we are modifying
        /*TEST CASE:
	 * we need to check if an image with the specified ID even exists. 
	 * if not, then we will not render the image or make any changes.*/
        if (index !== -1) { 
            submissions[index].views = (submissions[index].views || 0) + 1; //if ID exists, increment view value
            localStorage.setItem('artSubmissions', JSON.stringify(submissions)); //commit change to storage
            document.getElementById('modal-views').textContent = submissions[index].views; //get view value text from page and change it
        }
    }
    
    // Set up like button state
    function setupLikeButton(artworkId) {
        const likeButton = document.getElementById('btn-like'); //get like button id
        const currentUser = JSON.parse(localStorage.getItem('currentUser')); //get the current user who is logged in
        /*TEST CASE:
	 * if user in not logged in, they should not be allowed to like a picture. 
	 * So f user is logged out, like button will not be seen and will be disabled.*/
        if (!currentUser) {
            likeButton.disabled = true;
            likeButton.classList.add('disabled');
            likeButton.title = 'Login to like artworks';
            return;
        }
        
        // Check if user has already liked this artwork
	/*TEST CASE:
	 * User cannot like an art more than once.
	 * so like button for a user can have max value of 1 per artwork.
	 * If user presses 'like' button twice, the art will be 'unliked' by them.*/
        const likedArtworks = JSON.parse(localStorage.getItem(`${currentUser.username}_likes`)) || [];
        //In order to determine whether user can like something, we need to read a list that contains items this user has already liked, and create a new list if it doesn't exist*/
        if (likedArtworks.includes(artworkId)) {
            likeButton.classList.add('liked');
        } else {
            likeButton.classList.remove('liked');
        }
        
        // Setup like button click event
        likeButton.onclick = function() { //in order to make any changes, we need to read for when the user clicks like button. then run following code for that particular artwork
            toggleLike(artworkId);
        };
    }
    
    // Toggle like status
    function toggleLike(artworkId) { //if like is clicked, we want like status to toggle
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return; //check to make sure a user is attempting to like it
        
        const likedArtworks = JSON.parse(localStorage.getItem(`${currentUser.username}_likes`)) || [];
        const likeButton = document.getElementById('btn-like');
        const likeCount = document.getElementById('like-count');
        const submissions = loadSubmissions();
        const index = submissions.findIndex(s => s.id === artworkId);
        
        if (index === -1) return;
        
        if (likedArtworks.includes(artworkId)) { //in this section, users are allowed to 'unlike' art
            // Unlike
            const likeIndex = likedArtworks.indexOf(artworkId); //get index of like
            likedArtworks.splice(likeIndex, 1); //remove the like
            submissions[index].likes--; //take away one like from the total
            likeButton.classList.remove('liked'); //take away liked class from the button for looks
        } else { //following code is if the user decides they want to like
            // Like
            likedArtworks.push(artworkId);
            submissions[index].likes++;
            likeButton.classList.add('liked');
        }
        
        // Update localStorage
        localStorage.setItem(`${currentUser.username}_likes`, JSON.stringify(likedArtworks));
        localStorage.setItem('artSubmissions', JSON.stringify(submissions));
        
        // Update like count display
        likeCount.textContent = submissions[index].likes;
        
        // Update the gallery display if the artwork is visible
        const galleryItem = document.querySelector(`.gallery-item[data-id="${artworkId}"]`);
        if (galleryItem) {
            galleryItem.querySelector('.likes').textContent = `${submissions[index].likes} likes`;
        }
    }
    
    // Delete artwork
    function deleteArtwork(artworkId) {
        const submissions = loadSubmissions(); //get image info
        const index = submissions.findIndex(s => s.id === artworkId); //find specific image
        
        if (index !== -1) { //check if image exists. if not, stop the function
            // Remove the artwork from submissions
            submissions.splice(index, 1);
            localStorage.setItem('artSubmissions', JSON.stringify(submissions)); //if image exists, go to its index and read 1 by 1 and make sure it has gone from local storage
            
            // Remove from users' liked artworks
            const users = JSON.parse(localStorage.getItem('users')) || [];
            users.forEach(user => { //for each user, go to pivture liked in local storage, grab index and remove
                const likedArtworks = JSON.parse(localStorage.getItem(`${user.username}_likes`)) || [];
                const likeIndex = likedArtworks.indexOf(artworkId);
                if (likeIndex !== -1) {
                    likedArtworks.splice(likeIndex, 1);
                    localStorage.setItem(`${user.username}_likes`, JSON.stringify(likedArtworks));
                }
            });
            
            // Close modal if open
            if (artworkModal.style.display === 'flex') {
                closeModal();
            }
            
            // Re-render gallery
            renderGallery();
        }
    }
    
    // Close artwork modal
    function closeModal() {
        artworkModal.style.display = 'none';
    }
    
    // Initialize event listeners
    function initEventListeners() {
        // Modal close button
        modalCloseBtn.addEventListener('click', closeModal);
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === artworkModal) {
                closeModal();
            }
        });
        
        // Filter and search event listeners
        searchInput.addEventListener('input', function() { //after closing, we can read data ad filters
            currentPage = 1; //before filtering, go pack to first page
            renderGallery(); // update to render the data and display it
        });
        
        categoryFilter.addEventListener('change', function() { //check for changes within the category
            currentPage = 1; //start with first page
            renderGallery(); //update all
        });
        
        sortFilter.addEventListener('change', function() { //should also work when the filters are sorted
            currentPage = 1;
            renderGallery();
        });
        
        // Login/logout buttons
        loginBtn.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
        
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            checkLoginStatus();
            window.location.reload();
        });
        
        // Code copy buttons
        document.getElementById('copy-html').addEventListener('click', function() {
            copyToClipboard(document.getElementById('modal-html-code').textContent);
            this.textContent = 'Copied!';
            setTimeout(() => {
                this.textContent = 'Copy HTML';
            }, 2000);
        });
        
        document.getElementById('copy-css').addEventListener('click', function() {
            copyToClipboard(document.getElementById('modal-css-code').textContent);
            this.textContent = 'Copied!';
            setTimeout(() => {
                this.textContent = 'Copy CSS';
            }, 2000);
        });
    }
    
    // Copy text to clipboard
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
    
    // Initialize gallery
    function initGallery() {
        checkLoginStatus();
        renderGallery();
        initEventListeners();
    }
    
    // Start the gallery
    initGallery();
});
