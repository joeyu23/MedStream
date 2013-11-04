//instantiate app for angular use
var MedStreamApp = angular.module('MedStream', [])
.factory('SocketFactory', function(){

  //instantiate client-side socket connection
  var socket = io.connect();
  socket.emit('ready');
  socket.emit('refresh');
  
  return socket;

})
.factory('KeywordChartFactory', function(){

  var data = [ ["doctor", 0], ["hospital", 0], ["patients", 0] ];
  var element = $('#KeywordChart');

  //instantiate flot.js
  var plot = $.plot("#KeywordChart", [ data ], {
    series: {
      bars: {
        show: true,
        barWidth: 0.5,
        align: "center"
      }
    },
    grid: {
      labelMargin: 25
    },
    xaxis: {
      mode: "categories",
      tickLength: 0,
      min: -.5,
      max: 2.5
    },
    yaxis: {
      min: 0,
      max: 75
    }
  });

  element.resize();

  return plot;

})
.factory('VolumeTimeChartFactory', function(){

  var data = [];
  var element = $('#VolumeTimeChart');

  //instantiate flot.js
  var plot = $.plot("#VolumeTimeChart", [ data ], {
    series: {
      lines: { show: true, fill: true },
      points: { show: true }
    },
    xaxis: {
      mode: "categories",
    },
    yaxis: {
      min: 0,
      // max: 9
    }
  });

  element.resize();

  return plot;

})
.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

//---- FEED CONTROLLER -----//
MedStreamApp.controller('FeedController', function FeedController($scope, SocketFactory) {
  //instantiate variables
  $scope.twitterfeed = [];

  $('#refresh-button').click(function(){
    SocketFactory.emit('refresh-route');
  });

  // When socket receives tweet, add to the recent tweet array
  SocketFactory.on('tweet-route', function(data){
    $scope.twitterfeed = data.recentTweets;
    $scope.$apply();
  });
});

//---- TOTAL TWEETS CONTROLLER -----//
MedStreamApp.controller('TotalTweetsController', function TotalTweetsController($scope, SocketFactory) {
  //instantiate variables
  $scope.totalTweets = 0;
  $scope.todaysTweets = 0;

  // When socket receives tweet, add to the recent tweet array
  SocketFactory.on('total-tweets-route', function(data){
    $scope.totalTweets = data.totalTweets;
    $scope.todaysTweets = data.todaysTweets;
    $scope.$apply();
  });

});

//---- KEYWORD CHART CONTROLLER -----//
MedStreamApp.controller('KeywordChartController', function KeywordChartController($scope, SocketFactory, KeywordChartFactory) {
  // When socket receives tweet, add to the recent tweet array
  SocketFactory.on('keywords-route', function(data){
    var newData = [ ["doctor", data.keywordOne], ["hospital", data.keywordTwo], ["patients", data.keywordThree] ];
    KeywordChartFactory.setData([ newData ]);
    KeywordChartFactory.draw();
  });

});

//---- VOLUME TIME CHART CONTROLLER -----//
MedStreamApp.controller('VolumeTimeChartController', function VolumeTimeChartController($scope, SocketFactory, VolumeTimeChartFactory) {
  // When socket receives tweet, add to the recent tweet array
  var newData = [];
  SocketFactory.on('volume-time-route', function(data){
    if (newData.length > 10)
    {
      newData.shift();
    }
    newData.push( [data.todaysTime, data.countPerInterval] );
    VolumeTimeChartFactory.setData([ newData ]);
    VolumeTimeChartFactory.setupGrid();
    VolumeTimeChartFactory.draw();
  });

});