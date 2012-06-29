Ext.define('NextThought.mixins.Shareable', {
	requires: [
		'NextThought.util.Sharing'
	],

	afterRender: function(){
		this.registerDragZone(this.dragSelector||'img');
		this.registerDropZone(this.dropSelector||'img');
	},

	registerDragZone: function(dragSelector){
		var me = this, el = this.getEl();
		if(!el){return;}
		this.dragZone = Ext.create('Ext.dd.DragZone', el, {
			getDragData: function(e) {
				var sourceEl = e.getTarget(dragSelector), d;
				if (sourceEl) {
					d = sourceEl.cloneNode(true);
					d.id = Ext.id();
					d.setAttribute('style','');
					this.dragData = {
						sourceEl: sourceEl,
						repairXY: Ext.fly(sourceEl).getXY(),
						ddel: d,
						shared: me.record
					};
					return this.dragData;
				}
			},

			getRepairXY: function() {
				return this.dragData.repairXY;
			}
		});
	},


	registerDropZone: function(dropSelector){
		var me = this, el = me.getEl();
		if(!el){return;}
		this.dropZone = Ext.create('Ext.dd.DropZone', el, {
			getTargetFromEvent: function(e) { return e.getTarget(dropSelector); },
			onNodeEnter: function(target, dd, e, data){ Ext.fly(target).addCls('target-hover'); },
			onNodeOut: function(target, dd, e, data){ Ext.fly(target).removeCls('target-hover'); },

			onNodeOver: function(target, dd, e, data){
				if(data && data.username) {
					return Ext.dd.DropZone.prototype.dropAllowed;
				}
			},

			onNodeDrop: function(target, dd, e, data){
				return SharingUtils.shareWith(me.record, data.usernames || [data.username]);
			}
		});
	}
});
