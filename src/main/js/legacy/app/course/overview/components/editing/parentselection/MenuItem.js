var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.parentselection.MenuItem', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-parentselection-menuitem',

	cls: 'parentselection-menuitem',

	afterRender: function () {
		this.callParent(arguments);

		this.itemTpl.append(this.el, this.parseItemData(this.selectionRecord));

		this.mon(this.el, 'click', this.handleClick.bind(this));
	},


	selectRecord: function (record) {
		if (!this.rendered) {
			this.on('afterrender', this.selectRecord.bind(this, record));
			return;
		}

		if (record && this.selectionRecord.getId() === record.getId()) {
			this.addCls('selected');
		} else {
			this.removeCls('selected');
		}
	},


	handleClick: function (e) {
		if (this.doSelection) {
			e.stopPropagation();
			this.doSelection(this.selectionRecord);
		}
	}
});
