document.addEventListener("DOMContentLoaded", () => {
	let btnLogin = document.querySelector('.btn_login'),
		btnLogout = document.querySelector('.btn_logout');

	VK.init({
		apiId: 7229344
	});

	//авторизация в приложении
	btnLogin.addEventListener('click', () => {
		VK.Auth.login(
			res => {
				switch(res.status) {
					case 'connected':

						let user = res.session.user;
						let serialSession = JSON.stringify(res.session);
						localStorage.setItem('authSession', serialSession);

						clearWarningDiv();
						toggleContent();
						changeStateButtons();
						getLoginUserPhoto(user);
						getFriends(user);
						break;

					case 'not_authorized':
						setStatusToWarningDiv('Доступ к приложению не разрешен!');
						break;

					case 'unknown':
						setStatusToWarningDiv('Вы не авторизовались во ВКонтакте!');
						break;
				}
			}
		);
	});

	const toggleContent = () => {
		let content = document.querySelector('.content');
		content.classList.toggle('hidden');
		return;
	};
	//показать сообщение об ошибке авторизации
	const setStatusToWarningDiv = text => {
		let warningDiv = document.querySelector('.warning');
		warningDiv.classList.remove('hidden');
		warningDiv.innerText = text;
	};

	//очистка сообщения об ошибке авторизации
	const clearWarningDiv = () => {
		let warningDiv = document.querySelector('.warning');
		if (!warningDiv.classList.contains('hidden')) {
			warningDiv.classList.add('hidden');
			warningDiv.innerText = '';
		}
	};

	//получить список друзей (5 человек)
	const getFriends = user => {
		VK.Api.call(
			'friends.get',
			{ id: user.id,
			  order: 'random',
			  count: 5,
			  fields: 'online, photo_50',
			  v: "5.8"
			},
			res => {
				if (res.response) {
					let friendArr = res.response.items;
					renderFriends(friendArr);
				}
			});
	};

	//рендер списка друзей (5 человек)
	const renderFriends = friendArr => {
		let friendsDiv = document.querySelector('.friends'),
			friendList = document.createElement('div');
			friendList.classList.add('friend-list');
			friendList.innerHTML = '<h3 class="title-friends">Друзья:</h3>';
			friendsDiv.append(friendList);

			friendArr.map(item => {

				let friendItem = document.createElement('div');
				friendItem.classList.add('friend-item');
				friendItem.innerHTML = `
					<img class="friend_avatar" src=${item.photo_50} />
					<div class="friend_text">
						<div class="friend_name">${item.first_name} ${item.last_name}</div>
						<div class="status">${item.online ? 'в сети' : 'не в сети'}</div>
					</div>`;

				friendList.append(friendItem);

			});
	};

	//получить фото авторизованного пользователя
	const getLoginUserPhoto = user => {
		VK.Api.call(
			'users.get',
			{ user_ids: user.id,
			  fields: 'online, photo_100',
			  v: '5.8'
			},
			res => {
				if (res.response) {
					let loginUser = res.response[0];
					renderUser(loginUser);
				}
			}
		);
	};

	//рендер авторизованного пользователя
	const renderUser = user => {
		let userLogin = document.querySelector('.user');
		userLogin.innerHTML = `
			<img class="user_avatar" src=${user.photo_100} />
			<div class="user_name">${user.first_name} ${user.last_name}</div>
			<div class="status">${user.online ? 'в сети' : 'не в сети'}</div>`;
	}

	//выход из приложения
	btnLogout.addEventListener('click', () => {
		toggleContent();
		changeStateButtons();
		localStorage.clear();
		VK.Auth.logout(
			res => {
				if (res.status === 'unknown') {
					remove();
				}
			}
		);
	});

	//смена состояния кнопок при авторизации и выходе из приложения
	const changeStateButtons = () => {
		btnLogin.classList.toggle('hidden');
		btnLogout.classList.toggle('hidden');
	};

	//Очистка информации о пользователе при выходе из приложения
	const remove = () => {
		let friendsDiv = document.querySelector('.friends'),
			user = document.querySelector('.user');
		friendsDiv.innerHTML = '';
		user.innerHTML = '';
	};

	//Отображение информации о пользователе при перезагрузке страницы (из localStorage)
	const getSessionReload = () => {
		if (localStorage.length > 0) {
			changeStateButtons();

			let storageSession = JSON.parse(localStorage['authSession']);
			let user = storageSession.user;

			toggleContent();
			getLoginUserPhoto(user);
			getFriends(user);
		}
		return;
	};
	getSessionReload();
});