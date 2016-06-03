'use strict';

angular.module('starter.services', [])
    .factory('ConfigurationService', function () {
        var userDetails = null;
        return {

            ServerUrl: function () {
                // return "https://chatad.herokuapp.com";
                // return "http://10.0.0.3:3000";
                return "http://192.168.1.21:3000";
            },
            UserDetails: function(){

                if(!userDetails){
                    userDetails = angular.fromJson(window.localStorage['user']);
                }
                return userDetails;
            }
        }
    })
    .factory('SubjectService', function ($http, $log, $q, ConfigurationService) {
        return {
            GetSubjects: function (userSubjects) {
                var deferred = $q.defer();
                $http.get(ConfigurationService.ServerUrl() + '/api/subjects?userSubjects='+userSubjects , {
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
            CreateSubject: function (subject) {
                var deferred = $q.defer();

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
            FBlogin: function () {
                var deferred = $q.defer();
                $cordovaFacebook.login(["public_profile", "email", "user_friends","user_birthday"]).then(
                    function success(result) {


                        window.localStorage['fbData'] = angular.toJson(result.authResponse);

                        $cordovaFacebook.api("me/?fields=id,name,first_name,last_name,picture", ["public_profile"])
                            .then(function(success) {
                                window.localStorage['fbName'] = success.name;
                                window.localStorage['fbFirstName'] = success.first_name;
                                window.localStorage['fbLastName'] = success.first_name;
                                window.localStorage['fbPicture'] = angular.toJson(success.picture);


                                deferred.resolve(success);
                                // success
                            }, function (error) {
                                // error
                            });
                    },
                    function error(reason) {
                        deferred.reject("Failed to login to facebook");
                    }
                );
                return deferred.promise;
            }
        }
    });