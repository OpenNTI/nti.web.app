Ext.define('NextThought.model.anchorables.TranscriptContentPointer', {
	extend: 'NextThought.model.anchorables.TimeContentPointer',


	config:{
		pointer:{},
		cueid:''
	},


	statics:{
		createFromObject: function(o){
			var cp = NextThought.model.anchorables[o.pointer.Class];

			return NextThought.model.anchorables.TranscriptContentPointer.create({
				pointer: cp.createFromObject(o.pointer),
				cueid: o.cueid,
				role: o.role,
				seconds: parseInt(o.seconds, 10)
			});
		}
	},


	constructor: function(o){
		this.callParent(arguments);
		this.Class = 'TranscriptContentPointer';
	}
});