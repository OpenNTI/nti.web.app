var Ext = require('extjs');
var ComponentsShareSearch = require('../../../../../../sharing/components/ShareSearch');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.admin.email.components.ScopeSearch', {
	extend: 'NextThought.app.sharing.components.ShareSearch',
	alias: 'widget.scope-sharesearch',


	setupSearchList: function() {
		this.searchList = this.add({
			xtype: 'share-search',
			ownerCls: this.ownerCls,
			loadMaskContainer: this.el,
			selectItem: this.selectItem.bind(this),
			onRecordClick: function(view, record) {
				this.selectItem(record);
			}
		});
	}

});