var app = {

    initialize: function() {	// Application Constructor
        this.bindEvents();
    },

    bindEvents: function() {	 // 'load', 'deviceready', 'offline', and 'online'.
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {	// The scope of 'this' is the event. In order to call the 'receivedEvent' function, we must explicitly call 'app.receivedEvent(...);'
        app.receivedEvent('deviceready');
    },

    receivedEvent: function(id) {	// Update DOM on a Received Event
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
        console.log('platform ' + device.platform);
    }
};
