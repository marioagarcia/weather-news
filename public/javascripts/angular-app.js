/**
 * Created by mario on 3/24/15.
 */
angular.module('weatherNews', ['ui.router'])
    .controller('MainCtrl', ['$scope', 'postFactory',
        function($scope, postFactory) {
            postFactory.getAll();
            $scope.test = 'Weather News!';
            $scope.posts = postFactory.posts;
            $scope.addPost = function() {
                if($scope.formName == '') { return; }
                postFactory.create({
                    name: $scope.formName,
                    title: $scope.formTitle,
                    upvotes: 0,
                    content: $scope.formContent,
                    comments: []
                });
                $scope.formName = '';
                $scope.formTitle = '';
                $scope.formContent = '';
            };
            $scope.incrementUpvotes = function(post) {
                postFactory.upvote(post);
            };
        }
    ])
    .controller('PostCtrl', [
        '$scope',
        '$stateParams',
        'postFactory',
        function($scope, $stateParams, postFactory) {
            console.log('stateParams.id: ' + $stateParams.id);
            //var post = postFactory.posts[$stateParams.id];
            postFactory.getPost($stateParams.id);
            $scope.post = postFactory.post;
            $scope.addComment = function(){
                if($scope.body === '') { return; }
                postFactory.addNewComment(postFactory.post._id, {
                    body:$scope.body
                }).success(function (comment) {
                    postFactory.post.comments.push(comment);
                });
                $scope.body = '';
            };
            $scope.incrementUpvotes = function(comment) {
                postFactory.upvoteComment(postFactory.post, comment);
            };
        }
    ])
    .factory('postFactory', ['$http', function($http) {
        var o = {
            posts: [],
            post: {}
        };
        o.getAll = function() {
            return $http.get('/posts').success(function(data){
                angular.copy(data, o.posts);
            });
        };
        o.getPost = function(id) {
            return $http.get('/posts/' + id).success(function(data){
                angular.copy(data, o.post);
            });
        };
        o.create = function(post) {
            return $http.post('/posts', post).success(function(data){
                o.posts.push(data);
            });
        };
        o.upvote = function(post) {
            return $http.put('/posts/' + post._id + '/upvote')
                .success(function(data) {
                    post.upvotes += 1;
                });
        };
        o.addNewComment = function (id, comment) {
            return $http.post('/posts/' + id + '/comments', comment);
        };
        o.upvoteComment = function(selPost, comment) {
            return $http.put('/posts/' + selPost._id + '/comments/'+ comment._id + '/upvote')
                .success(function(data){
                    comment.upvotes += 1;
                });
        };

        return o;
    }])
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: '/home.html',
                    controller: 'MainCtrl'
                })
                .state('posts', {
                    url: '/posts/{id}',
                    templateUrl: '/posts.html',
                    controller: 'PostCtrl'
                });
            $urlRouterProvider.otherwise('home');
        }]);