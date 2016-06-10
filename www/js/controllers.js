/* global angular, document, window */
'use strict';

angular.module('starter.controllers', [])

	.controller('AppCtrl', function ($rootScope, $scope, $state, $ionicModal, $ionicPopover, $timeout, UserService, ConfigurationService, EntityService) {
		// Form data for the login modal
		$scope.loginData = {};
		$scope.isExpanded = false;
		$scope.hasHeaderFabLeft = false;
		$scope.hasHeaderFabRight = false;

		$scope.userDetails = ConfigurationService.UserDetails();

		var ref = new Firebase("https://chatoi.firebaseio.com/chats/" + $scope.userDetails._id);
		ref.on("value", function (snapshot) {
			if(snapshot.val()){
				EntityService.setMessages(snapshot)

				$scope.$broadcast('someEvent', EntityService.getMessages());
			}


		});

		$rootScope.$on('saveSubjectRoot', function (event, data) {
			$scope.$broadcast('saveSubject', 'saveSubject');
		});
		$scope.updateUserDetails = function () {

			var user = {
				fbToken: $scope.userDetails.fbToken,
				notification_token: $scope.userDetails.notification_token
			}
			UserService.CreateUser(user)
				.then(function (user) {
					var newUserData = angular.toJson(user);
					window.localStorage['user'] = newUserData;
					$scope.userDetails = newUserData;
					$state.go("app.profile");
				}, function (err) {
				});
			//$scope.userDetails.fbPhotoUrl= 'http://brentcarnduff.com/wp-content/uploads/2014/08/url-small.jpg';
		}

		var navIcons = document.getElementsByClassName('ion-navicon');
		for (var i = 0; i < navIcons.length; i++) {
			navIcons.addEventListener('click', function () {
				this.classList.toggle('active');
			});
		}

		////////////////////////////////////////
		// Layout Methods
		////////////////////////////////////////

		$scope.hideNavBar = function () {
			document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
		};

		$scope.showNavBar = function () {
			document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
		};

		$scope.noHeader = function () {
			var content = document.getElementsByTagName('ion-content');
			for (var i = 0; i < content.length; i++) {
				if (content[i].classList.contains('has-header')) {
					content[i].classList.toggle('has-header');
				}
			}
		};

		$scope.setExpanded = function (bool) {
			$scope.isExpanded = bool;
		};

		$scope.setHeaderFab = function (location) {
			var hasHeaderFabLeft = false;
			var hasHeaderFabRight = false;

			switch (location) {
				case 'left':
					hasHeaderFabLeft = true;
					break;
				case 'right':
					hasHeaderFabRight = true;
					break;
			}

			$scope.hasHeaderFabLeft = hasHeaderFabLeft;
			$scope.hasHeaderFabRight = hasHeaderFabRight;
		};

		$scope.hasHeader = function () {
			var content = document.getElementsByTagName('ion-content');
			for (var i = 0; i < content.length; i++) {
				if (!content[i].classList.contains('has-header')) {
					content[i].classList.toggle('has-header');
				}
			}

		};

		$scope.hideHeader = function () {
			$scope.hideNavBar();
			$scope.noHeader();
		};

		$scope.showHeader = function () {
			$scope.showNavBar();
			$scope.hasHeader();
		};

		$scope.clearFabs = function () {
			var fabs = document.getElementsByClassName('button-fab');
			if (fabs.length && fabs.length > 1) {
				fabs[0].remove();
			}
		};
		$scope.logOut = function () {
			window.localStorage.clear();
			$state.go('login');

		}
	})

	.controller('LoginCtrl', function ($scope, $timeout, $stateParams, ionicMaterialInk, UserService, $state) {
		$scope.fbLogin = function () {

			if (window.cordova) {
				UserService.FBlogin().then(function success(s) {

					if (window.cordova && typeof window.plugins.OneSignal != 'undefined') {
						window.plugins.OneSignal.getIds(function (ids) {
							window.localStorage['notification_token'] = ids.userId;

						});
					}
					var fbData = angular.fromJson(window.localStorage['fbData']);
					var user = {
						fbToken: fbData['accessToken'],
						notification_token: window.localStorage['notification_token']
					}

					UserService.CreateUser(user)
						.then(function (user) {
							window.localStorage['user'] = angular.toJson(user);
							var ref = new Firebase("https://chatoi.firebaseio.com");

							ref.authWithCustomToken(user.fireToken, function (error, authData) {

								if (error) {
									console.log("Login Failed!", error);
								} else {
									$state.go("app.subjects");
								}
							});
							$state.go("tab.subjects");
						}, function (err) {
						});
					//alert($scope.FbName)


				}, function error(msg) {
					console.log("Error while performing Facebook login", msg);
				})
			} else {
				var user = {
					fbToken: 'EAACEdEose0cBAEFojbGL0sT14oomuPY7G6zfAoOa1msYKTuNdt4E6CGP7XuyiwnqTIwxMZCQOPZBZBv6mnOKLryVZAAvKGLo0fQc8wWDvT5JnC4RGPQBRZCi15a9yEaS4gcyZCilefehXALnHR87Ir9wUke6wJ82MpR6jLsLW4DwZDZD',
					notification_token: '13c3418b-0d3d-4bf0-a797-90eac633c7e1'

				}

				UserService.CreateUser(user)
					.then(function (user) {
						window.localStorage['user'] = angular.toJson(user);
						var ref = new Firebase("https://chatoi.firebaseio.com");

						ref.authWithCustomToken(user.fireToken, function (error, authData) {

							if (error) {
								console.log("Login Failed!", error);
							} else {
								$state.go("app.subjects");
							}
						});
						$state.go("app.subjects");
					}, function (err) {
					});
			}

		};

		//$scope.$parent.clearFabs();
		//$timeout(function () {
		//	$scope.$parent.hideHeader();
		//}, 0);
		ionicMaterialInk.displayEffect();
	})
	.controller('ChatCtrl', function ($scope, $firebaseObject, $ionicScrollDelegate, $location, $anchorScroll, $state, $stateParams, $timeout, $firebaseArray, ionicMaterialInk, ionicMaterialMotion, ConfigurationService, EntityService) {

		var chatDetails = EntityService.getMessageDetails();
		$scope.conversationId = chatDetails.conversationId;
		$scope.lastMessageKey = chatDetails.lastMessageKey;
		$scope.messages = [];
		var userDetails = ConfigurationService.UserDetails();
		$scope.userId = userDetails._id;
		var userName = userDetails.first_name + " " + userDetails.last_name;
		//if (window.localStorage['messages']) {
		//	var localMessages = angular.fromJson(window.localStorage['messages']);
		//	var messagIndexx = common.indexOfConv(localMessages, $scope.conversationId);
		//	var messageToPush = {
		//		conversationId: $scope.conversationId,
		//		lastMessageKey: $scope.lastMessageKey
		//	}
		//	if (messagIndexx == -1) {
        //
		//		localMessages.push(messageToPush)
		//	}
		//	else {
		//		if (localMessages[messagIndexx].lastMessageKey !== $scope.lastMessageKey) {
		//			localMessages[messagIndexx] = messageToPush;
		//		}
		//	}
		//	window.localStorage['messages'] = angular.toJson(localMessages);
		//} else {
		//	var messagesToPush = [];
		//	var messageToPush = {
		//		conversationId: $scope.conversationId,
		//		lastMessageKey: $scope.lastMessageKey
		//	}
		//	messagesToPush.push(messageToPush);
		//	window.localStorage['messages'] = angular.toJson(messagesToPush);
		//}

		var createrId = $scope.conversationId.split("-")[0];
		var subjectId = $scope.conversationId.split("-")[1];
		//var createrUser = userRef.val(createrId);
		var myUrl = "https://chatoi.firebaseio.com/chats/" + $scope.userId + "/" + $scope.conversationId;
		var otherUrl = "https://chatoi.firebaseio.com/chats/" + createrId + "/" + $scope.userId + '-' + subjectId;
		var myMessages = new Firebase(myUrl + "/messages");
		$scope.messages = $firebaseArray(myMessages);

		var conversationUserRef = new Firebase('https://chatoi.firebaseio.com/conversationOnline/' + $scope.userDetails._id);
		var conversationOterUserRef = new Firebase('https://chatoi.firebaseio.com/conversationOnline/' + createrId);
		var hanleOtherMessageRead = new Firebase(otherUrl + "/unRead");
		conversationUserRef.set({
			conversationId: $scope.conversationId,

		});


		$timeout(function(){
			$ionicScrollDelegate.scrollBottom();
		},300)

		//});
		$scope.sendMessage = function () {
			$ionicScrollDelegate.scrollBottom();

			var isFirstMessage = false;
			if($scope.messages.length == 0){
				isFirstMessage = true;
			}

			//var otherConversaionOnline="https://chatoi.firebaseio.com/chats/" + $scope.conversationId.split("-")[0] + "/" + $scope.userId + '-' + $scope.conversationId.split("-")[1];
			var ref2, ref1;
			if (isFirstMessage) {
				ref2 = new Firebase(otherUrl);
				ref1 = new Firebase(myUrl);

				var newMessageRef2 = ref2.push();
				var newMessageRef1 = ref1.push();
				ref1.set({
					userName: chatDetails.userName,
					subjectName: chatDetails.subjectName,
					fbPhotoUrl: chatDetails.fbPhotoUrl
				});
				ref2.set({
					userName: userName,
					subjectName: chatDetails.subjectName,
					fbPhotoUrl: userDetails.fbPhotoUrl
				});


				conversationOterUserRef.on('value', function(snapshot) {
					debugger;
					if (snapshot.val()) {


					}else{
						hanleOtherMessageRead.set(true);
					}

				});
				isFirstMessage = false;
			}

			debugger;
			ref2 = new Firebase(otherUrl + "/messages");
			ref1 = new Firebase(myUrl + "/messages");
			var newMessageRef1 = ref1.push();
			newMessageRef1.set(
				{
					body: $scope.messageContent,
					sender: $scope.userId
				}
			);
			var newMessageRef2 = ref2.push();
			newMessageRef2.set(
				{
					body: $scope.messageContent,
					sender: $scope.userId
				}
			);

			conversationOterUserRef.on('value', function(snapshot) {
				if (snapshot.val()) {
					debugger;

				}else{

					hanleOtherMessageRead.set(true);
					debugger
				}
			});
				var userRef = new Firebase('https://chatoi.firebaseio.com/presence/' + createrId);
				userRef.on("value", function (userSnapshot) {
					if (userSnapshot.val() == 'offline') {

						var message = {
							user: createrId,
							message: $scope.messageContent,
							conversationId: $scope.userId + "-" + subjectId
						}
						//NotificationService.SendMessage(message)
						//	.then(function (message) {
						//
						//	}, function (err) {
						//	});
					}
				});



			delete $scope.messageContent;
		}
	})
	.controller('MessagesCtrl', function ($scope, $state, $stateParams, $timeout, $firebaseArray, ionicMaterialInk, ionicMaterialMotion, ConfigurationService, UserService,EntityService) {
		$scope.messages = EntityService.getMessages();
		$scope.$on('someEvent', function(event, mass) {
			$scope.messages = mass;
						$timeout(function () {
							ionicMaterialMotion.fadeSlideInRight({
								startVelocity: 3000
							});
						}, 700);
		});

		$scope.goToChat = function (message) {
            var messageDetails = {
                conversationId: message.conversationId,
                lastMessageKey: message.lastMessageKey

			}
			EntityService.setMessageDetails(messageDetails);
			$state.go('app.chat', {conversationId: message.conversationId, lastMessageKey: message.lastMessageKey})
		}
		$scope.goToUserProfile = function (message) {
			var createrId = message.conversationId.split("-")[0];
			UserService.GetUser(createrId)
				.then(function (user) {
					EntityService.setProfile(user);
					$state.go("app.profile");
				}, function (err) {
				});

		}

	})

	.controller('ProfileCtrl', function ($scope, $rootScope, $ionicPopup, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk, ConfigurationService, SubjectService, EntityService) {
		$scope.$parent.showHeader();
		$scope.$parent.clearFabs();
		$scope.isExpanded = false;
		$scope.$parent.setExpanded(false);
		$scope.$parent.setHeaderFab(false);
		$scope.userProfile = angular.fromJson(window.localStorage['user']);
		$scope.subjects = [];
		$scope.deleteSubject = function (subject) {
			EntityService.deleteFromArray($scope.subjects, subject)
			SubjectService.DeleteSubjects(subject)
				.then(function () {

				}, function (err) {
				});
		}

		function renderSubjectList() {
			var otherUser = EntityService.getOtherProfile();
			if (otherUser) {
				$scope.userProfile = otherUser;
				SubjectService.GetSubjects(true, otherUser._id)
					.then(function (subjects) {
						$scope.subjects = subjects;
						$scope.blinds();
						//$timeout(function () {
						//	ionicMaterialMotion.fadeSlideInRight({
						//		startVelocity: 3000
						//	});
						//}, 700);
					}, function (err) {
					});
			} else {
				SubjectService.GetSubjects(true)
					.then(function (subjects) {
						$scope.subjects = subjects;
						$scope.blinds();
						//$timeout(function () {
						//	ionicMaterialMotion.fadeSlideInRight({
						//		startVelocity: 3000
						//	});
						//}, 700);
					}, function (err) {
					});
			}

		}


		$timeout(function () {

			ionicMaterialMotion.slideUp({
				selector: '.slide-up'
			});
		}, 300);

		$scope.blinds = function () {
			//  reset();
			//   document.getElementsByTagName('ion-list')[0].className += ' animate-blinds';
			setTimeout(function () {
				ionicMaterialMotion.blinds(); // ionic.material.motion.blinds(); //ionicMaterialMotion
			}, 300);
		};


		// Set Ink

		renderSubjectList();
		$rootScope.$on('renderSubjectList', function (event, data) {

			renderSubjectList(); // 'Data to send'
		});
		ionicMaterialInk.displayEffect();
	})

	.controller('SubjectsCtrl', function ($scope, $state, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk, SubjectService, EntityService) {
		$scope.$parent.showHeader();
		$scope.$parent.clearFabs();
		$scope.isExpanded = true;
		$scope.$parent.setExpanded(true);
		$scope.$parent.setHeaderFab('right');
		$scope.subjects = [];
		$scope.goToUserProfile = function (user) {
			EntityService.setProfile(user);
			$state.go("app.profile");
		}
		SubjectService.GetSubjects(false)
			.then(function (subjects) {
				$scope.subjects = subjects;
				$timeout(function () {
					ionicMaterialMotion.fadeSlideIn({
						selector: '.animate-fade-slide-in .item'
					});
				}, 200);
			}, function (err) {
			});

		$scope.goToChat = function (subject) {

			var userName = subject.user.first_name + " " + subject.user.last_name;
			var messageDetails = {
				conversationId: subject.user._id + "-" + subject._id,
				userName: userName,
				subjectName: subject.title,
				fbPhotoUrl: subject.user.fbPhotoUrl
			}
			EntityService.setMessageDetails(messageDetails);
			$state.go('app.chat')
		}
		ionicMaterialInk.displayEffect();


	})
	.controller('AddSubjectCtrl', function ($scope, $rootScope, $state, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk, SubjectService, EntityService) {
		$scope.$parent.showHeader();
		$scope.$parent.clearFabs();
		$scope.isExpanded = true;
		$scope.$parent.setExpanded(true);
		$scope.$parent.setHeaderFab('right');
		$scope.categories = [];
		$scope.subject={};
		$scope.goToUserProfile = function (user) {
			EntityService.setProfile(user);
			$state.go("app.profile");
		}
		SubjectService.GetCategories()
			.then(function (categories) {
				$scope.categories = categories;
				$timeout(function () {
					ionicMaterialMotion.fadeSlideIn({
						selector: '.animate-fade-slide-in .item'
					});
				}, 200);
			}, function (err) {
			});

		ionicMaterialInk.displayEffect();
		$scope.$on('saveSubject', function (event, data) {
			createSubject();
		});
		function createSubject() {
			$scope.subject.categories = [];
			for (var i = 0; i < $scope.categories.length; i++) {
				if ($scope.categories[i].isSelected) {
					$scope.subject.categories.push($scope.categories[i]._id);
				}
			}

			SubjectService.CreateSubject($scope.subject)
				.then(function () {
					$state.go("app.profile");
				}, function (err) {
					$state.go("app.profile");
				});
		}

	})

	.controller('GalleryCtrl', function ($scope, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion) {
		$scope.$parent.showHeader();
		$scope.$parent.clearFabs();
		$scope.isExpanded = true;
		$scope.$parent.setExpanded(true);
		$scope.$parent.setHeaderFab(false);

		// Activate ink for controller
		ionicMaterialInk.displayEffect();

		ionicMaterialMotion.pushDown({
			selector: '.push-down'
		});
		ionicMaterialMotion.fadeSlideInRight({
			selector: '.animate-fade-slide-in .item'
		});

	})
	.controller('FabCtrl', function ($scope, $state, $rootScope, $ionicModal, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion, $ionicPopup, ConfigurationService, SubjectService) {
		$ionicModal.fromTemplateUrl('templates/filter.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (modal) {
			$scope.modal = modal;
		});
		//$timeout(function () {
		//	document.getElementById('fab-friends').classList.toggle('on');
		//}, 900);
		$scope.filter=function(){
			$scope.openModal();
		}
		$timeout(function () {
			var elements = document.getElementById('fab-friends');
			if (elements && elements.length > 0)
				elements.classList.toggle('on');
		}, 900);
		$scope.createSubject = function () {
			//$scope.openModal();
			$state.go('app.addSubject');
		}
		$scope.saveSubject = function () {
			//$scope.openModal();
			//$state.go('app.addSubject');
			$rootScope.$emit('saveSubjectRoot', 'saveSubjectRoot');
		}
		$scope.openModal = function () {
			$scope.modal.show();
		};
		$scope.closeModal = function () {
			$scope.modal.hide();
		};
		// Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function () {
			$scope.modal.remove();
		});
		// Execute action on hide modal
		$scope.$on('modal.hidden', function () {
			// Execute action
		});
		// Execute action on remove modal
		$scope.$on('modal.removed', function () {
			// Execute action
		});
		//$scope.createSubject = function () {
		//
		//	$scope.subject = {
		//		title: "",
		//		user: "",
		//		description: ""
		//	}
		//	// An elaborate, custom popup
		//	var myPopup = $ionicPopup.show({
		//		template: 'title:<input type="text" ng-model="subject.title">description:<textarea class="subject-desciption" ng-model="subject.description"></textarea>',
		//		title: 'add subject',
		//		cssClass: 'addSubjectPopup',
		//		scope: $scope,
		//		buttons: [
		//			{
		//				text: '<b>Add</b>',
		//				type: 'button-calm',
		//				onTap: function (e) {
		//					if ($scope.subject.title == '') {
		//						//don't allow the user to close unless he enters wifi password
		//						e.preventDefault();
		//					} else {
		//						return ConfigurationService.UserDetails()._id;
		//					}
		//				}
		//			},
		//			{text: 'Cancel'}
		//
		//		]
		//	});
		//
		//	myPopup.then(function (res) {
		//
		//		if (res) {
		//
		//			$scope.subject.user = res;
		//			SubjectService.CreateSubject($scope.subject)
		//				.then(function () {
		//
		//					$rootScope.$emit('renderSubjectList', 'new subjects list');
		//					//$timeout(function () {
		//					//	$scope.subjects.push($scope.subject);
		//					//	ionicMaterialMotion.fadeSlideInRight({
		//					//		startVelocity: 3000
		//					//	});
		//					//}, 700);
		//				}, function (err) {
		//				});
		//
		//
		//		}
		//	});
		//
		//};
	})

;
