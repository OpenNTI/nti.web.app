Ext.define('NextThought.view.menus.search.Result-Chat',{
	extend: 'NextThought.view.menus.search.Result',
	alias: 'widget.search-result-messageinfo',
	cls: 'search-result',

	requires: ['NextThought.util.Search'],

	renderTpl: Ext.DomHelper.markup([{
		cls: 'history chat',
		cn:[
				{cls: 'occupants', cn:[
					{tag: 'span', cls: 'names', html: '{occupants}'},
					{tag: 'span', cls: 'count', html: '{count}'}
				]},
				{cls: 'time', cn:[
					{tag: 'span', cls: 'started', html: '{started}'},
					{tag: 'span', cls: 'date', html: '{date}'},
					' - Lasted ',
					{tag: 'span', cls: 'duration', html:'{duration}'}
				]},
				{cls: 'created', cn: [
					{tag: 'span', cls:'created', html:'{creator} said:'}
				]},
				{cls: 'fragments', cn: [
						{tag:'tpl', 'for':'fragments', cn:[
							{cls: 'fragment', ordinal: '{#}', html: '{.}'}
						]}
					]
				}
			],
	}]),

	initComponent: function(){
		var me = this,
			hit = me.hit,
			containerId = hit.get('ContainerId'),
			name = hit.get('Creator');
		me.callParent(arguments);

		me.renderData = Ext.apply(me.renderData || {},{
			occupants: 'Rendering...',
            count: '',
            started: '',
			date: '',
			duration: '',
			creator: '',
			fragments: ''
		});


	},

	afterRender: function(){
		var me = this,
			hit = me.hit,
			containerId = hit.get('ContainerId');

		function success(obj){
			var old = me.renderData;
			me.renderData = Ext.apply(me.renderData || {},{
				occupants: obj.get('Occupants'),
	            count: obj.get('MessageCount'),
	            started: obj.get('CreatedTime'),
				date: 'Feb 28',
				duration: '9 min',
				creator: 'chris.utz@nextthought.com',
				fragments: Ext.pluck(hit.get('Fragments'), 'text')
			});
			if(me.rendered){
				me.renderTpl.overwrite(me.el, me.renderData);
			}
			else{
				me.renderTpl.overwrite(me.renderData);
			}
		}

		function failure(req,resp){
			console.log("Error fetching chat transcript");
		}

		$AppConfig.service.getObject(containerId,success,failure);
	}

	
});
