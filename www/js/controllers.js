/* global angular, document, window */
'use strict';

angular.module('starter.controllers', [])

	.controller('AppCtrl', function ($scope, $state, $ionicModal, $ionicPopover, $timeout, UserService, ConfigurationService) {
		// Form data for the login modal
		$scope.loginData = {};
		$scope.isExpanded = false;
		$scope.hasHeaderFabLeft = false;
		$scope.hasHeaderFabRight = false;
		$scope.userDetails = ConfigurationService.UserDetails();
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
						// fbUserId: fbData['userID'],
						// first_name: window.localStorage['fbFirstName'],
						// last_name: window.localStorage['fbLastName'],

					}

					UserService.CreateUser(user)
						.then(function (user) {
							window.localStorage['userId'] = user._id;
							$state.go("tab.subjects");
						}, function (err) {
						});
					//alert($scope.FbName)


				}, function error(msg) {
					console.log("Error while performing Facebook login", msg);
				})
			} else {
				var user = {
					fbToken: 'EAAZAMbMtmoBIBAAMQquZBYND6oZAGSFA5kHHhd8ERy0XnzfkcPRius9dTySs7GkYQfDIvxVm9HMBlvVxEAskDLTQ8N08pe18GZBgzFmssrU9zrfZCj8aKE13bySp9vdbMwartamZCut5bv5Cx3cU2817yfw7eZCDLfKZBOGqG1CcBL71VNlJWolNxsrxrVmPiEwz6IbJ9aukOAZDZD',
					notification_token: '13c3418b-0d3d-4bf0-a797-90eac633c7e1'

				}

				UserService.CreateUser(user)
					.then(function (user) {
						window.localStorage['user'] = angular.toJson(user);
						$state.go("app.profile");
					}, function (err) {
					});
			}

		};

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

	.controller('LoginCtrl', function ($scope, $timeout, $stateParams, ionicMaterialInk,UserService, $state) {
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
						// fbUserId: fbData['userID'],
						// first_name: window.localStorage['fbFirstName'],
						// last_name: window.localStorage['fbLastName'],

					}

					UserService.CreateUser(user)
						.then(function (user) {
							window.localStorage['userId'] = user._id;
							$state.go("tab.subjects");
						}, function (err) {
						});
					//alert($scope.FbName)


				}, function error(msg) {
					console.log("Error while performing Facebook login", msg);
				})
			} else {
				var user = {
					fbToken: 'EAAZAMbMtmoBIBAAMQquZBYND6oZAGSFA5kHHhd8ERy0XnzfkcPRius9dTySs7GkYQfDIvxVm9HMBlvVxEAskDLTQ8N08pe18GZBgzFmssrU9zrfZCj8aKE13bySp9vdbMwartamZCut5bv5Cx3cU2817yfw7eZCDLfKZBOGqG1CcBL71VNlJWolNxsrxrVmPiEwz6IbJ9aukOAZDZD',
					notification_token: '13c3418b-0d3d-4bf0-a797-90eac633c7e1'

				}

				UserService.CreateUser(user)
					.then(function (user) {
						window.localStorage['user'] = angular.toJson(user);
						$state.go("app.profile");
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
    .controller('ChatCtrl', function($scope,$location, $anchorScroll, $state, $stateParams, $timeout, $firebaseArray , ionicMaterialInk, ionicMaterialMotion, ConfigurationService, EntityService) {

		var chatDetails = EntityService.getMessageDetails();
        $scope.conversationId = chatDetails.conversationId;
        $scope.lastMessageKey = chatDetails.lastMessageKey;
		$scope.messages = [];
		var userDetails = ConfigurationService.UserDetails();
		$scope.userId = userDetails._id;
		var userName = userDetails.first_name + " " + userDetails.last_name;
		if (window.localStorage['messages']) {
			var localMessages = angular.fromJson(window.localStorage['messages']);
			var messagIndexx = common.indexOfConv(localMessages, $scope.conversationId);
			if (messagIndexx == -1) {
			}
			else {
				//if(localMessages[messagIndexx].lastMessageKey !=lastMessageKey){
				//}
			}
		} else {
			var messagesToPush = [];
			var messageToPush = {
				conversationId: $scope.conversationId,
				lastMessageKey: $scope.lastMessageKey
			}
			messagesToPush.push(messageToPush);
			window.localStorage['messages'] = angular.toJson(messagesToPush);
		}

		var createrId = $scope.conversationId.split("-")[0];
		var subjectId = $scope.conversationId.split("-")[1];
		//var createrUser = userRef.val(createrId);

		var myUrl = "https://chatoi.firebaseio.com/chats/" + $scope.userId + "/" + $scope.conversationId;
		var ref = new Firebase(myUrl + "/messages");
		var list = $firebaseArray(ref);
		var isFirstMessage = false;
		//var unwatch = list.$watch(function () {
		list.$loaded()
			.then(function (x) {
				$scope.messages = x;
				if (x.length == 0) {
					isFirstMessage = true;
				}
			});


		//});
		$scope.sendMessage = function () {
			var otherUrl = "https://chatoi.firebaseio.com/chats/" + $scope.conversationId.split("-")[0] + "/" + $scope.userId + '-' + $scope.conversationId.split("-")[1];
			var ref2, ref1;
			if (isFirstMessage) {
				ref2 = new Firebase(otherUrl);
				ref1 = new Firebase(myUrl);
				var newMessageRef1 = ref1.push();
                ref1.set({
					messages: [{body: $scope.messageContent, sender: $scope.userId}],
					userName: chatDetails.userName,
					subjectName: chatDetails.subjectName,
					fbPhotoUrl:chatDetails.fbPhotoUrl
				});
				
				var newMessageRef2 = ref2.push();
                ref2.set({
					messages: [{body: $scope.messageContent, sender: $scope.userId}],
					userName:userName,
					subjectName: chatDetails.subjectName,
					fbPhotoUrl: userDetails.fbPhotoUrl
				});

				isFirstMessage = false;
			}
			else {
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
					});
			}
			var userRef = new Firebase('https://chatoi.firebaseio.com/presence/' + createrId);
			userRef.on("value", function (userSnapshot) {
				if (userSnapshot.val() == 'offline') {

					var message = {
						user: createrId,
						message: $scope.messageContent,
						conversationId: $scope.userId + "-" + subjectId
					}
					NotificationService.SendMessage(message)
						.then(function (message) {

						}, function (err) {
						});
				}
			});
			$location.hash('bottom');
			$anchorScroll();
			delete $scope.messageContent;
		}
	})
	.controller('MessagesCtrl', function ($scope, $state, $stateParams, $timeout, $firebaseArray, ionicMaterialInk, ionicMaterialMotion, ConfigurationService,EntityService) {
		$scope.$parent.showHeader();
		$scope.$parent.clearFabs();
		$scope.$parent.setHeaderFab('left');
		$scope.goToChat = function (message) {
            var messageDetails = {
                conversationId: message.conversationId,
                lastMessageKey: message.lastMessageKey

            }
			EntityService.setMessageDetails(messageDetails);
			$state.go('app.chat', {conversationId: message.conversationId, lastMessageKey: message.lastMessageKey})
		}
		// Delay expansion
		$timeout(function () {
			$scope.isExpanded = true;
			$scope.$parent.setExpanded(true);
		}, 300);

		// Set Motion
		ionicMaterialMotion.fadeSlideInRight();

		// Set Ink
		ionicMaterialInk.displayEffect();
		var userDetails = ConfigurationService.UserDetails();
		var userId = userDetails._id;
		var ref = new Firebase("https://chatoi.firebaseio.com/chats/" + userId);
		ref.on("child_added", function (snapshot) {

			var user = snapshot.val();


		});

		var list = $firebaseArray(ref)
		var unwatch = list.$watch(function () {

			list.$loaded()
				.then(function (x) {
					$scope.messages = [];

					angular.forEach(x, function (value, key) {

						var conversationId = value.$id;

						var messagesArray = Object.getOwnPropertyNames(value.messages);
						var lastMessageKey = messagesArray[messagesArray.length - 1];

						var lastMessage = value.messages[lastMessageKey].body;
						var createrId = conversationId.split("-")[0];

						if (window.localStorage['messages']) {
							var localMessages = angular.fromJson(window.localStorage['messages']);

							var indexx = common.indexOfConv(localMessages, conversationId);
							var readMessage = true;
							if (indexx === -1) {
								readMessage = false;
							}
							else {
							}
						} else {
							readMessage = false;
						}

						var userRef = new Firebase('https://chatoi.firebaseio.com/presence/' + createrId);

						userRef.on("value", function (userSnapshot) {

							var online = true;
							if (userSnapshot.val() == 'offline') {
								online = false;

							}

							var indexx = common.indexOfConv($scope.messages, conversationId);
							if (indexx === -1) {
								$scope.messages.push({
									conversationId: conversationId,
									lastMessage: lastMessage,
									lastMessageKey:lastMessageKey,
                                    subjectName: value.subjectName ,
									fbPhotoUrl: value.fbPhotoUrl,
									userName: value.userName,
									online: online,
									readMessage:readMessage

								});
							}
							else {
                                $scope.messages[indexx]= {
									conversationId: conversationId,
									lastMessage: lastMessage,
									lastMessageKey:lastMessageKey,
									subjectName: value.subjectName,
									fbPhotoUrl:value.fbPhotoUrl ,
									userName: value.userName,
									online: online,
									readMessage: readMessage
								};

							}

							if (!$scope.$$phase) {
								$scope.$apply();
							}
						});

					}, x);
					$timeout(function () {
						ionicMaterialMotion.fadeSlideInRight({
							startVelocity: 3000
						});
					}, 700);
				})
				.catch(function (error) {
					console.log("Error:", error);
				});
		});
	})

	.controller('ProfileCtrl', function ($scope,$rootScope, $ionicPopup, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk, ConfigurationService, SubjectService, EntityService) {
		$scope.$parent.showHeader();
		$scope.$parent.clearFabs();
		$scope.isExpanded = false;
		$scope.$parent.setExpanded(false);
		$scope.$parent.setHeaderFab(false);
		$scope.userProfile = angular.fromJson(window.localStorage['user']);
		$scope.subjects = [];
		$scope.deleteSubject = function (subject) {
			EntityService.deleteFromArray($scope.subjects,subject)
			SubjectService.DeleteSubjects(subject)
				.then(function () {

				}, function (err) {
				});
		}
		function renderSubjectList(){
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
		$scope.blinds = function() {

			//  reset();
			//   document.getElementsByTagName('ion-list')[0].className += ' animate-blinds';
			setTimeout(function() {
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
	.controller('FabCtrl', function ($scope,$rootScope, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion,$ionicPopup,ConfigurationService,SubjectService) {

	$scope.createSubject = function () {

		$scope.subject = {
			title: "",
			user: "",
			description: ""
		}
		// An elaborate, custom popup
		var myPopup = $ionicPopup.show({
			template: 'title:<input type="text" ng-model="subject.title">description:<textarea class="subject-desciption" ng-model="subject.description"></textarea>',
			title: 'add subject',
			cssClass: 'addSubjectPopup',
			scope: $scope,
			buttons: [
				{
					text: '<b>Add</b>',
					type: 'button-calm',
					onTap: function (e) {
						if ($scope.subject.title == '') {
							//don't allow the user to close unless he enters wifi password
							e.preventDefault();
						} else {
							return ConfigurationService.UserDetails()._id;
						}
					}
				},
				{text: 'Cancel'}

			]
		});

		myPopup.then(function (res) {

			if (res) {

				$scope.subject.user = res;
				SubjectService.CreateSubject($scope.subject)
					.then(function () {
						
						$rootScope.$emit('renderSubjectList', 'new subjects list');
						//$timeout(function () {
						//	$scope.subjects.push($scope.subject);
						//	ionicMaterialMotion.fadeSlideInRight({
						//		startVelocity: 3000
						//	});
						//}, 700);
					}, function (err) {
					});


			}
		});

	};
})

;
