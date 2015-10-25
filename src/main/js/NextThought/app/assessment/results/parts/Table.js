Ext.define('NextThought.app.assessment.results.parts.Table', {
	extend: 'Ext.Component',
	alias: 'widget.assessment-table-results',

	cls: 'result table',

	renderTpl: Ext.DomHelper.markup({
		tag: 'table', cn: [
			{tag: 'thead', cn: [
				{tag: 'tr', cn: [
					{tag: 'tpl', 'for': 'header', cn: [
						{tag: 'th', html: '{label}'}
					]}
				]}
			]},
			{tag: 'tbody', cn: [
				{tag: 'tpl', 'for': 'rows', cn: [
					{tag: 'tr', cn: [
						{tag: 'tpl', 'for': 'columns', cn: [
							{tag: 'td', cls: '{cls}', html: '{label}'}
						]}
					]}
				]}
			]}
		]
	}),


	beforeRender: function() {
		this.callParent(arguments);

		var header = this.__getHeader(),
			rows = this.__getRows();

		this.renderData = Ext.apply(this.renderData || {}, {
			header: header,
			rows: rows
		});
	},


	__getHeader: function() {
		return this.table.header.map(function(h) {
			return {label: h};
		});
	},


	__getRows: function() {
		function findMax(entries) {
			var max = -1;

			entries.forEach(function(entry) {
				if (max < entry) {
					max = entry;
				}
			});

			return max;
		}

		return this.table.rows.map(function(row) {
			var max = findMax(row.slice(1));

			return {
				columns: row.map(function(entry) {
					return {
						label: entry,
						cls: max === entry ? 'max' : ''
					};
				})
			};
		});
	}
});
