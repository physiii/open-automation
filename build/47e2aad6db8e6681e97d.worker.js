/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "BSmb");
/******/ })
/************************************************************************/
/******/ ({

/***/ "BSmb":
/*!***********************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--6-0!./node_modules/eslint-loader!./src/state/ducks/services-list/recordings.worker.js ***!
  \***********************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default.signature : function (a) {\n  return a;\n};\n\nonmessage = function onmessage(message) {\n  if (!Array.isArray(message.data.recordings)) {\n    return;\n  }\n\n  var recordingsDateIndex = new Map(),\n      datesOfRecordings = new Map();\n  message.data.recordings.forEach(function (recording) {\n    var date = new Date(recording.date),\n        month = date.getFullYear() + '-' + (date.getMonth() + 1),\n        day = date.getDate(),\n        dateKey = month + '-' + day,\n        recordingsForDate = recordingsDateIndex.get(dateKey),\n        datesForMonth = datesOfRecordings.get(month);\n\n    if (recordingsForDate) {\n      recordingsForDate.add(recording.id);\n    } else {\n      recordingsDateIndex.set(dateKey, new Set([recording.id]));\n    }\n\n    if (datesForMonth) {\n      datesForMonth.add(day);\n    } else {\n      datesOfRecordings.set(month, new Set([day]));\n    }\n  });\n  postMessage({\n    dateIndex: recordingsDateIndex,\n    dates: datesOfRecordings\n  });\n};//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQlNtYi5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9zdGF0ZS9kdWNrcy9zZXJ2aWNlcy1saXN0L3JlY29yZGluZ3Mud29ya2VyLmpzPzVlNGMiXSwic291cmNlc0NvbnRlbnQiOlsib25tZXNzYWdlID0gKG1lc3NhZ2UpID0+IHtcblx0aWYgKCFBcnJheS5pc0FycmF5KG1lc3NhZ2UuZGF0YS5yZWNvcmRpbmdzKSkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IHJlY29yZGluZ3NEYXRlSW5kZXggPSBuZXcgTWFwKCksXG5cdFx0ZGF0ZXNPZlJlY29yZGluZ3MgPSBuZXcgTWFwKCk7XG5cblx0bWVzc2FnZS5kYXRhLnJlY29yZGluZ3MuZm9yRWFjaCgocmVjb3JkaW5nKSA9PiB7XG5cdFx0Y29uc3QgZGF0ZSA9IG5ldyBEYXRlKHJlY29yZGluZy5kYXRlKSxcblx0XHRcdG1vbnRoID0gZGF0ZS5nZXRGdWxsWWVhcigpICsgJy0nICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpLFxuXHRcdFx0ZGF5ID0gZGF0ZS5nZXREYXRlKCksXG5cdFx0XHRkYXRlS2V5ID0gbW9udGggKyAnLScgKyBkYXksXG5cdFx0XHRyZWNvcmRpbmdzRm9yRGF0ZSA9IHJlY29yZGluZ3NEYXRlSW5kZXguZ2V0KGRhdGVLZXkpLFxuXHRcdFx0ZGF0ZXNGb3JNb250aCA9IGRhdGVzT2ZSZWNvcmRpbmdzLmdldChtb250aCk7XG5cblx0XHRpZiAocmVjb3JkaW5nc0ZvckRhdGUpIHtcblx0XHRcdHJlY29yZGluZ3NGb3JEYXRlLmFkZChyZWNvcmRpbmcuaWQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZWNvcmRpbmdzRGF0ZUluZGV4LnNldChkYXRlS2V5LCBuZXcgU2V0KFtyZWNvcmRpbmcuaWRdKSk7XG5cdFx0fVxuXG5cdFx0aWYgKGRhdGVzRm9yTW9udGgpIHtcblx0XHRcdGRhdGVzRm9yTW9udGguYWRkKGRheSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRhdGVzT2ZSZWNvcmRpbmdzLnNldChtb250aCwgbmV3IFNldChbZGF5XSkpO1xuXHRcdH1cblx0fSk7XG5cblx0cG9zdE1lc3NhZ2Uoe1xuXHRcdGRhdGVJbmRleDogcmVjb3JkaW5nc0RhdGVJbmRleCxcblx0XHRkYXRlczogZGF0ZXNPZlJlY29yZGluZ3Ncblx0fSk7XG59O1xuIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFHQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRkE7QUFJQSIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///BSmb\n");

/***/ })

/******/ });