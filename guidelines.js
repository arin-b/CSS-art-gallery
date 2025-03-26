document.addEventListener('DOMContentLoaded', function(){
	const userDisplay = document.getElementById('user-display');
	const loginBtn = document.getElementById('login-btn');
	const logoutBtn = document.getElementById('logout-btn');

	function checkLoginStatus(){
		const currentUser = JSON.parse(localStorage.getItem('currentUser'));
		if(currentUser){
			userDisplay.textContent = `Welcome ${currentUser.username}!`;
			loginBtn.style.display = 'none';
			logoutBtn.style.display = 'inline-block';
		} else{
			userDisplay.textContent = '';
			if(!window.location.href.includes('login.html')){
				loginBtn.style.display = 'inline-block'
			}
			logoutBtn.style.display = 'none';
		}
	}

	logoutBtn.addEventListener('click', function(){
		localStorage.removeItem('currentUser');
		checkLoginStatus();
		window.location.href = 'index.html';
	});

	checkLoginStatus();
});
