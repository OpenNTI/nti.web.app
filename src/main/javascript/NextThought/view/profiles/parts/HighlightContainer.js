Ext.define('NextThought.view.profiles.parts.HighlightContainer',{
	extend: 'Ext.Component',
	alias: 'widget.profile-activity-highlight-container',

	cls: 'activity-highlight-container',
	mixins: {
		profileLink: 'NextThought.mixins.ProfileLinks'
	},

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
				{ cls: 'icon', style: 'background-image: url({icon});', 'data-ntiid':'{ntiid}' },
				{ cn:[
					{ tag: 'tpl', 'for': 'pages', cn:[
						{ cls: 'page', cn: [
							{ cls: 'label', html: '{label}', 'data-ntiid':'{ntiid}' },
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
			c = me.up('[user]'),
			u = c ? c.user : null,
			name = u ? u.getName() : '...',
			items = me.items,
			count = items.length,
			books = {},
			d;

		if(this.rendered){ delete me.renderData; }

		d = Ext.apply(me.renderData||{},{
			name: name,
			count: count === 1 ? 'a' : count,
			plural: count === 1 ? '' : 's',
			date: Ext.Date.format(me.date,'F j, Y')
		});

		function byTime(a,b){
			function g(x){ return x.get ? x.get('CreatedTime').getTime() : 0; }
			a = g(a);
			b = g(b);
			return a - b;
		}

		Ext.Array.sort(this.items,byTime);

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
			var book = {pages:[], ntiid: k};
			data.books.push(book);
			Ext.Object.each(root,function(k,items){
				var page = {items:[], ntiid: k};
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
		var me = this;
		me.callParent(arguments);
		me.enableProfileClicks(me.nameEl);
		me.mon(me.bodyEl,'click', me.onClick, me);

		me.setupContainerRenderData = Ext.Function.createBuffered(me.setupContainerRenderData,10,me,null);
		Ext.each(this.items,function(i){ me.mon(i, 'destroy', me.onHighlightRemoved, me); });
	},


	/**
	 * Attempts to add the record to this container.  If the date is a match it adds it. Otherwise it skips it.
	 *
	 * @param {NextThought.model.Highlight} record
	 * @returns {boolean} True if it was added, false otherwise.
	 */
	collate: function(record){
		var d = record.get('CreatedTime'),
			n = new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
		if(n === this.date.getTime() && /highlight$/i.test(record.get('Class')||'')){
			this.addHighlight(record);
			return true;
		}

		return false;
	},


	addHighlight: function(record){
		this.items.unshift(record);
		this.setupContainerRenderData();
	},


	onHighlightRemoved: function(item){
		Ext.Array.remove(this.items,item);
		this.mun(item,'destroy',this.onHighlightRemoved,this);

		if(this.items.length > 0){
			this.setupContainerRenderData();
			return;
		}

		this.destroy();
	},


	onClick: function(e){
		var t = e.getTarget('[data-ntiid]',null,true);
		if(!t){ return; }

		e.stopEvent();

		if(t.is('.selected-text')){
			//highlight
			console.debug('clicked highlight: ', t.getAttribute('data-ntiid'));
			return;
		}

		console.debug('clicked content path/icon, goto: ', t.getAttribute('data-ntiid'));
	}
});
