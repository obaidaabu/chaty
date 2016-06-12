// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.directives', 'ionic-material', 'ionMdInput', 'firebase', 'ngCordova', 'angularMoment'])

	.run(function ($ionicPlatform, $state, $timeout, UserService, EntityService) {
        $ionicPlatform.on('pause', function() {
            Firebase.goOffline();

        });
        $ionicPlatform.on('resume', function() {
            Firebase.goOnline();

        });

		$ionicPlatform.ready(function () {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			}
			if (window.StatusBar) {
				// org.apache.cordova.statusbar required
				StatusBar.styleDefault();
			}
            if(window.cordova && typeof window.plugins.OneSignal != 'undefined'){
                var notificationOpenedCallback = function (jsonData) {

                    var messageDetails = {
                        conversationId: jsonData.additionalData.conversationId,
                        userName: jsonData.additionalData.userName,
                        subjectName: jsonData.additionalData.subjectName,
                        fbPhotoUrl: jsonData.additionalData.fbPhotoUrl
                    }
                    EntityService.setMessageDetails(messageDetails);
                    $timeout(function(){
                        $state.go("app.chat",{conversationId: jsonData.additionalData.conversationId});
                    },500)


                };
                window.plugins.OneSignal.init("ee6f85c1-a2ff-4d1b-9fa6-29dd4cc306ef",
                    { googleProjectNumber: "238478083352" },
                    notificationOpenedCallback);
                window.plugins.OneSignal.enableNotificationsWhenActive(false);
            }

			//window.localStorage.clear();
			if (window.localStorage['user']) {
                UserService.CheckUser()
                    .then(function (user) {
                        if(user.isNeedLogin === false){

                            var user = angular.fromJson(window.localStorage['user']);
                            var ref = new Firebase("https://chatoi.firebaseio.com");

                            ref.authWithCustomToken(user.fireToken, function (error, authData) {

                                if (error) {
                                    console.log("Login Failed!", error);
                                } else {
                                    $state.go("app.subjects");
                                }
                            });
                        }
                        else{
                            $state.go("login");
                        }
                    }, function (err) {
                    });
			}else{
                $state.go("login");
            }
		});
	})

    .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $ionicConfigProvider.views.maxCache(0);


        $stateProvider.state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'AppCtrl'
        })

        .state('app.subjects', {
            url: '/subjects',
            views: {
                'menuContent': {
                    templateUrl: 'templates/subjects.html',
                    controller: 'SubjectsCtrl'
                },
                'fabContent': {
                    template: '<button ng-controller="FabCtrl" ng-click="filter()"  id="fab-friends" class="messages-btn button button-fab button-fab-top-right expanded button-energized-900 spin"><i class="icon ion-android-options"></i></button>',
                    controller: function ($timeout) {
                        $timeout(function () {
                            document.getElementById('fab-friends').classList.toggle('on');
                        }, 900);
                    }
                }
            }
        })
	    .state('app.addSubject', {
		    url: '/addSubject',
		    views: {
			    'menuContent': {
				    templateUrl: 'templates/addSubject.html',
				    controller: 'AddSubjectCtrl'
			    },
			    'fabContent': {
				    //template: '<button ng-controller="FabCtrl" ng-click="saveSubject()"  id="fab-friends" class="messages-btn button button-fab button-fab-top-right expanded button-energized-900 spin"><i class="icon ion-leaf"></i></button>'
				    //controller: function ($timeout) {
					 //
				    //}
				    template: '<button ng-controller="FabCtrl" ng-click="saveSubject()" id="fab-friends" class="add-subject-btn button button-fab button-fab-top-right button-energized-900"><i class="icon ion-checkmark"></i></button>'

			    }
		    }
	    })

        .state('app.messages', {
            url: '/messages',
            views: {
                'menuContent': {
                    templateUrl: 'templates/messages.html',
                    controller: 'MessagesCtrl'
                },
                'fabContent': ''

            }
        })
        .state('app.chat', {
            url: '/chat/:conversationId/:userName/:subjectName',
            views: {
                'menuContent': {
                    templateUrl: 'templates/chat.html',
                    controller: 'ChatCtrl'
                },
                'fabContent': ''
            }
        })
        .state('app.gallery', {
            url: '/gallery',
            views: {
                'menuContent': {
                    templateUrl: 'templates/gallery.html',
                    controller: 'GalleryCtrl'
                },
                'fabContent': {
                    template: '<button  id="fab-subjects" class="messages-btn button button-fab button-fab-top-right expanded button-energized-900 spin"><i class="icon ion-ios-settings"></i></button>',
                    controller: function ($timeout) {
                        $timeout(function () {
                            document.getElementById('fab-subjects').classList.toggle('on');
                        }, 900);
                    }
                }
            }
        })

        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginCtrl'

        })

        .state('app.profile', {
            url: '/profile/:otherProfile',
            views: {
                'menuContent': {
                    templateUrl: 'templates/profile.html',
                    controller: 'ProfileCtrl'
                },
                'fabContent': {
                    template: '<button ng-controller="FabCtrl" ng-click="createSubject()" id="fab-profile" class="add-subject-btn button button-fab button-fab-bottom-right button-energized-900"><i class="icon ion-plus"></i></button>'
                }
            }
        });

});
