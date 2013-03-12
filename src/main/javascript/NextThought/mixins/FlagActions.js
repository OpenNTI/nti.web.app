Ext.define('NextThought.mixins.FlagActions',{

	constructor: function(){
		function onAfterRender(){
			var me = this,
				rec = me.getRecord();

			function handler(){ rec.flag(me); }

			if( me.flagEl ){
				me.mon(me.flagEl, 'click', handler, me);
				me.flagEl.clickHandler = handler;
			}
		}

		this.on('afterrender',onAfterRender,this,{single:true});
	},


	tearDownFlagging: function(){
		if( this.flagEl ){
			this.mon(this.flagEl,'click', this.flagEl.clickHandler, this);
			this.flagEl.remove();
		}

		this.stopListeningForFlagChanges(this.record);
	},


	getRecord: function(){
		return this.record;
	},


	listenForFlagChanges: function(record){
		record.addObserverForField(this, 'flagged', this.markAsFlagged, this);
	},

	stopListeningForFlagChanges: function(record){
		record.removeObserverForField(this, 'flagged', this.markAsFlagged, this);
	},


	reflectFlagged: function(record){
        if(this.flagEl){
			this.markAsFlagged(record.isFlagged());
        }
	},


	markAsFlagged: function(field, value){
		var flagged = value === undefined ? field : value,
			method = flagged ? 'addCls' : 'removeCls';
		if(!this.flagEl){
			return;
		}
		this.flagEl[method]('on');
		this.flagEl.update(flagged?'Reported':'Report');
		this.flagEl.set({'title': flagged ? 'Flagged as inappropriate' : 'Flag as inappropriate'});
	}
});
