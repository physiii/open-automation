// -----------------------------  OPEN-AUTOMATION ------------------------- //
// ------------  https://github.com/physiii/open-automation --------------- //
// --------------------------------- alarm.js ----------------------------- //

var TAG = "[alarm.js]";

module.exports = {
  set_alarm: set_alarm
}

function set_alarm(data) {
  if (!config.zwave) return console.log(TAG,"zwave is disabled");
  database.store_settings(data.mode);
  if (data.mode == "armed") {
    alert = true;
    //console.log("set alarm",device_array);
    for (var i = 0; i < device_array.length; i++) {
      try {
        if (device_array[i].device_type == "Secure Keypad Door Lock") {
          zwave.set_value(device_array[i].id, 98, 1, 0, true);
          //zwave.setValue(device_array[i].id, 112, 1, 7, 'Tamper');
        }
      } catch (e) { console.log(e) }
    }
  }
  if (data.mode == "disarmed") {
    alert = false;
    for (var i = 0; i < device_array.length; i++) {
      try {
        if (device_array[i].device_type == "Secure Keypad Door Lock") {
          //zwave.setValue(device_array[i].id, 112, 1, 7, 'Activity');
          zwave.set_value(device_array[i].id, 98, 1, 0, false);
        }
      } catch (e) { console.log(e) }
    }
  }
  if (data.mode == "night") {
    for (var i = 0; i < device_array.length; i++) {
      try {
        if (device_array[i].device_type == "Secure Keypad Door Lock") {
          zwave.set_value(device_array[i].id, 98, 1, 0, true);
          //zwave.setValue(device_array[i].id, 112, 1, 7, 'Tamper');
        }
      } catch (e) { console.log(e) }
    }
  }
  console.log("set alarm",data.mode);
}
