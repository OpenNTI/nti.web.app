Ext.define('NextThought.view.assessment.Score',{
	extend: 'Ext.container.Container',
	alias: 'widget.assessment-score',
	requires: [
		'Ext.data.JsonStore',
		'NextThought.chart.series.Score'
	],

	initComponent: function(){
		this.store = Ext.data.JsonStore.create({fields: ['p']});
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

			series: [{ type: 'score', angleField: 'p' }]
		});

		this.setValue(this.value || 80);
	},


	setValue: function(value){
		var data = [{p:value},{p:(100-value)}],
			s = this.down('chart').series.first();

		if( s.setValue ){
			s.setValue(value);
		}
		else {
			s.scoreValue = value;
		}

		this.value = value;

		if(value === 0){
			data.shift();
		}

		this.store.loadRawData(data,false);
	}
});
