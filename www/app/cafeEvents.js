define(function(){
    var instance = null;
 
    function CafeEventEmitter(){
        if(instance !== null){
            throw new Error("Cannot instantiate more than one CafeEventEmitter, use CafeEventEmitter.getInstance()");
        } 
        
        this.initialize();
    }
    CafeEventEmitter.prototype = {
        initialize: function(){
            
        }
    };
    CafeEventEmitter.getInstance = function(){
    	if(instance === null){
    		var eventEmitter = require('eventEmitter');
    		instance = new eventEmitter();
        }
        return instance;
    };
 
    return CafeEventEmitter.getInstance();
});