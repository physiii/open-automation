// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ---------------------------------- alarm.js --------------------------------------- //

function set_alarm(data) {
  settings_obj.mode = data.mode;
  store_settings(settings_obj);
  if (data.mode == "armed") {
    alert = true;
    for (var i = 0; i < device_array.length; i++) {
      try {
        if (device_array[i].device_type == "Secure Keypad Door Lock") {
          zwave.setValue(device_array[i].id, 98, 1, 0, true);
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
          zwave.setValue(device_array[i].id, 98, 1, 0, false);
        }
      } catch (e) { console.log(e) }
    }
  }
  if (data.mode == "night") {
    for (var i = 0; i < device_array.length; i++) {
      try {
        if (device_array[i].device_type == "Secure Keypad Door Lock") {
          zwave.setValue(device_array[i].id, 98, 1, 0, true);
          //zwave.setValue(device_array[i].id, 112, 1, 7, 'Tamper');
        }
      } catch (e) { console.log(e) }
    }
  }
  console.log("set alarm",data.mode);
}
