Ext.define('NextThought.overrides.Ext',{
	override: 'Ext'
},function(){

	var get = Ext.getElementById;

	Ext.getElementById = function(id){
			var el = get.apply(this,arguments);

			function testFrame(frame){
				var win = frame.contentWindow || window.frames[frame.name];
				el = win.document.getElementById(id) || false;
				return !el;
			}

			if(!el){
				Ext.each(document.getElementsByTagName('iframe'),testFrame);
			}

			return el;
		};

});
