Ext.define('NextThought.mixins.FlagActions',{

	constructor: function(){
		function onAfterRender(){
			var me = this;

			if( me.flagEl ){
				me.mon(me.flagEl, 'click', me.flagActionClickHandler, me);
			}

			me.reflectFlagged(me.record);
			me.listenForFlagChanges(me.record);
		}

		this.on('afterrender',onAfterRender,this,{single:true});
	},


	flagActionClickHandler: function(){
		var me = this,
			rec = me.getRecord();
		me.flagging = true;
		TemplatesForNotes.areYouSure('Reporting this object cannot be undone.',
				function(btn){
					delete me.flagging;
					if(btn === 'ok'){ rec.flag(me); }});
	},


	tearDownFlagging: function(){
		if( this.flagEl ){
			this.mun(this.flagEl,'click', this.flagActionClickHandler, this);
			this.flagEl.remove();
			delete  this.flagEl;
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
	}
});
