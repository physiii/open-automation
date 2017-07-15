angular.module('starter.controllers')

.controller('ClimateCtrl', function($scope, $rootScope, $stateParams, Categories, socket, $ionicLoading, $compile, $http) {

  console.log('<< ------- ClimateCtrl ------- >>');
  var relay_socket = $rootScope.relay_socket;

$scope.chartOptions = {
  chart: {
    renderTo: 'thermostat_schedule_container',
    animation: false
  },
  title: {text: '' },
  plotOptions: {
    series: {
      point: {
        events: {
          drag: function (e) { 
            $('#drag').html(
              'Dragging <b>' + this.series.name + '</b>, <b>' + this.category + '</b> to <b>' + Highcharts.numberFormat(e.y, 2) + '</b>');
            },
            drop: function (e) {

  for (var i = 0; i < devices.length; i++ ) {
    if ( devices[i].device_type === "thermostat" ) {
      var device = devices[i];
      var new_schedule = { device_type:device.device_type, local_ip:device.local_ip, token:device.token, time:this.category, temperature:Highcharts.numberFormat(e.y, 2) }
      relay_socket.emit('store_schedule',new_schedule);
console.log(new_schedule);
    }
  }  

              $('#drop').html(
              'In <b>' + this.series.name + '</b>, <b>' + this.category + '</b> was set to <b>' + Highcharts.numberFormat(this.y, 2) + '</b>');
            }
          }
        },
      stickyTracking: false
    },
    column: {stacking: 'normal'},
    line: {cursor: 'ns-resize'},    
    },
    xAxis: {
      categories: ['7 AM','9 AM','11 AM','1 PM','3 PM','5 PM','7 PM','9 PM','11 PM','1 AM','3 AM','5 AM'],
      type: 'datetime',
      title: {
      text: 'Time'
    }
  },
  yAxis: {
    title: {
      text: 'Temperature (°F)'
    },
      min: 60,max: 80
  },
  tooltip: {
    formatter: function() {
      return '<b>'+ this.series.name +'</b><br/>'+
      this.x +': '+ Math.round(this.y) +'°F';
    }
  },  
  series: [{
    name: 'set temperature',
    data: [68, 71, 73, 75, 74, 72, 70, 71, 71, 69, 68, 70],
    draggableY: true
  }]
};

  $scope.set_thermostat = function(command, device, gateway) {
  console.log("set_thermostat",command);
  //disable_update();
  if (!device.set_state) device.set_state = device.current_state;
  if (command === 'temp_down') {
    if (device.set_state.t_heat) {
      device.set_state.t_heat = Number(device.set_state.t_heat) - 1;
      device.set_state.set_temp = device.set_state.t_heat;
    }
    if (device.set_state.t_cool) {
      device.set_state.t_cool = Number(device.set_state.t_cool) - 1;
      device.set_state.set_temp = device.set_state.t_cool;
    }
  }
  if (command === 'temp_up') {
    if (device.set_state.t_heat) {
      device.set_state.t_heat = Number(device.set_state.t_heat) + 1;
      device.set_state.set_temp = device.set_state.t_heat;
    }
    if (device.set_state.t_cool) {
      device.set_state.t_cool = Number(device.set_state.t_cool) + 1;
      device.set_state.set_temp = device.set_state.t_cool;
    }
  }
  if (command === 'cool') { 
    device.current_state.tmode = 2;
    set_state.tmode = 2;
    set_state.t_cool = Number(device.current_state.t_heat);    
    device.state.mode = "cool";
    device.state.set_state = set_state;
    delete device.state.set_state.t_heat;
  }
  if (command === 'warm') {
    device.current_state.tmode = 1;
    set_state.tmode = 1;
    set_state.t_heat = Number(device.current_state.t_cool);
    device.state.mode = "heat";
    device.state.set_state = set_state;
    delete device.state.set_state.t_cool;      
  }
  if (command === 'power') { 
    device.current_state.tmode = 0;
    set_state.tmode = 0;
    device.state.mode = "off";
    device.state.set_temp = "OF";
    device.state.set_state = set_state;
    delete device.state.set_state.t_heat;
    delete device.state.set_state.t_cool;     
  }
  if (command === 'fan') {
    if (device.state.fan === "on") {
      device.current_state.fmode = 2;
      set_state.fmode = 2;
      device.state.fan = "off";
      device.state.set_state = set_state;
    }
    if (device.state.fan === "off") {
      device.current_state.fmode = 1;
      set_state.fmode = 1;
      device.state.fan = "on";      
      device.state.set_state = set_state;
    }
  }
  device.set_state.hold = 1;
  device.token = gateway.token;
  relay_socket.emit('set thermostat',device);

  var gateways = $rootScope.gateways;
  for (var i = 0; i < gateways.length; i++) {
    if (gateways[i].devices) {
      for (var j = 0; j < gateways[i].devices.length; j++) {
        if (gateways[i].devices[j]._id === device._id) {
          $rootScope.gateways[i].devices[j] = device;
          console.log('!! HIT !!',device);
    	    $rootScope.gateways = gateways;
            console.log('HIT HIT',gateways);
        }
      }
    }
  }
}

/*
therm_paused = false;
update_enabled = true;

function disable_update() {
  if (update_enabled) {
    update_enabled = false;
    setTimeout(function () {  
      update_enabled = true;
    }, 5000);    
  }
}
*/

})
