var socket = require('../socket.js');
var database = require('../database');
var exec = require('child_process').exec;
var fs = require('fs');


socket.relay.on('folder list', function (data) {
  var folder = data.folder;
  var command = "ls -lah --full-time "+folder;
  console.log('folder list',command);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      data.error = error;
      relay.emit('folder list result',data);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    data.stdout = stdout;
    data.stderr = stderr;
   socket.relay.emit('folder list result',data);
  });
});

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
  if (data.command == "play_folder") {

  var folder = data.folder;
  var new_folder_list = "concat:";
  var command = "ls -lah --full-time "+folder;
  exec(command, (error, stdout, stderr) => {
    if (error) return console.error(`exec error: ${error}`);

    var folder_list = stdout.split(/(?:\r\n|\r|\n)/g);
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
      if (parts[8].charCodeAt(0) == 46) {
        if (parts[8].charCodeAt(1) == 46) {
        } else if (parts[8].length < 2) {
          folder_list.splice(i,1);
          i--;
          continue;
        }
      }
      parts.name = parts[8];
      if (parts.name.indexOf(".avi") < 0) continue;
      new_folder_list = new_folder_list + parts.folder + "/" + parts.name + "|";
    }
    data.folder_list = new_folder_list.substring(0 , new_folder_list.length -1);
    console.log("folder_list ",data.folder_list);
    start_ffmpeg(data);
  });

  }
});

var spawn = require('child_process').spawn;
var ffmpeg;
function start_ffmpeg(data) {
  var settings = database.settings;
  if (ffmpeg)
    stop_ffmpeg(ffmpeg)
  video_width = database.settings.video_width;
  video_height = database.settings.video_height;
  if (data.command == "start_webcam") {
    var command =  [
                   '-loglevel', 'panic',
                   //'-r', '2',
                   //'-strict', '-1',
                   '-s', video_width+"x"+video_height,
                   '-f', 'video4linux2',
                   '-i', '/dev/video10',
                   '-f', 'mpegts',
		   '-codec:v', 'mpeg1video',
                   '-b:v', '600k',
                   '-r', '2',
                   '-strict', '-1',
                   "http://"+relay_server+":8082/"+settings.token+"/"
                 ];
  }
  if (data.command == "play_file") {
    if (ffmpeg)
      stop_ffmpeg(ffmpeg);
    var command =  [
                   '-loglevel', 'panic',
                   '-r', '24',
                   '-strict', '-1',
                   '-i', data.file,
                   '-f', 'mpegts',
		   '-codec:v', 'mpeg1video',
                   '-r', '24',
                   '-strict', '-1',
                   "http://"+relay_server+":8082/"+settings.token+"/"
                 ];
   }

  if (data.command == "play_folder") {
    if (ffmpeg)
      stop_ffmpeg(ffmpeg);


    var command =  [
                   //'-loglevel', 'panic',
                   '-r', '24',
                   '-strict', '-1',
                   '-i', data.folder_list,
                   '-f', 'mpegts',
		   '-codec:v', 'mpeg1video',
                   '-r', '24',
                   '-strict', '-1',
                   "http://"+relay_server+":8082/"+settings.token+"/"
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
