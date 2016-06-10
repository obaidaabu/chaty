'use strict';

angular.module('starter.services', [])
    .factory('ConfigurationService', function () {
        var userDetails = null;
        return {

            ServerUrl: function () {
                // return "https://chatad.herokuapp.com";
                // return "http://10.0.0.3:3000";
                return "http://localhost:3000";
            },
            UserDetails: function(){

                if(!userDetails){
                    if(window.localStorage['user']){
                        userDetails = angular.fromJson(window.localStorage['user']);
                    }
                }
                return userDetails;
            }
        }
    })
    .factory('SubjectService', function ($http, $log, $q, ConfigurationService,$cordovaGeolocation) {
        return {
            GetCategories: function () {
                var deferred = $q.defer();
                $http.get(ConfigurationService.ServerUrl() + '/api/subjects/categories' , {
                    headers: {
                        "access-token": ConfigurationService.UserDetails().token
                    }
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (msg, code) {
                    deferred.reject(msg);
                    //   $log.error(msg, code);
                });
                return deferred.promise;
            },
            GetSubjects: function (userSubjects,userId) {
                var deferred = $q.defer();
                if(userId == undefined){
                    userId = null;
                }
                var myFilter={};
                if(window.localStorage["myFilter"]) {
                     myFilter=angular.fromJson(window.localStorage["myFilter"]);
                }
                else {
                    myFilter = {
                        nearMe: false,
                        gender: 'both',
                        categories: {}
                    }
                    window.localStorage["myFilter"]=angular.toJson(myFilter);
                }
                if(myFilter.nearMe) {
                    var posOptions = {timeout: 10000, enableHighAccuracy: false};
                    $cordovaGeolocation
                        .getCurrentPosition(posOptions)
                        .then(function (position) {
                            var lat = position.coords.latitude;
                            var long = position.coords.longitude;
                            myFilter.locationCoords=[lat,long];
                            tryPost();
                        }, function (err) {
                            myFilter.locationCoords=[];
                            tryPost();
                            // error
                        });
                }
                else
                {
                    myFilter.locationCoords=[];
                    tryPost();
                }
                myFilter.categories= Object.keys(myFilter.categories);
                function tryPost() {
                    $http.post(ConfigurationService.ServerUrl() + '/api/subjects/filter?userSubjects=' + userSubjects + '&userId=' + userId, myFilter, {
                        headers: {
                            "access-token": ConfigurationService.UserDetails().token
                        }
                    }).success(function (data) {
                        deferred.resolve(data);
                    }).error(function (msg, code) {
                        deferred.reject(msg);
                        //   $log.error(msg, code);
                    });
                }
                return deferred.promise;
            },
            CreateSubject: function (subject) {
                var deferred = $q.defer();
                var posOptions = {timeout: 10000, enableHighAccuracy: false};
                $cordovaGeolocation
                    .getCurrentPosition(posOptions)
                    .then(function (position) {
                        var lat = position.coords.latitude;
                        var long = position.coords.longitude;
                        subject.locationCoords=[lat,long];
                        tryPost();
                    }, function (err) {
                        subject.locationCoords=[];
                        tryPost();
                        // error
                    });
                function tryPost() {

                    $http.post(ConfigurationService.ServerUrl() + '/api/subjects',
                        subject
                        , {
                            headers: {
                                "access-token": ConfigurationService.UserDetails().token
                            }
                        }).success(function (data) {
                        deferred.resolve(data);
                    }).error(function (msg, code) {
                        deferred.reject(msg);
                        //   $log.error(msg, code);
                    });
                }
                return deferred.promise;
            },
            DeleteSubjects: function (subject) {
                var deferred = $q.defer();
                $http.delete(ConfigurationService.ServerUrl() + '/api/subjects?_id='+ subject._id, {
                    headers: {
                        "access-token": ConfigurationService.UserDetails().token
                    }
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (msg, code) {
                    deferred.reject(msg);
                    //   $log.error(msg, code);
                });
                return deferred.promise;
            }
        }
    })
    .factory('UserService', function ($http, $log, $q ,$cordovaFacebook, ConfigurationService) {
        return {
            CreateUser: function (user) {
                var deferred = $q.defer();

                $http.post(ConfigurationService.ServerUrl() + '/api/users',
                    user
                    , {
                        headers: {
                            "Content-Type":"application/json"
                        }
                    }).success(function (data) {
                        deferred.resolve(data);
                    }).error(function (msg, code) {
                        deferred.reject(msg);
                        //   $log.error(msg, code);
                    });
                return deferred.promise;
            },
            GetUser: function (userId) {
                var deferred = $q.defer();
                $http.get(ConfigurationService.ServerUrl() + '/api/users/'+userId, {
                    headers: {
                        "access-token": ConfigurationService.UserDetails().token
                    }
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (msg, code) {
                    deferred.reject(msg);
                    //   $log.error(msg, code);
                });
                return deferred.promise;
            },
            FBlogin: function () {
                var deferred = $q.defer();
                $cordovaFacebook.login(["public_profile", "email", "user_friends","user_birthday"]).then(
                    function success(result) {
                        window.localStorage['fbData'] = angular.toJson(result.authResponse);
                    },
                    function error(reason) {
                        deferred.reject("Failed to login to facebook");
                    }
                );
                return deferred.promise;
            }
        }
    })
    .factory('EntityService', function (ConfigurationService) {
        var otherProfile = null;
        var messageToDeal = null;
        var messages = [];
        var deleteFromArray = function(array,item){
            for(var i=0; i<array.length;i++){
                if(array[i]._id == item._id) {
                    array.splice(i,1);
                }
            }
        };
        var setProfile = function(user){
            otherProfile = user;
        }

        var getOtherProfile = function(){
            return otherProfile;
        }

        var setMessageDetails = function(message){
            messageToDeal = message;
        }

        var getMessageDetails = function(){
            return messageToDeal;
        }
        var setMessages = function(snapshot){
            var userDetails=ConfigurationService.UserDetails();
            angular.forEach(snapshot.val(), function (value, key) {
                var conversationId = key;
                var messagesArray = Object.getOwnPropertyNames(value.messages);

                var lastMessageKey = messagesArray[messagesArray.length - 1];


                var lastMessage = value.messages[lastMessageKey].body;
                var lastSender = value.messages[lastMessageKey].sender;
                var createrId = conversationId.split("-")[0];
                var readMessage = true;
                if (lastSender === userDetails._id) {
                    readMessage = true;
                } else {
                    if (window.localStorage['messages'] && lastSender != userDetails._id) {
                        var localMessages = angular.fromJson(window.localStorage['messages']);

                        var messagIndexx = common.indexOfConv(localMessages, conversationId);

                        if (messagIndexx === -1) {
                            readMessage = false;
                        }
                        else {
                            if (localMessages[messagIndexx].lastMessageKey != lastMessageKey) {
                                readMessage = false;
                            }
                        }
                    } else {
                        readMessage = false;
                    }
                }
                var indexx = common.indexOfConv(messages, conversationId);
                var msg = {
                    conversationId: conversationId,
                    lastMessage: lastMessage,
                    lastMessageKey: lastMessageKey,
                    subjectName: value.subjectName,
                    fbPhotoUrl: value.fbPhotoUrl,
                    userName: value.userName,
                    //online: online,
                    readMessage: readMessage

                }

                if (indexx === -1) {
                    messages.push(msg);
                }
                else {
                    messages[indexx] = msg;

                }
                var userRef = new Firebase('https://chatoi.firebaseio.com/presence/' + createrId);
                userRef.on("value", function (userSnapshot) {

                    var online = true;
                    if (userSnapshot.val() == 'offline') {
                        online = false;

                    }

                    var indexx = common.indexOfConv(messages, conversationId);

                    messages[indexx].online = online


                });
            });
        }
        var getMessages = function(){
            return messages;
        }
        return {
            deleteFromArray : deleteFromArray,
            setProfile : setProfile,
            getOtherProfile: getOtherProfile,
            setMessageDetails : setMessageDetails,
            getMessageDetails: getMessageDetails,
            setMessages: setMessages,
            getMessages: getMessages
        };
    });