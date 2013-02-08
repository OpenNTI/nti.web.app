Ext.define('NextThought.util.Views',{
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
					cls: 'chat-transcript',
					disableDragDrop: true,
					title: Ext.String.format('Chat Transcript | {0}',date),
					closable: true,
					width: 450,
					height: 500,
					autoScroll: true
				}),
				log = win.add({ xtype: 'chat-log-view' }),
				msgs = m.get('Messages');

			msgs = Ext.Array.sort( msgs || [], Globals.SortModelsBy('Last Modified'));

			Ext.each(msgs, function(i){ log.addMessage(i); });
			win.show();
		}

		function failure() {
			console.error('failed to resolve transcript for', arguments);
		}

		this.getTranscript(m.get('ContainerId'), m.get('Last Modified'), success, failure, this);
	},


	getTranscript: function(roomInfoId, lastMod, success, failure, scope) {
		var id = ParseUtils.parseNtiid(roomInfoId);
		scope = scope || this;

		if(!id){
			Ext.callback(failure, scope);
			return;
		}

		//Swizzle the NTIID
		id.authority.date = Ext.Date.format(lastMod, 'Y-m-d');
		id.specific.provider = $AppConfig.username;
		id.specific.type = 'Transcript';
		$AppConfig.service.getObject(id, success, failure, scope);
	}



},
function(){
	window.ViewUtils = this;
});
