<html>
  <head>
<meta charset="utf-8">
<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width">
<title>Pyfi | Camera</title>

<link href="lib/ionic/css/ionic.css" rel="stylesheet">
<link href="css/style.css" rel="stylesheet">
<link href="//code.ionicframework.com/nightly/css/ionic.css" rel="stylesheet">
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js"></script>
<script src="js/app.js"></script>
<script src="js/controllers.js"></script>
<script src="//code.jquery.com/jquery-1.12.0.min.js"></script>
<script src="//code.ionicframework.com/nightly/js/ionic.bundle.js"></script>

  </head>
<body ng-app="starter">
<ion-content>

<div class="card" ng-controller="post_ctrl">
  <div class="item item-divider">
    Link Account
  </div>
  <div class="card">
    <div>
      <div class="item item-text-wrap">
        <div class="list">
          <label class="item item-input">
            <input type="text" ng-model="user" placeholder="User">
          </label>
          <label class="item item-input">
            <input type="text" ng-model="password" placeholder="Password">
          </label>         
          <button class="button button-block button-dark" ng-click="set()">Link</button>
          <h3>
            <a style="float:right" href="http://pyfi.org/account/register">Not a member yet? Register here.</a>
          </h3>
        </div>  
      </div>
    </div>
</div>
</div>

<div class="card" ng-controller="device_info">
  <div class="item item-divider">
    Device Info
  </div>
  <div class="card">
    <ul class="list">
      <li class="item" id="li_device_name">
        Device Name  <b>{{ device_name }}</b>
        <button ng-click="edit_device_name('show')" style="float:right" class="ion-edit"></button>        
      </li>
      <li style="display:none" class="item" id="input_device_name">
        <input style="width:100%" type="text" placeholder="enter device name ({{ device_name }})">
        <button ng-click="edit_device_name()" class="button-block">set</button>
      </li>
      <li class="item" id="li_device_port">
        Port  <b>{{ device_port }}</b>
        <button ng-click="edit_device_port('show')" style="float:right" class="ion-edit"></button>        
      </li>
      <li style="display:none" class="item" id="input_device_port">
        <input style="width:100%" type="text" placeholder="enter port number ({{ device_port }})">
        <button ng-click="edit_device_port()" class="button-block">set</button>
      </li>    
      <li class="item">
        Local Internet Address  <b>{{ local_ip }}</b>
      </li>
      <li class="item">
        Public Internet Address  <b>{{ public_ip }}</b>
      </li>
      <li class="item">
        Machine Address  <b>{{ machine_address }}</b>
      </li>       
    </ul>
  </div>
  <div class="card">
      <li class="item">
        <button class="button button-block button-dark">Update</button>
        <button style="float:right" class="button button-small button-assertive">Reboot</button>
      </li>
  </div>  
</div>

<div class="card">
  <div class="item item-divider">
    Camera 1
  </div>
    <div id="{{ x.mac }}_div" class="card">
      <div style="margin:auto">    
        <img style="border:2px solid #444;border-radius:0px 0px 3px 3px;" src="http://192.168.0.18:8081/"></img>
      </div>
    </div>
  </div>
</div>

</ion-content>
</body>
</html>
