var socket = require('../socket.js');
var database = require('../database');
const exec = require('child_process').exec;
var fs = require('fs');

socket.relay.on('camera', function (data) {
  //if (data.command == 'snapshot')
  //if (data.command == 'preview')
  //get_camera_preview();
});

socket.relay.on('get camera preview', function (data) {
  //if (data.command == 'snapshot')
  //if (data.command == 'preview')
  get_camera_preview();
});

socket.relay.on('set resolution', function (data) {
  var res = data.resolution.split("x");
  var resolution = {};
  resolution.video_width = res[0];
  resolution.video_height = res[1];
  database.store_settings(resolution);
  console.log("set resolution | " + resolution.video_width+"x"+resolution.video_height);
});

function get_camera_preview() {
  var root_dir = "/var/lib/motion";
  var command = "ls -lahRt --full-time "+root_dir+" | head -100";
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      console.log(`error: ${error}`);
      return;
    }
    stdout = stdout.split(/(?:\r\n|\r|\n)/g);
    var cur_dir = "";
    for (var i =0; i < stdout.length; i++) {
      stdout[i] = stdout[i].split(" ");
      if (stdout[i][0].indexOf("/") > -1) {
        stdout[i][0] = stdout[i][0].replace(":","/");
        cur_dir = stdout[i][0];
      }
      stdout[i][9] = cur_dir + stdout[i][9];
      if (!stdout[i][9]) continue;
      if (stdout[i][9].indexOf(".jpg") > -1) {
        send_camera_preview(stdout[i][9]);
        return console.log("get_camera_preview",stdout[i][9]);
      }
    }
  });
}

function send_camera_preview (path) {
  fs.readFile(path, function(err, data) {
    if (err) return console.log(err); // Fail if the file can't be read.
    var settings = database.settings;
    data_obj = {mac:settings.mac, token:settings.token, image:data.toString('base64')}
    socket.relay.emit('camera preview',data_obj);
  });
}

ffmpeg_timer = setTimeout(function () {}, 1);
socket.relay.on('ffmpeg', function (data) {
  if (data.command == "start_webcam") {
    start_ffmpeg(data);
  }
  if (data.command == "stop") {
    console.log("received ffmpeg stop command");
    stop_ffmpeg(ffmpeg);
  }
  if (data.command == "play_file") {
    console.log("playing file");
    start_ffmpeg(data);
  }
});

const spawn = require('child_process').spawn;
var ffmpeg;
function start_ffmpeg(data) {
  var settings = database.settings;
  var video_relay_server = database.video_relay_server;
  if (ffmpeg)
    stop_ffmpeg(ffmpeg)
  video_width = database.settings.video_width;
  video_height = database.settings.video_height;
  if (data.command == "start_webcam") {
    var command =  [
                   //'-loglevel', 'panic',
                   '-r', '2',
                   '-strict', '-1',
                   '-s', video_width+"x"+video_height,
                   '-f', 'video4linux2',
                   '-i', '/dev/video10',
                   '-f', 'mpegts',
		   '-codec:v', 'mpeg1video',
                   '-b:v', '600k',
                   '-r', '2',
                   '-strict', '-1',
                   "http://"+video_relay_server+":8082/"+settings.token+"/"
                 ];
  }
  if (data.command == "play_file") {
    if (ffmpeg)
      stop_ffmpeg(ffmpeg);
    var command =  [
                   //'-loglevel', 'panic',
                   '-r', '24',
                   '-strict', '-1',
                   '-i', data.file,
                   '-f', 'mpegts',
		   '-codec:v', 'mpeg1video',
                   '-r', '24',
                   '-strict', '-1',
                   "http://"+video_relay_server+":8082/"+settings.token+"/"
                 ];
   }
  ffmpeg = spawn('ffmpeg', command);
  ffmpeg.stdout.on('data', (data) => {console.log(`stdout: ${data}`)});
  ffmpeg.stderr.on('data', (data) => {console.log(`stderr: ${data}`)});
  ffmpeg.on('close', (code) => {
    //stop_ffmpeg(ffmpeg);
    console.log(`child process exited with code ${code}`);
  });
  
  clearTimeout(ffmpeg_timer);
  setTimeout(function () {
    stop_ffmpeg(ffmpeg);
  }, 5*60*1000);
  
  ffmpeg_started = true;
  socket.relay.emit('ffmpeg started',settings);
  console.log('ffmpeg started | ',command);
}

function stop_ffmpeg(ffmpeg) {
    ffmpeg.kill();
    ffmpeg_started = false;
    console.log('ffmpeg stop');
}
