Ext.define('NextThought.app.windows.StateStore', {
	extend: 'NextThought.common.StateStore',

	statics: {
		MIME_TO_CMP: {},

		register: function(mimeType, cmp) {
			this.MIME_TO_CMP[mimeType] = cmp;
		}
	},


	obj_map: {},


	getComponentForMimeType: function(type) {
		return this.self.MIME_TO_CMP[type];
	},


	fireShowWindow: function(object, path, el, monitors, precache) {
		this.fireEvent('show-window', object, path, el, monitors, precache);
	},


	firePushWindow: function(obj, title, route, precache) {
		this.fireEvent('push-window', obj, title, route, precache);
	},


	fireCloseWindow: function() {
		this.fireEvent('close-window');
	},


	cacheObject: function(id, obj, el, monitors, precache) {
		this.obj_map[id] = {
			obj: obj,
			el: el,
			monitors: monitors,
			precache: precache
		};
	},


	getObject: function(id) {
		return this.obj_map[id];
	}
});
