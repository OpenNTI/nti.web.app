Ext.define('NextThought.mixins.ShareableTarget', {
	requires: [
		'Ext.dd.DragZone',
		'Ext.dd.DropZone',
		'Ext.dd.DragSource',
		'Ext.dd.DropTarget',
		'NextThought.util.Sharing'
	],

	afterRender: function() {
		this.registerDragZone(this.dragSelector || 'img');
		this.registerDropZone(this.dropSelector || 'img');
	},

	registerDragZone: function(dragSelector) {
		var me = this, e = this.getEl();
		this.dragZone = Ext.dd.DragZone.create(e, {
			getDragData: function(e) {
				var sourceEl = e.getTarget(dragSelector), d;
				if (sourceEl) {
					d = sourceEl.cloneNode(true);
					d.id = Ext.id();
					d.setAttribute('style', '');
					this.dragData = {
						sourceEl: sourceEl,
						repairXY: Ext.fly(sourceEl).getXY(),
						ddel: d,
						username: me.user.getId()
					};
					return this.dragData;
				}
			},

			getRepairXY: function() {
				return this.dragData.repairXY;
			}
		});
	},


	registerDropZone: function(dropSelector) {
		var me = this;
		this.dropZone = Ext.dd.DropZone.create(this.getEl(), {
			getTargetFromEvent: function(e) { return e.getTarget(dropSelector); },
			onNodeEnter: function(target, dd, e, data) { Ext.fly(target).addCls('target-hover'); },
			onNodeOut: function(target, dd, e, data) { Ext.fly(target).removeCls('target-hover'); },

			onNodeOver: function(target, dd, e, data) {
				if (data && data.shared) {
					return Ext.dd.DropZone.prototype.dropAllowed;
				}
			},

			onNodeDrop: function(target, dd, e, data) {
				return SharingUtils.shareWith(data.shared, [me.username]);
			}
		});
	}
});
