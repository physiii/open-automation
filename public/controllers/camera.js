angular.module('open-automation')
.controller('CameraCtrl', function($scope, $rootScope, socket, $compile, $http, $mdMedia) {
  console.log("<< ------  CameraCtrl  ------ >> ");
  var TAG = "[camera]";
  var stream_port = "8084";
  var relay_socket = $rootScope.relay_socket;
  var devices = $rootScope.devices;
  $scope.flip_card = false;
  $scope.video_sm = $mdMedia('sm');
  //console.log(TAG,$scope.video_sm);
  // ------------- //
  // sockets calls //
  // ------------- //

  relay_socket.on('camera preview', function (data) {
    var camera_number = data.camera_number;
    var mac = data.mac;
    var preview_canvas = document.getElementById('previewCanvas_'+mac+'_'+camera_number);
    if (!preview_canvas) return console.log(TAG,"camera preview | div not found",mac,camera_number);
    
    preview_canvas.width = preview_canvas.parentElement.clientWidth;
    preview_canvas.height = preview_canvas.parentElement.clientHeight;

    var ctx = preview_canvas.getContext('2d');
    var img = new Image();
    img.src = 'data:image/png;base64,' + data.image;
    setTimeout(function () { //put at end of main loop so images can load
      ctx.drawImage(img, 0, 0, preview_canvas.width, preview_canvas.height);
    },0);
    console.log(TAG,"camera preview",mac,camera_number);
  });


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
      if (folder_list[i][8].indexOf(".avi") > -1) {
        play_all_btn = true;
      }
    }
    if (play_all_btn) {
      folder_list.unshift({name:"play all", folder:parts.folder})
    }
    $scope.$apply(function () {
      var devices = $rootScope.devices;
      var i = $rootScope.find_index(devices,"id",data.id);
      if (i < 0) return console.log("camera not found",data);

      $rootScope.devices[i].folder_list = folder_list;
      console.log("folder list result | ",folder_list);
    });
  });

  // ---------------- //
  // camera functions //
  // ---------------- //

  $scope.set_motion_area = function(device) {
    var data = {token:device.token, motion_area:device.set_motion_area};
    relay_socket.emit('set resolution',data);
    console.log("set resolution",device.name,data);
  }

  $scope.set_device_settings = function(device) {
    var data = {token:device.token, id:device.id, settings:device.set_settings};
    relay_socket.emit('set device settings',data);
    console.log("set device settings",device);
  }

  $scope.set_rotation = function(device) {
    var data = {token:device.token, rotation:device.set_rotation};
    relay_socket.emit('set rotation',data);
    console.log("set rotation",device.name,data);
  }

  $scope.set_resolution = function(device) {
    var data = {token:device.token, resolution:device.set_resolution};
    relay_socket.emit('set resolution',data);
    console.log("set resolution",device.name,data);
  }

  $scope.command = function(device) {
    command_obj = {token:device.token, command:device.command}
    console.log("command",command_obj);
    relay_socket.emit('command',command_obj);
  }

  $scope.start_webcam = function(id) {
    var devices = $rootScope.devices;

    var i = $rootScope.find_index(devices,"id",id);
    if (i < 0) return console.log("device not found",id);
    var device = devices[i];

    device.videoCanvas.show = true;
    device.previewCanvas.show = false;

    device.show_main = true;
    if (device.stream_started) return console.log("stream already started");
    device.camera_socket = 'ws://'+$rootScope.server_ip+':'+stream_port;
    //device.stream_started = true;
    device.canvas = document.getElementById('videoCanvas_'+device.id);
    device.player = new JSMpeg.Player(devices[i].camera_socket, 
      {canvas:device.canvas,token:device.token, camera:device.camera_number});

    var command = {token:device.token, command:"start_webcam", camera_number:device.camera_number};
    relay_socket.emit('ffmpeg',command);
    return console.log(TAG,"start_webcam",command);
  }

  $scope.stop_webcam = function(id) {
    var devices = $rootScope.devices;

    var i = $rootScope.find_index(devices,"id",id);
    if (i < 0) return console.log("device not found",id);
    var device = devices[i];

    device.videoCanvas.show = false;
    device.previewCanvas.show = true;

    device.show_main = true;
    //if (device.stream_started) return console.log("stream already started");
    //device.camera_socket = 'ws://'+$rootScope.server_ip+':'+stream_port;
    //device.stream_started = true;
    //device.canvas = document.getElementById('videoCanvas_'+device.id);
    //device.player = new JSMpeg.Player(devices[i].camera_socket, 
    //  {canvas:device.canvas,token:device.token, camera:device.camera_number});

    var command = {token:device.token, command:"stop_webcam", camera_number:device.camera_number};
    relay_socket.emit('ffmpeg',command);
    return console.log(TAG,"stop_webcam",command);
  }


  $scope.start_stream = function(id) {

  }
  
  $scope.play_file = function(file, device) {
    file = file.folder + "/" + file[8];
    //var file_obj = {file:file, token:device.token}

    device.show_canvas = true;
    device.videoCanvas.show = true;
    device.previewCanvas.show = false;

    device.show_dashboard = false;
    device.show_recordings = false;
    device.show_main = true;

    //document.getElementById("videoCanvas_"+device.id).style.display = "inline";
    //if (device.stream_started) return console.log("stream already started");

    device.camera_socket = 'ws://'+$rootScope.server_ip+':'+stream_port;
    //device.stream_started = true;
    device.canvas = document.getElementById('videoCanvas_'+device.id);
    device.player = new JSMpeg.Player(device.camera_socket, 
      {canvas:device.canvas,token:device.token, camera:device.camera_number});

    var command = {file:file, token:device.token, command:"play_file", camera_number:device.camera_number, id:device.id}
    relay_socket.emit('ffmpeg',command);

    return console.log("play_file",command);

  }

  $scope.play_folder = function(folder, device) {

    device.show_canvas = true;
    device.videoCanvas.show = true;
    device.previewCanvas.show = false;

    device.show_dashboard = false;
    device.show_recordings = false;
    device.show_main = true;

    device.camera_socket = 'ws://'+$rootScope.server_ip+':'+stream_port;
    device.canvas = document.getElementById('videoCanvas_'+device.id);
    device.player = new JSMpeg.Player(device.camera_socket, 
      {canvas:device.canvas,token:device.token, camera:device.camera_number});

    var command = {folder:folder, token:device.token, command:"play_folder", camera_number:device.camera_number, id:device.id};
    console.log("play_folder",command);
    relay_socket.emit('ffmpeg',command);
    $scope.start_stream(device.id);
  }

  $scope.select_item = function (item, device) {
    var camera_number = device.camera_number;
    if (item[8])
      if (item[8].indexOf(".avi") > -1) {
        $scope.play_file(item, device);
        return;
    }

    var folder = item.folder + "/" + item[8];
    if (item.name == "play all" ) {
      $scope.play_folder(item.folder, device, device.camera_number);
      return console.log("play all | " + item);
    }
    relay_socket.emit('folder list',{token:device.token,folder:folder, camera_number:device.camera_number, id:device.id});
  }

  $scope.fullscreen = function(device) {
    console.log("fullscreen",device);
  }


  $scope.show_main = function(device) { 
    device.show_dashboard = false;
    device.show_dashboard_btn = true;
    device.show_main_btn = false;
    device.show_recordings = false;
    device.show_settings = false;
    device.show_statistics = false;
    device.show_canvas = true;
    //device.span = {row:0, col:1}
    console.log("show_dashboard",device.mac);
  }

  $scope.show_dashboard = function(device) { 
    device.show_dashboard = true;
    device.show_dashboard_btn = false;
    device.show_main_btn = true;
    device.show_recordings = false;
    device.show_settings = false;
    device.show_statistics = false;
    device.show_canvas = false;
    //device.span = {row:0, col:1}
    console.log("show_dashboard",device.mac);
  }

  $scope.show_statistics = function(device) { 
    device.show_statistics = true;
    device.show_dashboard = false;
    device.show_settings = false;
    device.show_recordings = false;
    console.log("show_statistics",device.show_statistics);
  }


  $scope.show_recordings = function(device) { 
    device.show_recordings = true;
    device.show_dashboard = false;
    device.show_statistics =false;
    device.show_settings =  false;
    //device.span = {row:0, col:1}

    //var folder = "/var/lib/motion/camera"+camera_number[0];
    var folder = "/home/pi/gateway/motion/events"
    relay_socket.emit('folder list',{token:device.token,folder:folder,id:device.id});
    console.log("show_recordings", device.id);
  }

  $scope.show_settings = function(device) { 
    device.show_settings = true;
    device.show_dashboard = false;
    device.show_statistics =false;
    device.show_recordings =false;
    device['show_settings_buttons'] = true;
    console.log("show_settings");
  }

  $scope.show_device_info = function(device) { 
    device.show_device_info = true;
    device.show_settings_buttons = false;
    console.log("show_device_info");
  }

  $scope.show_more_options = function(device) { 
    device.show_more_options = true;
    device.show_device_info = false;
    device.show_settings_buttons = false;
    device.show_settings = false;
    console.log("show_more_options");
  }

  $scope.show_attached_devices = function(device) { 
    device.show_attached_devices = true;
    device.show_settings_buttons = false;
    device.show_settings = false;
    device['show_attach_device_button'] = true;
    console.log("show_attached_devices");
  }

  $scope.show_attach_device_button = function(device) { 
    device.show_attached_devices = false;
    device.show_attach_device_buttons = true;
    console.log("show_attached_devices");
  }

})

.controller('gridListDemoCtrl', function($scope) {

    this.tiles = buildGridModel({
            icon : "avatar:svg-",
            title: "Svg-",
            background: ""
          });

    function buildGridModel(tileTmpl){
      var it, results = [ ];

      for (var j=0; j<11; j++) {

        it = angular.extend({},tileTmpl);
        it.icon  = it.icon + (j+1);
        it.title = it.title + (j+1);
        it.span  = { row : 1, col : 1 };

        switch(j+1) {
          case 1:
            it.background = "red";
            it.span.row = it.span.col = 2;
            break;

          case 2: it.background = "green";         break;
          case 3: it.background = "darkBlue";      break;
          case 4:
            it.background = "blue";
            it.span.col = 2;
            break;

          case 5:
            it.background = "yellow";
            it.span.row = it.span.col = 2;
            break;

          case 6: it.background = "pink";          break;
          case 7: it.background = "darkBlue";      break;
          case 8: it.background = "purple";        break;
          case 9: it.background = "deepBlue";      break;
          case 10: it.background = "lightPurple";  break;
          case 11: it.background = "yellow";       break;
        }

        results.push(it);
      }
      return results;
    }
  })
  .config( function( $mdIconProvider ){
    $mdIconProvider.iconSet("avatar", 'icons/avatar-icons.svg', 128);
  });
