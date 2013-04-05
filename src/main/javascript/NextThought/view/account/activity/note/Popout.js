Ext.define('NextThought.view.account.activity.note.Popout',{
	extend: 'NextThought.view.account.activity.Popout',
	alias: ['widget.activity-popout-note'],

	requires: [
		'NextThought.view.account.activity.note.Preview'
	],

	statics: {

		popupAfterResolvingParent: function(record, alignmentEl, el, offsets, flipFactor, viewRef){

			var service = $AppConfig.service,
				me = this,
				ref = record.get('references').first();

			offsets[1] -= 91;
			flipFactor = -0.1;

			function load(resolvedRecord){
				if(resolvedRecord !== record){
					resolvedRecord.focusRecord = record;
				}
				me.popupNow(resolvedRecord, alignmentEl, el, offsets, flipFactor, viewRef);
			}

			if(!ref){
				load(record);
				return;
			}
            service.getObject(ref, load, function failure(){ load(record); }, me);
		}

	}
},function(){
	this.popupNow = this.popup;
	this.popup = this.popupAfterResolvingParent;
});
