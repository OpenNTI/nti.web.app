Ext.define('NextThought.view.assessment.Score',{
	extend: 'Ext.container.Container',
	alias: 'widget.assessment-score',

	initComponent: function(){
		this.store = Ext.create('Ext.data.JsonStore', {fields: ['p']});
		this.callParent(arguments);
		this.add({
			xtype: 'chart',
			width: 75,
			height: 75,
			animate: true,

			store: this.store,
			insetPadding: 10,
			shadow: false,
			legend: false,

			series: [{
				type: 'pie',
				donut: 65,
				angleField: 'p',
				colorSet: ['#a5c959','#d9d9d9'],
				style: {
					"stroke-width": 2,
					"stroke-opacity": 1,
					stroke: '#fff'
				}
			}]
		});

		this.setValue(this.value || 80);
	},


	setValue: function(value){
		this.value = value;
		this.store.loadRawData([{p:value},{p:(100-value)}],false);
	}
});
