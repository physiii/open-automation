// ---------------------------  OPEN-AUTOMATION -------------------------------- //
// --------------  https://github.com/physiii/open-automation  ----------------- //
// ------------------------------- camera.js ----------------------------------- //

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var TAG = "[camera.js]";
var STREAM_PORT = config.video_stream_port || 8082;

// ------------- //
// sockets calls //
// ------------- //
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

socket.relay.on('get camera list', function (data) {
  var folder = "/dev/video*";
  var command = "ls -lah --full-time "+folder;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      data.error = error;
      //relay.emit('camera list result',data);
      return;
    }
    data.stdout = stdout;
    data.stderr = stderr;
    console.log(TAG,"camera list |",data.mac);
    database.settings.camera_list = data;
    socket.relay.emit('camera list',data);
  });
});

socket.relay.on('get camera preview', function (data) {
  //if (data.command == 'snapshot')
  //if (data.command == 'preview')
  console.log(TAG,"get camera preview",data.camera_number)
  var camera_number = data.camera_number;
  get_camera_preview(camera_number);
});

socket.relay.on('set resolution', function (data) {
  var res = data.resolution.split("x");
  var resolution = {};
  resolution.video_width = res[0];
  resolution.video_height = res[1];
  database.store_settings(resolution);
  console.log("set resolution | " + resolution.video_width+"x"+resolution.video_height);
});

// ---------------- //
// camera functions //
// ---------------- //
function get_camera_preview(camera_number) {
  var root_dir = "/var/lib/motion/camera"+camera_number[0];
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
        send_camera_preview(stdout[i][9], camera_number);
        return; //console.log("get_camera_preview",stdout[i][9]);
      }
    }
  });
}

function send_camera_preview (path, camera_number) {
  fs.readFile(path, function(err, data) {
    if (err) return console.log(err); // Fail if the file can't be read.
    var settings = database.settings;
    var image = data.toString('base64');
    data_obj = {mac:settings.mac, token:settings.token, camera_number:camera_number, image:image}
    socket.relay.emit('camera preview',data_obj);
    console.log(TAG,'send_camera_preview',data_obj.camera_number);
  });
}

/*function send_camera_preview (path, camera_number) {
  fs.readFile(path, function(err, data) {
    if (err) return console.log(err); // Fail if the file can't be read.
    var settings = database.settings;
    //var data_obj = {mac:settings.mac, token:settings.token, camera_number:camera_number};
    var image = data.toString('base64');
    var data_obj = {mac:settings.mac, token:settings.token, camera_number:camera_number, image:image};
    socket.relay.emit('camera preview',data_obj);
    console.log(TAG,"send_camera_preview",data_obj.mac,path);
  });
}*/

ffmpeg_timer = setTimeout(function () {}, 1);
socket.relay.on('ffmpeg', function (data) {
  if (data.command == "start_webcam") {
    start_ffmpeg(data);
  }
  if (data.command == "stop") {
    console.log(TAG,"stop command received");
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

var ffmpeg_proc_list = [];
function start_ffmpeg(data) {
  var relay_server = config.relay_server;
  for (var i = 0; i < ffmpeg_proc_list.length; i++) {
    console.log("ffmpeg_proc_list: ", ffmpeg_proc_list[i].tag.camera_number);
    if (ffmpeg_proc_list[i].tag.camera_number == data.camera_number) {
      if (data.command == "start_webcam") return console.log("stream already started");
      if (data.command == "play_file") {
        stop_ffmpeg(ffmpeg_proc_list[i]);
        console.log(TAG,"killing current ffmpeg process",ffmpeg_proc_list[i].tag.camera_number);
      } 
    }
  }
  /*if (ffmpeg)
    stop_ffmpeg(ffmpeg)*/
  var settings = database.settings;
  var video_width = settings.video_width;
  var video_height =settings.video_height;
  if (!video_width) video_width = "640";
  if (!video_height) video_height = "480";
  var camera_number = 10;
  if (data.camera_number) camera_number = data.camera_number;
  console.log(TAG,"camera number: ",data.camera_number);

  if (data.command == "start_webcam") {
    var command =  [
                   '-loglevel', 'panic',
                   //'-r', '2',
                   //'-strict', '-1',
                   '-s', video_width+"x"+video_height,
                   '-f', 'video4linux2',
                   '-i', '/dev/video'+camera_number,
                   '-f', 'mpegts',
		   '-codec:v', 'mpeg1video',
                   '-b:v', '600k',
                   '-r', '2',
                   '-strict', '-1',
                   "http://"+relay_server+":"+STREAM_PORT+"/"+settings.token+"/"+camera_number+"/"
                 ];
  }
  if (data.command == "play_file") {
    /*if (ffmpeg)
      stop_ffmpeg(ffmpeg);*/
    var command =  [
                   '-loglevel', 'panic',
                   '-r', '24',
                   '-strict', '-1',
                   '-i', data.file,
                   '-f', 'mpegts',
		   '-codec:v', 'mpeg1video',
                   '-r', '24',
                   '-strict', '-1',
                   "http://"+relay_server+":"+STREAM_PORT+"/"+settings.token+"/"+camera_number+"/"
                 ];
   }

  if (data.command == "play_folder") {
    /*if (ffmpeg)
      stop_ffmpeg(ffmpeg);*/


    var command =  [
                   //'-loglevel', 'panic',
                   '-r', '24',
                   '-strict', '-1',
                   '-i', data.folder_list,
                   '-f', 'mpegts',
		   '-codec:v', 'mpeg1video',
                   '-r', '24',
                   '-strict', '-1',
                   "http://"+relay_server+":"+STREAM_PORT+"/"+settings.token+"/"+camera_number+"/"
                 ];
   }
  ffmpeg = spawn('ffmpeg', command);
  ffmpeg.tag = data;
  ffmpeg.stdout.on('data', (data) => {console.log(`stdout: ${data}`)});
  ffmpeg.stderr.on('data', (data) => {console.log(`stderr: ${data}`)});
  ffmpeg_proc_list.push(ffmpeg);
  ffmpeg.on('close', (code) => {
    //stop_ffmpeg(ffmpeg);
    for (var i = 0; i < ffmpeg_proc_list.length; i++) {
      console.log("closed: ", ffmpeg_proc_list[i].tag.camera_number);
      if (ffmpeg_proc_list[i].tag.camera_number == data.camera_number) {
        stop_ffmpeg(ffmpeg_proc_list[i]);
        ffmpeg_proc_list.splice(i,1);
        //console.log(TAG,"ffmpeg closed");
      }
    }
    console.log(`child process exited with code ${code}`);
  });

//var strings = [ "hello", "world" ];
//var delay = 1000;
//for(var i=0;i<strings.length;i++) {
    setTimeout(
        (function(f) {
            return function() {
		stop_ffmpeg(f);
                console.log(TAG,"timeout",f.tag.camera_number);
            }
        })(ffmpeg), 1*60*1000);
    //delay += 1000;
//}

  //clearTimeout(ffmpeg_timer);
  /*setTimeout((function (f) {
    console.log(TAG,"timeout!",f.tag);
    //stop_ffmpeg(ffmpeg);
    for (var i = 0; i < ffmpeg_proc_list.length; i++) {
      console.log("ffmpeg_proc_list: ", ffmpeg_proc_list[i].tag.camera_number);
      if (ffmpeg_proc_list[i].tag.camera_number == data.camera_number) {
        stop_ffmpeg(ffmpeg_proc_list[i]);
        console.log(TAG,"ffmpeg timeout", ffmpeg_proc_list[i].tag.camera_number);
      }
    }
  })(ffmpeg), 1*30*1000);*/

  /*clearTimeout(ffmpeg_timer);
  ffmpeg_timer = setTimeout(function () {
    for (var i = 0; i < ffmpeg_proc_list.length; i++) {
      console.log("ffmpeg_proc_list: ", ffmpeg_proc_list[i].tag.camera_number);
      if (ffmpeg_proc_list[i].tag.camera_number == data.camera_number) {
        stop_ffmpeg(ffmpeg_proc_list[i]);
        console.log(TAG,"ffmpeg timeout", ffmpeg_proc_list[i].tag.camera_number);
      }
    }
  }, 1*20*1000);*/
  
  ffmpeg_started = true;
  socket.relay.emit('ffmpeg started',settings);
  console.log(TAG,'ffmpeg started | ',command);
}

function stop_ffmpeg(ffmpeg) {
    ffmpeg.kill();
    ffmpeg_started = false;
    console.log(TAG,'ffmpeg stop',ffmpeg.tag.camera_number);
}
