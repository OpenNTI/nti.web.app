Ext.define('NextThought.view.profiles.parts.HighlightContainer',{
	extend: 'Ext.Component',
	alias: 'widget.profile-activity-highlight-container',

	cls: 'activity-highlight-container',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn:[
			{tag: 'span', cls: 'name link', html:'{name}'},
			' created ', {tag: 'span', cls:'count', html:'{count}'},
			' highlight',{tag:'span',cls:'plural',html:'{plural}'},
			' on {date}'
		]},
		{ cls: 'box' }
	]),


	renderSelectors: {
		headerEl: '.header',
		nameEl: '.header .name',
		countEl: '.header .count',
		pluralEl:'.header .plural',
		bodyEl: '.box'
	},

	selectedTpl: new Ext.XTemplate(Ext.DomHelper.markup(
			{tag:'tpl', 'for':'.', cn:[
				{tag:'tpl', 'if':'.',cn:[
					{tag:'span', html:'{.}' }
				]}
			]}
	)),

	tpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{ tag: 'tpl', 'for': 'books', cn:[
			{ cls: 'book', cn: [
				{ cls: 'icon', style: 'background-image: url({icon});'},
				{ cn:[
					{ tag: 'tpl', 'for': 'pages', cn:[
						{ cls: 'page', cn: [
							{ cls: 'label', html: '{label}' },
							{ tag: 'tpl', 'for': 'items', cn:[
								{ cls: 'selected-text', 'data-ntiid':'{ntiid}', cn:[
									{tag: 'span', html: '{text}'},{cls:'tip'}
								]}
							]}
						]}
					]}
				]}
			]}
		]}
	)),


	setupContainerRenderData: function(){
		var me = this,
			u = me.up('[user]').user,
			items = me.items,
			count = items.length,
			books = {},
			d;

		if(this.rendered){ delete me.renderData; }

		d = Ext.apply(me.renderData||{},{
			name: u.getName(),
			count: count === 1 ? 'a' : count,
			plural: count === 1 ? '' : 's',
			date: Ext.Date.format(me.date,'F j, Y')
		});

		Ext.each(items,function( i ){
			LocationMeta.getMeta(i.get('ContainerId'),function(meta){
				i.meta = meta;
				count--;

				var root = meta.ContentNTIID,
					page = meta.NTIID;

				root = (books[root] = books[root] || {});
				page = (root[page] = root[page] || []);
				page.push(i);

				if(!count){
					me.setupBookRenderData(d,books);
					me.maybeFillIn(d);
				}
			});
		});

		return d;
	},

	/**
	 * This is intended to be a callback. No return value. We modify {data}
	 * @param data {Object} the output
	 * @param groupings {Object} the input
	 */
	setupBookRenderData: function(data,groupings){
		data.books = [];
		Ext.Object.each(groupings,function(k,root){
			var book = {pages:[]};
			data.books.push(book);
			Ext.Object.each(root,function(k,items){
				var page = {items:[]};
				book.pages.push(page);
				Ext.each(items,function(i){
					if(!book.hasOwnProperty('icon')){ book.icon = i.meta.getIcon(true); }
					if(!page.hasOwnProperty('label')){ page.label = i.meta.getPathLabel(); }
					page.items.push({text: i.get('selectedText'), ntiid: i.getId()});
				});
			});
		});
	},


	maybeFillIn: function(data){
		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.maybeFillIn,this,[data]),this,{single:true});
			return;
		}

		this.tpl.overwrite(this.bodyEl,data);

		var me = this;
		this.bodyEl.select('.selected-text > span').each(function(s){
			var words = (s.dom.innerHTML||'').trim();
			me.selectedTpl.overwrite(s,words.split(' '));
		});
	},



	/**
	 * @override {Ext.Component#beforeRender}
	 */
	beforeRender: function(){
		this.callParent(arguments);
		this.setupContainerRenderData();
	},


	afterRender: function(){
		this.callParent(arguments);
	}
});
