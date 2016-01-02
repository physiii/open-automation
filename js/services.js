angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Media',
    lastText: '3 active',
    icon: 'fa fa-volume-up fa-5x'
  }, {
    id: 1,
    name: 'Lights',
    lastText: '3 active',
    icon: 'fa fa-lightbulb-o fa-5x'
  }, {
    id: 2,
    name: 'Video',
    lastText: '3 active',
    icon: 'fa fa-video-camera fa-5x'
  }, {
    id: 3,
    name: 'Climate',
    lastText: '3 active',
    icon: 'fa fa-cloud fa-5x'
  }, {
    id: 5,
    name: 'Locks',
    lastText: '3 active',
    icon: 'fa fa-lock fa-5x'
  },  {
    id: 7,
    name: 'Pi\'s',
    lastText: '3 active',
    icon: 'fa fa-circle fa-5x'
  },  {
    id: 6,
    name: 'Files',
    lastText: '3 active',
    icon: 'fa fa-bars fa-5x'
  },  {
    id: 9,
    name: 'Health',
    lastText: '3 active',
    icon: 'fa fa-medkit fa-5x'
  }, {
    id: 8,
    name: 'Alerts',
    lastText: '3 active',
    icon: 'fa fa-support fa-5x'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
