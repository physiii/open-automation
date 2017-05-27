// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ---------------------------------- media.js --------------------------------------- //

var platform = require('platform');
var spawn = require('child_process').spawn;

module.exports = {
  command: command
}

function command(data) {
  var command = data.cmd;
  if ( platform.os.family == "Win32" ) {
    if (command == "volume down"){
      spawn('nircmd.exe', ['mutesysvolume', '0']);        
      spawn('nircmd.exe', ['changesysvolume', '-5000']);
    }
    if (command == "volume up"){  
      spawn('nircmd.exe', ['mutesysvolume', '0']);
      spawn('nircmd.exe', ['changesysvolume', '+5000']);
    }
    if (command == "mute"){ spawn('nircmd.exe', ['mutesysvolume', '1']) }
    if (command == "play"){ spawn('nircmd.exe', ['mutesysvolume', '1']) }
  } else
  if ( platform.os.family == "Linux" ) {  
    if ( command === "volume down" ) { spawn('xdotool', ['key', 'XF86AudioLowerVolume']) }
    if ( command === "volume up" ) { spawn('xdotool', ['key', 'XF86AudioRaiseVolume']) }
    if ( command === "mute" ) { spawn('xdotool', ['key', 'XF86AudioMute']) }
    if ( command === "play" ) { spawn('xdotool', ['key', 'XF86AudioPlay']) }
    if ( command === "next" ) { spawn('xdotool', ['key', 'XF86AudioNext']) }  
    //for volume slider use: xodotool amixer -c 0 sset Master,0 80%
  } else {
    console.log("platform not supported " + platform);
    if ( command === "volume down" ) { spawn('xdotool', ['key', 'XF86AudioLowerVolume']) }
    if ( command === "volume up" ) { spawn('xdotool', ['key', 'XF86AudioRaiseVolume']) }
    if ( command === "mute" ) { spawn('xdotool', ['key', 'XF86AudioMute']) }
    if ( command === "play" ) { spawn('xdotool', ['key', 'XF86AudioPlay']) }
    if ( command === "next" ) { spawn('xdotool', ['key', 'XF86AudioNext']) }  
  }
  console.log("media | " + command);

}
