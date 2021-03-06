var apiURL = "https://immense-ravine-9825.herokuapp.com/";
//var apiURL = "http://localhost:3000/";

var farmApp = angular.module('farmApp', ['ngCookies']);

farmApp.controller('ScheduleCtrl', function($scope, $http, $cookieStore) {

  $scope.loadHappenings = function() {
    $http.get(apiURL + 'happenings.json?access_code=' + $scope.access_code)
    .success(function(data, status) {

      $cookieStore.put('access_code', $scope.access_code);

      $scope.happenings = data;

      if (status === 200) {
        $('.access-code').hide();

        // http://stackoverflow.com/a/27806458/4109697
        var repl = [];
        data.map(function(obj) {
            repl.push({
                title:  obj.subject,
                start:  obj.start_date,
                end:    moment(obj.end_date).add(1, 'day'),
                allDay: true
            });
        });

        $('.content').show();

        $('#calendar').fullCalendar({
          header: {
            left: 'title',
            center: '',
            right: 'today prev,next'
          }
        });
        $('#calendar').fullCalendar('removeEvents');
        $('#calendar').fullCalendar('addEventSource', repl);
      }
    }).error(function(data, status) {

      $('#submit_access_code').val('Submit');
      $('.message').text('');

      if (status === 401) {
        $('.error').text("Invalid access code.");
        $('.error').show();
      } else {
        $('.error').text("Unknown error.");
        $('.error').show();
      }
    });
  };

  $scope.addHappening = function() {
    $http.post(apiURL + 'happenings?access_code=' + $scope.access_code,
      {
        subject: $scope.subject,
        start_date: $scope.start_date,
        end_date: $scope.end_date
      })
    .success(function(data) {
      $scope.loadHappenings();
      $scope.subject = '';
      $scope.start_date = '';
      $scope.end_date = '';
    });
  };

  $scope.removeHappening = function(id) {
    $http.delete(apiURL + 'happenings/' + id + '?access_code=' + $scope.access_code)
    .success(function(data) {
      $scope.loadHappenings();
    });
  };

  $scope.checkCode = function() {
    $('#submit_access_code').val("Loading...");
    $('.message').text("It could take up to 10 seconds to load, please wait!");
    $scope.loadHappenings();
  };

  $('.start-date').datepicker({
    dateFormat: "M d, yy",
    onSelect: function(date) {

      // Set end date to be day after this
      var nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      $('.end-date').datepicker('option', 'defaultDate', nextDay);

      $scope[$(this).attr('ng-model')] = date;
      $scope.$apply();
    }
  });

  $('.end-date').datepicker({
    dateFormat: "M d, yy",
    onSelect: function(date) {

      // Set start date to be day before this
      var previousDay = new Date(date);
      previousDay.setDate(previousDay.getDate() - 1);
      $('.start-date').datepicker('option', 'defaultDate', previousDay);

      $scope[$(this).attr('ng-model')] = date;
      $scope.$apply();
    }
  });

  $scope.access_code = '';

  var stored_access_code = $cookieStore.get('access_code');
  if (stored_access_code) {
    $scope.access_code = stored_access_code;
    $('#submit_access_code').val("Loading...");
    $('.message').text("It could take up to 10 seconds to load, please wait!");
    $scope.loadHappenings();
  }

});
