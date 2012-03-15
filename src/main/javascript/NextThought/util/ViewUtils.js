Ext.define('NextThought.util.ViewUtils',{
	alternateClassName: 'ViewUtils',
	singleton: true,
	requires: [

	],

	widgetMap: {},

	constructor: function(){
		Ext.apply(this.widgetMap, {
			'MessageInfo': this.displayTranscript
		});
	},

	displayModel: function (m){
		var func = this.widgetMap[m.getModelName()];
		if (func) {
			func.call(this, m);
		}
		else {
			console.error('No action possible for', m);
		}
	},


	displayTranscript: function(m){
		function success(m){
			var date = Ext.Date.format(m.get('Last Modified') || new Date(), 'M j, Y'),
				win = Ext.widget('window', {
					title: Ext.String.format('Chat Transcript | {0}',date),
					closable: true,
					width: 450,
					height: 500
				}),
				log = win.add({ xtype: 'chat-log-view' }),
				msgs = m.get('Messages');

			msgs = Ext.Array.sort( msgs || [], Globals.SortModelsBy('Last Modified', ASCENDING));

			Ext.each(msgs, function(i){ log.addMessage(i); });
			win.show();
		}

		function failure() {
			console.error('failed to resolve transcript for', arguments);
		}

		var cid = m.get('ContainerId');

		$AppConfig.service.getObject(m.get('ContainerId'), success, failure, this);
	}



},
function(){
	window.ViewUtils = this;
});
