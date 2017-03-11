.controller('VideoCtrl', function($scope, $rootScope, $stateParams, socket, $ionicLoading, $compile, $http) {
  var relay_socket = $rootScope.relay_socket;
  console.log("<< ------  VideoCtrl  ------ >> ");
  
  $scope.start_stream = function(mac) {
    var gateways = $rootScope.gateways;
    var i = $rootScope.find_index(gateways,"mac",mac);
    document.getElementById("play-button_"+mac).style.display = "none";
    document.getElementById("previewCanvas_"+mac).style.display = "none";
    document.getElementById("videoCanvas_"+mac).style.display = "inline";
    if (gateways[i].stream_started) return console.log("stream already started");
    gateways[i].camera_socket = 'ws://'+$rootScope.server_ip+':8084';
    console.log('token for video stream',gateways[i].token);
    gateways[i].stream_started = true;
    gateways[i].canvas = document.getElementById('videoCanvas_'+gateways[i].mac);
    gateways[i].player = new JSMpeg.Player(gateways[i].camera_socket, {canvas:gateways[i].canvas,token:gateways[i].token});
  }

  $scope.start_webcam = function(gateway) {
    var command = {token:gateway.token, command:"start_webcam"}
    relay_socket.emit('ffmpeg',command);
    $scope.start_stream(gateway.mac);
  }
  
  $scope.play_file = function(file, gateway) {
    file = file.folder + "/" + file[8];
    var file_obj = {file:file, token:gateway.token}
    var command = {file:file, token:gateway.token, command:"play_file"}
    relay_socket.emit('ffmpeg',command);
    $scope.flip();
    console.log("play_file",file_obj);
    $scope.start_stream(gateway.mac);
  }

  $scope.list_folder = function (gateway) {
    $scope.flip();
    relay_socket.emit('folder list',{token:gateway.token,folder:"/var/lib/motion"});
  }

  $scope.select_item = function (item, gateway) {
    if (item[8].indexOf(".avi") > -1) {
      $scope.play_file(item, gateway);
      return;
    }
    var folder = item.folder + "/" + item[8];
    console.log("item: ",item.folder);
    relay_socket.emit('folder list',{token:gateway.token,folder:folder});
  }

  $scope.select_month = function(month, gateway) {
    var index = $rootScope.find_index($rootScope.gateways,'token',gateway.token);
    $rootScope.gateways[index].motion_list.selected_month = month;
    document.getElementById("motion_list_months").style.display = "none";
  }

  $scope.select_day = function(day, month, gateway) {
    document.getElementById("motion_list_days").style.display = "none";
    var motion_list = gateway.motion_list;
    motion_list.selected_day = {day:day,files:[]};
    for (var i = 0; i < motion_list.length; i++) {
      if (motion_list[i].length < 1) continue;
      if (motion_list[i][8][1] != "avi") continue;
      if (motion_list[i][5][2] == day)
        motion_list.selected_day.files.push(motion_list[i]);
    }
    console.log("select_day",motion_list.selected_day);
    var index = $rootScope.find_index($rootScope.gateways,'token',gateway.token);
    console.log(motion_list.selected_month.days);
    motion_list.selected_month.days = [];
    $rootScope.gateways[index].motion_list = motion_list;
    document.getElementById("motion_list_days").style.display = "none";
  }

  $scope.fullscreen = function(div_id) { 
    console.log("fullscreen",div_id);
    if (document.getElementById(div_id).className == "") {
      document.getElementById(div_id).className = "col-lg-4 col-md-6 col-sm-12";
    } else document.getElementById(div_id).className = "";
  }
})

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
  relay_socket.emit('set_thermostat',device);

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
