Ext.define('NextThought.view.menus.search.Result-Chat',{
	extend: 'NextThought.view.menus.search.Result',
	alias: 'widget.search-result-messageinfo',
	cls: 'search-result',

	requires: ['NextThought.util.Search'],

	renderTpl: Ext.DomHelper.markup([
		{ cls:'title', cn: [
			{cls: 'occupants', cn:[
					{tag: 'span', cls: 'names', html: '{occupants}'}
			]},
			{cls: 'time', cn:[
				{tag: 'span', cls: 'started', html: 'Sent: {sent}'}
				
			]},
			{cls: 'lasted',cn:[
				{tag: 'span', cls: 'lasted', html: 'Lasted: {duration}'}
			]},
		]},

		{ cls: 'wrap',
			cn:[
				{cls: 'name', cn: [
					{tag: 'span', cls:'created', html:'{creator} said:'}
				]},
				{cls: 'fragments', cn: [
						{tag:'tpl', 'for':'fragments', cn:[
							{cls: 'fragment', ordinal: '{#}', html: '{.}'}
						]}
				]}
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
			var occupants = obj.get('Occupants'), 
				started = obj.get('CreatedTime'),
				ended = hit.get('Last Modified'),
				date = new Date (hit.get('Last Modified')),
				creator = hit.get('Creator');

			//look for the user email in occupants and replace it with me
			occupants.forEach(function(element,index,array){
				if(isMe(element)){
					occupants[index] = 'me';
				}
				return;
			});

			//check if the user created it
			if(isMe(creator)){
				creator = 'I';
			}

			me.renderData = Ext.apply(me.renderData || {},{
				occupants:"Between "+occupants[0]+" and "+((occupants.length - 1 > 1) ? (occupants.length - 1)+" others" : "1 other"),
				sent: Ext.Date.format(date, 'M-j g:i A'),
				duration: obj.timeDifference(ended,started).replace(/ ago/i,''),
				creator: creator
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
		this.wrapFragmentHits();
		$AppConfig.service.getObject(containerId,success,failure);
		//this.callParent(arguments);
		this.getEl().on({
			scope: this,
			animationend: this.animationEnd,
			webkitAnimationEnd: this.animationEnd,
			click: this.clicked
		});
	},

	clicked: function(e){
	}

	
});
