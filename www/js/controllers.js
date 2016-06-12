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
		$rootScope.unreadMessages = false;
		$rootScope.$on('renderSubjectListh', function (event, data) {
			$timeout(function(){
				$scope.$broadcast('aaaaa', 'renderSubjectList');

			},400);

		});

		var ref = new Firebase("https://chatoi.firebaseio.com/chats/" + $scope.userDetails._id);
		ref.on("value", function (snapshot) {
			if(snapshot.val()){
				EntityService.setMessages(snapshot).then(function(messages){
					$rootScope.unreadMessages = EntityService.checkUnreadMessages();
					$scope.$broadcast('sendMessagesEvent', 'sendMessagesEvent');
				})

			}
		});
		var amOnline = new Firebase('https://chatoi.firebaseio.com/.info/connected');
		var userRef = new Firebase('https://chatoi.firebaseio.com/presence/' + $scope.userDetails._id);
		var conversationUserRef = new Firebase('https://chatoi.firebaseio.com/conversationOnline/' + $scope.userDetails._id);
		amOnline.on('value', function(snapshot) {
			if (snapshot.val()) {
				userRef.onDisconnect().set('offline');
				conversationUserRef.onDisconnect().remove();
				userRef.set('online');
			}
		});

		$rootScope.$on('$stateChangeStart',
			function(event, toState, toParams, fromState, fromParams, options){

				if(toState.name !== "app.chat"){

					conversationUserRef.remove();
				}
				// transitionTo() promise will be rejected with
				// a 'transition prevented' error
			})
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

					window.localStorage['fbData'] = angular.toJson(s.authResponse);
					var fbData = s.authResponse;
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
					fbToken: 'EAAZAMbMtmoBIBAGfywiAYNWheXdeVsoX7O0GKxOx1DHAjO52Y6H6bhxS5E6MyFSSLaJNTgMOC8oAOTX3El5ZCZB9ESFUXpU7XKKcjdyTLInXqDrCZCTb1ExRQKAZBGqSLmp2trDUv5t7W9ZBUXKvPEvHH6FwId0KPXm3nNWiwUZAJjwDCZCZAQLYXOoL5dZBy61JR9AtZBQzY9OD1WZAMWEBsCE8',
					notification_token: 'ac92b0ec-117b-4c8c-87d1-12519f8f0578'

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
	.controller('ChatCtrl', function ($scope, $firebaseObject, $ionicScrollDelegate, $location, $anchorScroll, $state, $stateParams, $timeout, $firebaseArray, ionicMaterialInk, ionicMaterialMotion, ConfigurationService, EntityService,NotificationService) {

		$scope.chatDetails = EntityService.getMessageDetails();
		$scope.conversationId = $scope.chatDetails.conversationId;
		$scope.lastMessageKey = $scope.chatDetails.lastMessageKey;
		$scope.messages = [];
		var userDetails = ConfigurationService.UserDetails();
		$scope.userId = userDetails._id;
		var userName = userDetails.first_name + " " + userDetails.last_name;

		var createrId = $scope.conversationId.split("-")[0];
		var subjectId = $scope.conversationId.split("-")[1];
		//var createrUser = userRef.val(createrId);
		var otherConversationId = $scope.userId + '-' + subjectId;
		var myUrl = "https://chatoi.firebaseio.com/chats/" + $scope.userId + "/" + $scope.conversationId;
		var otherUrl = "https://chatoi.firebaseio.com/chats/" + createrId + "/" + otherConversationId;
		var myMessages = new Firebase(myUrl + "/messages");
		var loadedMessages = $firebaseArray(myMessages);
		loadedMessages.$loaded(function(msgs){
			$scope.messages = $firebaseArray(myMessages);
		})


		var conversationUserRef = new Firebase('https://chatoi.firebaseio.com/conversationOnline/' + $scope.userDetails._id);
		var conversationOterUserRef = new Firebase('https://chatoi.firebaseio.com/conversationOnline/' + createrId);
		var hanleMyMessageRead = new Firebase(myUrl + "/read");
		var hanleOtherMessageRead = new Firebase(otherUrl + "/read");
		conversationUserRef.set({
			conversationId: $scope.conversationId,

		});
		hanleMyMessageRead.set(true);
		
		$timeout(function () {
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
					userName: $scope.chatDetails.userName,
					subjectName: $scope.chatDetails.subjectName,
					fbPhotoUrl: $scope.chatDetails.fbPhotoUrl,
					read: true

				});
				ref2.set({
					userName: userName,
					subjectName: $scope.chatDetails.subjectName,
					fbPhotoUrl: userDetails.fbPhotoUrl
				});

				var aa = $firebaseObject(conversationOterUserRef);
				aa.$loaded(function(value){
					if(!value.conversationId){
						hanleOtherMessageRead.set(false);
					}else if (value.conversationId !== otherConversationId){
						hanleOtherMessageRead.set(false);
					}
					else{
						hanleOtherMessageRead.set(true);
					}

				})

				isFirstMessage = false;
			}


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
			var aa = $firebaseObject(conversationOterUserRef);
			aa.$loaded(function(value){
				if(!value.conversationId){
					hanleOtherMessageRead.set(false);
				}else if (value.conversationId !== otherConversationId){
					hanleOtherMessageRead.set(false);
				}
				else{
					hanleOtherMessageRead.set(true);
				}
			})

			var userRef = new Firebase('https://chatoi.firebaseio.com/presence/' + createrId);
			userRef.on("value", function (userSnapshot) {
				if (userSnapshot.val() == 'offline') {

					var message = {
						user: createrId,
						message: $scope.messageContent,
						conversationId: otherConversationId,
						userName: $scope.chatDetails.userName,
						subjectName: $scope.chatDetails.subjectName,
						fbPhotoUrl: $scope.chatDetails.fbPhotoUrl
					}
					NotificationService.SendMessage(message)
						.then(function (message) {

						}, function (err) {
						});
				}
			});



			delete $scope.messageContent;
		}
	})
	.controller('MessagesCtrl', function ($scope, $state, $stateParams, $timeout, $firebaseArray, ionicMaterialInk, ionicMaterialMotion, ConfigurationService, UserService,EntityService) {
		$scope.messages = EntityService.getMessages();
		$scope.$on('sendMessagesEvent', function(event, mass) {
			$scope.messages = EntityService.getMessages();
						$timeout(function () {
							ionicMaterialMotion.fadeSlideInRight({
								startVelocity: 3000
							});
						}, 700);
		});

		$scope.goToChat = function (message) {
			var messageDetails = {
				conversationId: message.conversationId,
				lastMessageKey: message.lastMessageKey,
				fbPhotoUrl: message.fbPhotoUrl,
				userName: message.userName,
				subjectName: message.subjectName
			}
			debugger
			EntityService.setMessageDetails(messageDetails);
			$state.go('app.chat', {conversationId: message.conversationId, lastMessageKey: message.lastMessageKey})
		}
		$scope.goToUserProfile = function (message) {
			var createrId = message.conversationId.split("-")[0];
			UserService.GetUser(createrId)
				.then(function (user) {
					EntityService.setProfile(user);
					$state.go("app.profile",{otherProfile: true});
				}, function (err) {
				});

		}
		ionicMaterialInk.displayEffect();
	})

	.controller('ProfileCtrl', function ($scope, $state, $rootScope, $ionicPopup, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk, ConfigurationService, SubjectService, EntityService) {
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
		$scope.displayDelete = true;
		var otherProfile = $state.params.otherProfile;
		function renderSubjectList() {
			var otherUser = EntityService.getOtherProfile();
			if (otherProfile) {
				document.getElementById("fab-profile").style.display = "none";
				$scope.displayDelete = false;
				$scope.userProfile = otherUser;
				SubjectService.GetSubjects(true, otherUser._id)
					.then(function (subjects) {
						$scope.subjects = subjects;
						$scope.blinds();
					}, function (err) {
					});
			} else {
				$scope.displayDelete = true;
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
			$state.go("app.profile",{otherProfile: true});
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
		$scope.subject = {};
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
	.controller('FabCtrl', function ($scope,$window, $state, $ionicHistory, $rootScope, $ionicModal, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion, $ionicPopup, ConfigurationService, SubjectService) {
		$ionicModal.fromTemplateUrl('templates/filter.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (modal) {
			$scope.modal = modal;
		});
		$scope.categories = [];
		if (!window.localStorage["myFilter"]) {
			$scope.myFilter = {
				nearMe: false,
				gender: 'both',
				categories: {}
			}
			window.localStorage["myFilter"] = angular.toJson($scope.myFilter);
		}
		else {
			$scope.myFilter = angular.fromJson(window.localStorage["myFilter"]);
		}
		$scope.saveFilter = function () {

			angular.forEach($scope.myFilter.categories, function (value, key) {
				if (!value) {
					delete $scope.myFilter.categories[key];
				}
			});
			window.localStorage["myFilter"] = angular.toJson($scope.myFilter);
			$scope.closeModal();
			$window.location.reload(true);
			//$state.go('app.subjects', {}, {reload: true});
			//$state.go('app.subjects');

		}
		$scope.closeFilterModal = function () {
			$scope.closeModal();

		}
		//$timeout(function () {
		//	document.getElementById('fab-friends').classList.toggle('on');
		//}, 900);
		$scope.filter = function () {
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
