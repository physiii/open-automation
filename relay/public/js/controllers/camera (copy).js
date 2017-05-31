angular.module('starter.controllers')
.controller('CameraCtrl', function($scope, $rootScope, $stateParams, socket, $ionicLoading, $compile, $http) {
  var relay_socket = $rootScope.relay_socket;
  console.log("<< ------  CameraCtrl  ------ >> ");
  
  get_camera_list();
  function get_camera_list() {
    var gateways = $rootScope.gateways;
    for (var i = 0; i < gateways.length; i++) {
      relay_socket.emit('get camera list',gateways[i]);
      //console.log('get_camera_list',gateways[i].mac);
    }
  }

  relay_socket.on('camera list', function (data) {
    var camera_list = data.stdout.split(/(?:\r\n|\r|\n)/g);
    camera_list.splice(0,1);
    camera_list.splice(camera_list.length - 1,1);

    for (var i = 0; i < camera_list.length; i++) {
      var parts = camera_list[i].split(" ");
      parts = parts[9].replace("/dev/video","");
      if (parts.length <= 1) {
        camera_list.splice(i,1);
        i--;
        continue;
      }
      if (parts[parts.length - 1] != '0') {
        camera_list.splice(i,1);
        i--;
        continue;
      }
      camera_list[i] = {camera_number:parts};

      /*for (var k = 0; k < parts.length; k++) {
        if (parts[k].length < 1) {
          parts.splice(k,1);
          k--;
        }
      }*/


      /*
      //format date
      parts[5] = parts[5].split("-");

      //format time
      parts[6] = parts[6].split(":");
      
      

      parts.name = parts[8];
      camera_list[i] = parts;
      if (camera_list[i][8].indexOf(".avi") > -1) play_all_btn = true;*/
    }
    $scope.$apply(function () {
      var index = $rootScope.find_index($rootScope.gateways,'token',data.token);
      $rootScope.gateways[index].camera_list = camera_list;
      //console.log("camera list | ",camera_list);
    });
  });

  relay_socket.on('camera preview', function (data) {
    if (!data.camera_number) camera_number = "10";
    var ctx = document.getElementById('previewCanvas_'+data.mac+'_'+camera_number).getContext('2d');
    var img = new Image();
    img.src = 'data:image/jpeg;base64,' + data.image;
    console.log("camera preview",data.mac);
    ctx.drawImage(img, 0, 0, 250, 150);
  });

  $scope.start_webcam = function(gateway, camera_number) {
    if (!camera_number) camera_number = "20";
    var command = {token:gateway.token, command:"start_webcam", camera_number:camera_number}
    relay_socket.emit('ffmpeg',command);
    $scope.start_stream(gateway.mac, camera_number);
  }

  $scope.start_stream = function(mac, camera_number) {
    var gateways = $rootScope.gateways;
    var i = $rootScope.find_index(gateways,"mac",mac);
    var j = $rootScope.find_index(gateways[i].camera_list,"camera_number",camera_number);

    if (gateways[i].camera_list[j].stream_started) return console.log("stream already started");
    gateways[i].camera_list[j].camera_socket = 'ws://'+$rootScope.server_ip+':8084';
    gateways[i].camera_list[j].stream_started = true;
    gateways[i].camera_list[j].canvas = document.getElementById('videoCanvas_'+mac+'_'+camera_number);
    gateways[i].camera_list[j].player = new JSMpeg.Player(gateways[i].camera_list[j].camera_socket, {canvas:gateways[i].camera_list[j].canvas,token:gateways[i].token, camera:camera_number});
    console.log("camera_list: ",gateways[i].camera_list[j]);

    document.getElementById("play-button_"+mac+'_'+camera_number).style.display = "none";
    document.getElementById("previewCanvas_"+mac+'_'+camera_number).style.display = "none";
    document.getElementById("videoCanvas_"+mac+'_'+camera_number).style.display = "inline";
  }
  
  $scope.play_file = function(file, gateway) {
    file = file.folder + "/" + file[8];
    var file_obj = {file:file, token:gateway.token}
    var command = {file:file, token:gateway.token, command:"play_file"}
    relay_socket.emit('ffmpeg',command);
    console.log("play_file",file_obj);
    $scope.start_stream(gateway.mac);
  }

  $scope.play_folder = function(folder, gateway) {
    /*for (var i =1; i < folder_list.length; i++) {
      if (folder_list[i].name == "images") continue;
      if (folder_list[i].name == "play all") continue;
      folder_list[i] = "file '" + folder_list[i].folder + "/" + folder_list[i].name +"'";
    }*/
    var command = {folder:folder, token:gateway.token, command:"play_folder"};
    console.log("play_folder",command);
    relay_socket.emit('ffmpeg',command);
    $scope.flip();
    $scope.start_stream(gateway.mac);
  }
    console.log("SCOPE: ",$scope);
  $scope.list_folder = function (gateway, $scope) {
    console.log($scope);
    console.log("list folder!!!");
    relay_socket.emit('folder list',{token:gateway.token,folder:"/var/lib/motion"});
  }

  $scope.select_item = function (item, gateway) {
    if (item[8])
      if (item[8].indexOf(".avi") > -1) {
        $scope.play_file(item, gateway);
        return;
    }

    var folder = item.folder + "/" + item[8];
    if (item.name == "play all" ) {
      $scope.play_folder(item.folder, gateway);
      return console.log("play all | " + item);
    }
    relay_socket.emit('folder list',{token:gateway.token,folder:folder});
  }

  /*$scope.select_month = function(month, gateway) {
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
  }*/

  $scope.fullscreen = function(div_id) { 
    console.log("fullscreen",div_id);
    if (document.getElementById(div_id).className == "") {
      document.getElementById(div_id).className = "col-lg-4 col-md-6 col-sm-12";
    } else document.getElementById(div_id).className = "";
  }

  relay_socket.on('folder list result', function (data) {
    var play_all_btn = false;
    var folder_list = data.stdout.split(/(?:\r\n|\r|\n)/g);
    folder_list.splice(0,1);
    folder_list.splice(folder_list.length - 1,1);

    for (var i = 0; i < folder_list.length; i++) {
      var parts = folder_list[i].split(" ");
      if (parts.length < 8) continue;
      parts.folder = data.folder;
      for (var k = 0; k < parts.length; k++) {
        if (parts[k].length < 1) {
          parts.splice(k,1);
          k--;
        }
      }

      //format date
      parts[5] = parts[5].split("-");

      //format time
      parts[6] = parts[6].split(":");
      
      
      if (parts[8].charCodeAt(0) == 46) {
        if (parts[8].charCodeAt(1) == 46) {
        } else if (parts[8].length < 2) {
          folder_list.splice(i,1);
          i--;
          continue;
        }
      }
      parts.name = parts[8];
      folder_list[i] = parts;
      if (folder_list[i][8].indexOf(".avi") > -1) play_all_btn = true;
      console.log("folder list result | ",data.mac);
    }
    if (play_all_btn) {
      folder_list.push({name:"play all", folder:parts.folder})
    }
    $scope.$apply(function () {
      var index = $rootScope.find_index($rootScope.gateways,'token',data.token);
      $rootScope.gateways[index].folder_list = folder_list;
    });
  });

})
