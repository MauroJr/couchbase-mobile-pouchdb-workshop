// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform, $pouchDB) {
    $ionicPlatform.ready(function() {
        if(window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
    $pouchDB.setDatabase("nraboy-test");
    if(ionic.Platform.isAndroid()) {
        $pouchDB.sync("http://192.168.57.1:4984/test-database");
    } else {
        $pouchDB.sync("http://localhost:4984/test-database");
    }
})

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state("list", {
            "url": "/list",
            "templateUrl": "templates/list.html",
            "controller": "MainController"
        })
        .state("item", {
            "url": "/item/:documentId/:documentRevision",
            "templateUrl": "templates/item.html",
            "controller": "MainController"
        });
    $urlRouterProvider.otherwise("list");
})

.controller("MainController", function($scope, $rootScope, $state, $stateParams, $ionicHistory, $pouchDB) {

    $scope.items = {};

    $pouchDB.startListening();

    // STEP 6: Listening for Broadcasts in the AngularJS Controller

    $rootScope.$on("$pouchDB:delete", function(event, data) {
        delete $scope.items[data.doc._id];
        $scope.$apply();
    });

    if($stateParams.documentId) {
        $pouchDB.get($stateParams.documentId).then(function(result) {
            $scope.inputForm = result;
        });
    }

    $scope.save = function(firstname, lastname, email) {
        var jsonDocument = {
            "firstname": firstname,
            "lastname": lastname,
            "email": email
        };
        if($stateParams.documentId) {
            jsonDocument["_id"] = $stateParams.documentId;
            jsonDocument["_rev"] = $stateParams.documentRevision;
        }
        $pouchDB.save(jsonDocument).then(function(response) {
            $state.go("list");
        }, function(error) {
            console.log("ERROR -> " + error);
        });
    }

    $scope.delete = function(id, rev) {
        $pouchDB.delete(id, rev);
    }

    $scope.back = function() {
        $ionicHistory.goBack();
    }

})

.service("$pouchDB", ["$rootScope", "$q", function($rootScope, $q) {

    var database;
    var changeListener;

    // STEP 1: Creating a New PouchDB Local Database

    // STEP 2: Creating a Function for Saving Documents to the Database

    // STEP 3: Listening for Changes in the PouchDB Service

    // STEP 4: Retrieving a Particular Document in the PouchDB Service

    this.stopListening = function() {
        changeListener.cancel();
    }

    // STEP 5: Syncing with Couchbase Sync Gateway via the PouchDB Service

    this.delete = function(documentId, documentRevision) {
        return database.remove(documentId, documentRevision);
    }

    this.destroy = function() {
        database.destroy();
    }

}]);
