// login.js for CSS Art Gallery
document.addEventListener('DOMContentLoaded', function() {
     /*This event listener tells the browser to wait until the HTMl is fully loaded.
      * This is done to prevent us from trying to access elements before they are loaded
      * 'DOMContentLoaded is the event name, and we are using an anonymous function to load all elements.*/
    // DOM Elements
    const loginForm = document.getElementById('login-form'); //access login form
    const registerForm = document.getElementById('register-form'); //access registration form
    const loginToggle = document.getElementById('login-toggle'); // access toggle button to switch to login form
    const registerToggle = document.getElementById('register-toggle'); //access button to toggle to register form
    const loginMessage = document.getElementById('login-message'); //message displayed after login attempt
    const registerMessage = document.getElementById('register-message'); //message displayed after register attempt
    const userDisplay = document.getElementById('user-display'); //display user logged in status
    const loginBtn = document.getElementById('login-btn'); //go to the login page
    const logoutBtn = document.getElementById('logout-btn'); //logout button

    // Toggle between login and register forms
    loginToggle.addEventListener('click', function() { // listen for 'click' event on login-toggle button
        loginForm.style.display = 'block'; // make login form visible
        registerForm.style.display = 'none'; // hide register form
        loginToggle.classList.add('active'); // enable CSS written for .active class for login form
        registerToggle.classList.remove('active'); // disable .active CSS for register form
	/*TEST CASE:
	 * When login form is active, disable CSS for register form to prevent clash and hide registration form.
	 * Similar operation is performed below to disable CSS for login, if user wants to register.*/
    });

    registerToggle.addEventListener('click', function() { // when user clicks 'register' button
        loginForm.style.display = 'none'; // hide login form
        registerForm.style.display = 'block'; //make registration form visible
        registerToggle.classList.add('active'); // enable CSS for register form
        loginToggle.classList.remove('active'); // disable CSS for login form
    });

    // Initialize dummy users if they don't exist
    /*localstorage is a way to store data in browser's local storage that remains even after browser is closed.
     * Data is stored in key-value pairs similar to JSON.
     * localStorage returns storage object that points to current origin's local storage space.
     * This function checks if some users are already registered in browser's local storage.*/
    if (!localStorage.getItem('users')) { //getItem() retrieves value associated with specified key
	/*TEST CASE:
	 * for testing purposes, if no user exists,
	 * create dummy user for BLACK BOX TESTING purposes.*/
        const initialUsers = [
            {
                username: 'demo',
                email: 'demo@example.com',
                password: 'Demo123!'
            }
        ];
        localStorage.setItem('users', JSON.stringify(initialUsers)); 
	/*TEST CASE:
	 * JSON.stringify() converts js object or array into JSON string
	 * necessary because localstorage can only store strings*/
    }

    // Check if user is logged in
    function checkLoginStatus() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
	// above line retrieves 'currentUser' json string and parses it into js object
        if (currentUser) { //if(currentUser)==true, it means user is logged in
            userDisplay.textContent = `Welcome, ${currentUser.username}!`; //display name of logged-in user
            loginBtn.style.display = 'none'; // hide login button
            logoutBtn.style.display = 'inline-block'; // make logout button visible
        } else { // if user is not logged in
            userDisplay.textContent = '';
            // Only hide login button if we're on the login page
            if (!window.location.href.includes('login.html')) { //hide login btn only if user is on login page
                loginBtn.style.display = 'inline-block'; // else make login button visible
            }
            logoutBtn.style.display = 'none'; // hide logout button
        }
    }

    // Login form submission
    loginForm.addEventListener('submit', function(e) {
	/*TEST CASE:
	 * By default when form is submitted, page reloads. We do not want this.
	 * "e" is event object. e.preventDefault() makes sure page is not refreshed after submission.*/
        e.preventDefault();
        
        const username = document.getElementById('login-username').value; // obtain form input values
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember').checked; //see if user wants to be remembered
        
        const users = JSON.parse(localStorage.getItem('users')); // read 'users' data from localStorage
        const user = users.find(u => u.username === username && u.password === password);
	/*above code searched array of users for user that has the specified username and password.
	 * find() is method of array object that satisfied the provided 'testing function'*/
        /*TEST CASE:
	 * check if user with specified username and password was found.
	 * if yes, then log in. If not found, display required error message.*/
        if (user) {
            // Set session
	    /*set 'currentUser' in localstorage to object that contains username, email and remember me state.
	     * This acts like session data, by setting local storage it says user s logged in*/
            localStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                email: user.email,
                rememberMe: rememberMe
            }));
            
            loginMessage.textContent = 'Login successful! Redirecting...'; //display login message if successful
            loginMessage.style.color = 'green';
            
            // Redirect to homepage after successful login
            setTimeout(() => { //sets timer that will execute code inside parentheses after 1500 milliseconds
                window.location.href = 'index.html'; //shift window to index.html
            }, 1500);
        } else { //if login is unsuccessful
            loginMessage.textContent = 'Invalid username or password';
            loginMessage.style.color = 'red';
        }
    }); // login form submission ends

    // Register form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault(); //like login form, prevent page refresh after submission
        
        const username = document.getElementById('register-username').value; //get all form input values
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        const termsAccepted = document.getElementById('terms').checked;
        
        // Validation
	/*TEST CASE:
	 * Check if the password and confirm password entered by user are identical or not. Shoudl be same.*/
        if (password !== confirmPassword) {
            registerMessage.textContent = 'Passwords do not match';
            registerMessage.style.color = 'red';
            return; //end operation if passwords do not match
        }
        
        // Password strength validation
	/*TEST CASE:
	 * Make sure that: passwd has at least 8 char, including 1 number and 1 special character
	 * We are using the 'regular expression' or 'Regex' feature of javascript*/
        const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(password)) { //test() is method of regexp obj that checks if str matches regex
            registerMessage.textContent = 'Password must be at least 8 characters with a number and special character';
            registerMessage.style.color = 'red';
            return;
        }
        
        // Check if username already exists
	/*TEST CASE:
	 * Username should be unique.
	 * if username entered already exists, terminate function and don't allow registration*/
        const users = JSON.parse(localStorage.getItem('users'));
        if (users.some(u => u.username === username)) { //some() is methd of array obj. tests if at least 1 elementsatisfies the provided testing function
            registerMessage.textContent = 'Username already exists';
            registerMessage.style.color = 'red';
            return;
        }
        
        // if everything is valid, add new user object to array of users
        users.push({
            username: username,
            email: email,
            password: password
        });
        
        localStorage.setItem('users', JSON.stringify(users)); // assign new user data to local storage
        
        registerMessage.textContent = 'Registration successful! You can now login.';
        registerMessage.style.color = 'green';
        
        // Switch to login form after successful registration
        setTimeout(() => {
            loginToggle.click();
        }, 1500);
    });

    // Logout functionality
    logoutBtn.addEventListener('click', function() { //to see when user wants to log out
        localStorage.removeItem('currentUser'); //removes key-value pair of specified key from localstorage
        checkLoginStatus(); //runs the function we wrote above
        // Redirect to homepage after logout
        window.location.href = 'index.html'; 
    });

    // Initialize login status check
    checkLoginStatus(); //final check login status and change all applicable fields based on login status
});

// Helper function to check if user is logged in - is used on other pages also
/*function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null; //if localstorage currentUser !null, return true to indicate user is logged in
}
*/
// We will use following function in pages like submit art and gallery where some functionality is accessible
// only if user is logged in. 
function requireLogin() {
    if (!isLoggedIn()) {
        alert('You must be logged in to access this page.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}
