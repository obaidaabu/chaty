// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.directives', 'ionic-material', 'ionMdInput', 'firebase', 'ngCordova', 'angularMoment'])

	.run(function ($ionicPlatform, $state) {
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
			//window.localStorage.clear();
			if (window.localStorage['user']) {
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
		});
	})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    // Turn off caching for demo simplicity's sake
    $ionicConfigProvider.views.maxCache(0);

    /*
    // Turn off back button text
    $ionicConfigProvider.backButton.previousTitleText(false);
    */

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
                template: '<button ng-controller="FabCtrl" ng-click="filter()"  id="fab-friends" class="messages-btn button button-fab button-fab-top-right expanded button-energized-900 spin"><i class="icon ion-ios-settings"></i></button>',
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
				    template: '<button ng-controller="FabCtrl" ng-click="saveSubject()" id="fab-friends" class="add-subject-btn button button-fab button-fab-top-right button-energized-900"><i class="icon ion-leaf"></i></button>'

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
            'fabContent': {
                template: ''
            }
        }
    })
        .state('app.chat', {
            url: '/chat/:conversationId/:lastMessageKey/:userName/:subjectName',
            views: {
                'menuContent': {
                    templateUrl: 'templates/chat.html',
                    controller: 'ChatCtrl'
                }
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
                template: '<button id="fab-gallery" class="button button-fab button-fab-top-right expanded button-energized-900 drop"><i class="icon ion-heart"></i></button>',
                controller: function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-gallery').classList.toggle('on');
                    }, 600);
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
        url: '/profile',
        views: {
            'menuContent': {
                templateUrl: 'templates/profile.html',
                controller: 'ProfileCtrl'
            },
            'fabContent': {
                template: '<button ng-controller="FabCtrl" ng-click="createSubject()" id="fab-profile" class="add-subject-btn button button-fab button-fab-bottom-right button-energized-900"><i class="icon ion-plus"></i></button>'
            }
        }
    })
    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
});
