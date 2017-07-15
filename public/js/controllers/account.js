// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ---------------------------------- account.js ------------------------------------- //


angular.module('starter.controllers')

.controller('AccountCtrl', function($scope, $rootScope, $stateParams, Categories, socket,$ionicLoading, $compile, $http) {

  console.log('<< ------  AccountCtrl  ------ >>');
  var relay_socket = $rootScope.relay_socket;
  var alert_contacts = $rootScope.alert_contacts;

  // --------------------- //
  // add or remove devices //
  // --------------------- //
  $scope.add_device = function(device) {
    device.user_token = $rootScope.token;
    console.log("add_device",device);
    relay_socket.emit('link device',device);
  }
  
  relay_socket.on('link device', function (data) {
    if (data.device_type == "gateway") {
      $rootScope.gateways.push(data);
    }
    relay_socket.emit('get settings',{token:data.token});
    //console.log("get device settings",data);
    $scope.$apply(function () {});
  });

  $scope.remove_device = function(device) {
    device.user_token = $rootScope.token;  
    relay_socket.emit('unlink device',device);
  }

  relay_socket.on('unlink device', function (data) {
    var index = $rootScope.find_index($rootScope.gateways,'token',data.token);
    $rootScope.gateways.splice(index,1);
    $scope.$apply(function () {});
  });

  $scope.add_thermostat = function(device) {
    console.log("add_thermostat",device);  
    relay_socket.emit('add thermostat',device);
  }


  $scope.add_contact = function(contact) {
   contact.user_token = $rootScope.token;
   relay_socket.emit('add contact', contact);
   console.log("add_contact | ", contact);
  }
  
  $scope.remove_contact = function(contact) {
    $.post( "php/remove_alert_contact.php",{user:$rootScope.username, number:contact.number, label:contact.label}).success(function(data){
      console.log("remove_alert_contact.php | " + data);
      alert_contacts = $rootScope.alert_contacts;
      console.log("before: " + alert_contacts);
      for (i = 0; i < alert_contacts.length; i++) {
        if (alert_contacts[i].number == contact.number) {
          $scope.$apply(function () {
            $rootScope.alert_contacts.splice(i,1);
          });   
        }
      }
      console.log("after: " + alert_contacts);      
    });
  }


  // ---------------------------- //
  // add or remove gateway device //
  // ---------------------------- //
  $scope.link_lights = function(gateway) {
    relay_socket.emit('link lights',{ mac:gateway.mac, token:gateway.token });
    console.log('link lights',gateway);
  }

  $scope.add_zwave_device = function(gateway) {
    relay_socket.emit('add zwave',gateway);
    console.log('add_zwave_device');
  }

  // ---- //
  // show //
  // ---- //
  $scope.show_div = function(div_id) { 
    console.log(div_id);
    document.getElementById(div_id + "_div").style.display = "inline";    
  }

  $scope.showInfo = function(mac_addr) { 
    //console.log("info " + mac_addr);
    if (document.getElementById(mac_addr+"_account_info").style.display == "inline") {
      document.getElementById(mac_addr+"_account_info").style.display = "none";
    } else {
      document.getElementById(mac_addr+"_account_info").style.display = "inline";
    }
  }

  $scope.show_form = function(form, mac) {
    if (mac == null) mac = "";
    console.log("show_form: " + mac + form);
    document.getElementById(mac + form).style.display = "inline";
    document.getElementById(mac + form + "_btn").style.display = "none";
    if (form == "command_form_") {
      //document.getElementById("gateways").style.className = "col-lg-4 col-md-6 col-sm-12";
      document.getElementById("gateways").className = "";
    }
  }

  $scope.light_command = function(gateway,device,light) {
    console.log("light_command",light);
    light = {device:device, light:light, token:gateway.token};
    relay_socket.emit('lights',light);
  }

  $scope.command = function(gateway) {
    command_obj = {token:gateway.token, command:gateway.command}
    console.log("command",gateway);
    relay_socket.emit('command',gateway);
  }

  $scope.set_resolution = function(device) {
    console.log("set_resolution",device);
    var device_obj = {};
    device_obj.mac = device.mac;
    device_obj.token = device.token;
    device_obj.resolution = device.resolution;
    relay_socket.emit('set resolution',device_obj);
  }

  $scope.update_device = function(device) {
    console.log("update_device",device);
    var device_obj = {};
    device_obj.mac = device.mac;
    device_obj.token = device.token;
    relay_socket.emit('update',device_obj);
  }

  $scope.show_rename_device = function(device,value) {
    if (value == true) {
      document.getElementById(device.mac+"_rename_device").style.display = "inline";
      document.getElementById(device.mac+"_show_rename_device").style.display = "none";
    } else {
      document.getElementById(device.mac+"_rename_device").style.display = "none";
      document.getElementById(device.mac+"_show_rename_device").style.display = "inline";
    }    
    console.log("show_rename_device",value);  
  }

  $scope.rename_device = function(device) {
    $scope.show_rename_device(device,false);
    console.log("rename_device",device);
    device_obj = { token:device.token,
                   device_name:device.device_name };
    relay_socket.emit('rename device',device_obj);
  }

  $scope.test_alert = function(contact) {
    subject = "Test Alert!";
    message = "Test alert sent on " + Date.now() + " by " + $rootScope.username;
    console.log("sending test alert to " + contact.number);
  }
  
  $scope.toggle_setting = function(setting) {
   //delete settings["$$hashKey"];
   console.log("setting_obj | ", setting);
   relay_socket.emit('set settings', setting);
  }
})
