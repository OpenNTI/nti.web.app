Ext.define('NextThought.view.assessment.input.Base',{
	extend: 'Ext.Component',
	alias: 'widget.abstract-question-input',

	requires: [
		'NextThought.view.menus.AnswerHistory'
	],

	cls: 'field',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'response-container',
			cn:[
				{ cls: 'inputbox', html: '{input}' },
				{ cls:'historyMenu' },
				{ cls: 'solution', cn:[
					{ cls: 'close' },
					{ cls: 'answer', cn:[{tag: 'span'}] },
					{ cls: 'explanation'}
				] }
			]
		},{
			cls: 'footer',
			cn: [{
				cls: 'left', html: '{toolbar}'
			},{
				cls: 'right',
				cn: [
					{cls:'action check'},
					{cls:'action solution', html: 'Show Solution'}
				]
			}]
		}
	]),


	renderSelectors: {
		inputBox: '.response-container .inputbox',
		historyMenuEl:'.response-container .historyMenu',
		solutionBox: '.response-container .solution',
		solutionClose: '.response-container .solution .close',
		solutionAnswerBox: '.response-container .solution .answer span',
		solutionExplanationBox: '.response-container .solution .explanation',
		showSolutionBtn: '.footer .action.solution',
		checkItBtn: '.footer .action.check',
		footer: '.footer'
	},


	onClassExtended: function(cls, data) {
		data.renderSelectors = Ext.applyIf(data.renderSelectors||{},cls.superclass.renderSelectors);

		data.inputTpl = data.inputTpl || cls.superclass.inputTpl || false;
		data.toolbarTpl = data.toolbarTpl || cls.superclass.toolbarTpl || false;

		//merge in subclass's input template
		var tpl = this.prototype.renderTpl
				.replace('{input}',data.inputTpl||'')
				.replace('{toolbar}',data.toolbarTpl||'');

		if(!data.renderTpl){
			data.renderTpl = tpl;
		}
		else {
			data.renderTpl = data.renderTpl.replace('{super}',tpl);
		}
	},


	filterHTML: function(html){
		var root = LocationProvider.getContentRoot();
		function fixRef(original,attr,url) {
			return (/^data:/i.test(url)||Globals.HOST_PREFIX_PATTERN.test(url))
					? original
					: attr+'="'+root+url+'"'; }

		return html.replace(/<\/?(html|head|meta|title|link|body|a|p)((( |\t)[^>]*)?)>/ig, '')
				.replace(/^\s+/,'')
				.replace(/\s+$/,'')
				.replace(/(src)="(.*?)"/igm, fixRef);
	},


	getSolutionContent: function(part) {
		var solutions = [];
		Ext.each(part.get('solutions'),function(s){
			solutions.push(s.get('value'));
		});

		return this.filterHTML(solutions.join('<br/> or: '));
	},


	initComponent: function(){
		this.callParent(arguments);
		this.addEvents({
			'enable-submission':true,
			'disable-submission':true
		});
		this.enableBubble(['enable-submission','disable-submission']);
	},

/*
	getBubbleTarget: function(){
		return this.up('assessment-question');
	},
*/

	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.showSolutionBtn, {
			scope: this,
			click: this.toggleSolution
		});

		this.mon(this.checkItBtn,{
			scope: this,
			click: this.checkit
		});

		this.mon(this.solutionClose,{
			scope: this,
			click: this.hideSolution
		});

		this.mon(this.inputBox, {
			scope: this,
			click: this.editAnswer
		});

		this.mon(this.historyMenuEl, {
			scope:this,
			click: this.showHistoryMenu
		});

		this.checkItBtn.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.solutionAnswerBox.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.inputBox.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.solutionBox.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.footer.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.historyMenuEl.setVisibilityMode(Ext.dom.Element.DISPLAY);

        //if there are images, after they load, update layout.
        this.solutionBox.select('img').on('load',function(){
            this.updateLayout();
            this.syncElementHeight();
        },this,{single:true});

		this.reset();
		this.disableSubmission();
		this.shouldShowAnswerHistory();
	},


	checkit: function(){
		if(this.submissionDisabled){return;}
		if(this.submitted){
			this.editAnswer();
			return;
		}

		this.setSubmitted();
		this.up('assessment-question').checkIt();
	},

	editAnswer: function(){
		var ans;
		if(this.submitted){
			ans = this.getValue();
			this.up('assessment-question').reset();
			this.setValue(ans);
			this.focus();
			this.enableSubmission();
		}
	},


	setSubmitted: function(){
		this.submitted = true;
		this.checkItBtn.update('Try again');
	},


	getOrdinal: function(){
		if(!Ext.isNumber(this.ordinal)){
			Ext.Error.raise('The question part\'s ordinal was not set or incorrectly set.');
		}
		return this.ordinal;
	},


	getValue: function(){
		console.log(this.$className+' does not implement the getValue function');
	},


	setValue: function(){
		console.log(this.$className+' does not implement the setValue function');
	},


	updateSolutionButton: function(){
		var p = this.part,
			a = this.solutionAnswerBox,
			b = this.showSolutionBtn,
			e = this.solutionExplanationBox,

			answer = this.el.down('.answer'),
			label = b.getHTML().replace(/(solution|hint)$/i,'{0}');

		answer.setVisibilityMode(Ext.dom.Element.DISPLAY);

		b.update(label.replace('{0}', this.hintActive? 'Hint' : 'Solution'));

		if(this.hintActive){
			answer.hide();
			e.update(this.filterHTML( p.get('hints')[this.currentHint || 0].get('value') ));
		}
		else if(this.submitted){
			answer.show();
			a.update(this.getSolutionContent(p));
			e.update(this.filterHTML(p.get('explanation')));
		}
		else {
			a.update('');
			e.update('');
		}

		if(e.getHTML()==='' && a.getHTML()===''){ b.hide(); } else { b.show(); }
	},


	submitOrTabNext: function(dom){
		var i, x, next, nextTabIndex = String(parseInt(dom.getAttribute('tabIndex'),10)+1),
            partLen = this.question.get('parts').length;
		if(this.questionSet || (partLen > 1 && (partLen-1) !== this.ordinal)){
			i = this.el.up('.assessment-overlay').query('.tabable');
			x = i.length-1;
			for(x; x>=0; x--){
				if(i[x].getAttribute('tabIndex')===nextTabIndex){
					next = i[x];
					break;
				}
			}
			if(!next){
				x = i.length-1;
				for(x; x>=0; x--){
					if(i[x]===dom){
						next = i[x+1]||i[0];
						break;
					}
				}
			}
			next.focus();
		}
		else{
			this.checkit();
		}
	},

	shouldShowAnswerHistory: function(){
		var id = this.up('[question]').question.getId();
		if(!id){ return false; }

		this.loadAnswerHistory(id);
	},

	showHistoryMenu: function(e){

		var id;
		if(!this.historyMenu){
			this.historyMenu = Ext.widget('answer-history-menu', {
				width: this.inputBox.getWidth(),
				ownerCmp: this,
				items: [{
					text: 'ANSWER HISTORY', xtype: 'labeledseparator'
				},{
					text: 'loading...'
				}]
			});
		}

		id = this.up('[question]').question.getId();
		this.historyMenu.showBy(this.inputBox,'tl-bl?',[0,0]);
		this.loadAnswerHistory(id);
	},

	buildAnswerHistoryStore: function(id){
		var s = NextThought.store.PageItem.create({containerid:id}),
			params = 'application/vnd.nextthought.assessment.assessedquestion', url, root, me = this;

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams||{},{
			sortOn: 'createdTime',
			accept: params,
			sortOrder: 'descending'
		});

		root = 'tag%3Anextthought.com%2C2011-10%3ARoot';
		url = s.proxy.url;
		s.proxy.url = url.replace(root, encodeURIComponent(id));

		this.answerHistStore = s;


		function func(store, recs){
			if(!recs || recs.length === 0){
				me.historyMenuEl.hide();
			}
			else{
				if(!me.historyMenuEl.isVisible()){
					me.historyMenuEl.show();
				}
			}
		}

		s.on('load', func);
		s.on('add', func);
		s.on('changed', function(){ me.loadAnswerHistory(id); });
	},


	getPreviousMenuItemType: function(){
		return 'menuitem';
	},

	loadAnswerHistory: function(id){
		var me = this;

		function loaded(records){
			var parts, items = [];
			Ext.each( records, function(r){
				parts = r.get('parts');
				Ext.each(parts, function(p){
					var t = p.get('submittedResponse');
					items.push({
						xtype: me.getPreviousMenuItemType(),
						text: t
					});
				});
			});

			//FIXME: somehow the ds is returning rec in reverse order.
			if(me.historyMenu && items.length > 0){
				me.historyMenu.removeAll();
				me.historyMenu.insert(0, {text: 'ANSWER HISTORY', cls:'answer-title'});
				me.historyMenu.add(items.reverse());
			}
		}

		if(!this.answerHistStore){
			this.buildAnswerHistoryStore(id);
			this.answerHistStore.load(loaded);
		} else{
			this.answerHistStore.reload();
		}
	},

	updateWithResults: function(assessedQuestion){
		var parts = assessedQuestion.get('parts'),
			part = parts[this.ordinal];

		if (part.isCorrect()) { this.markCorrect(); }
		else {this.markIncorrect(); }
		this.setValue(part.get('submittedResponse'));
		if(!this.historyMenuEl.isVisible()){
			this.shouldShowAnswerHistory();
		}
		this.answerHistStore.fireEvent('changed');
	},


	markCorrect: function(){
		this.hideSolution();
		this.updateSolutionButton();
		this.checkItBtn.hide();
		this.up('question-parts').removeCls('incorrect').addCls('correct');
		this.checkItBtn.removeCls('wrong');
		this.updateLayout();
	},


	markIncorrect: function(){
		this.hideSolution();
		this.checkItBtn.addCls('wrong');
		this.hintActive = false;
		this.updateSolutionButton();
	},


	reset: function(){
		this.submitted = false;
		this.up('question-parts').removeCls(['incorrect','correct']);
		this.hintActive = (this.part.get('hints').length > 0);
		this.currentHint = 0;
		this.updateSolutionButton();
		this.checkItBtn.show();
		this.footer.show();
		this.checkItBtn.removeCls('wrong').update('Check It!');
		this.hideSolution();
		this.disableSubmission();
		this.updateLayout();
	},


	enableSubmission: function(){
		delete this.submissionDisabled;
		this.checkItBtn.removeCls('disabled');
		if( this.questionSet ){
			this.questionSet.fireEvent('answered', this.question, this.part, true);
		}
		this.fireEvent('enable-submission', this.ordinal);
	},


	disableSubmission: function(){
		this.submissionDisabled = true;
		this.checkItBtn.addCls('disabled');
		if( this.questionSet ){
			this.questionSet.fireEvent('answered', this.question, this.part, false);
		}
		this.fireEvent('disable-submission', this.ordinal);
	},


	toggleSolution: function(){
		if(this.solutionBox.isVisible()){
			this.hideSolution();
		}
		else {
			this.showSolution();
		}
	},


	hideSolution: function(){
		var label = this.showSolutionBtn.getHTML();
		this.showSolutionBtn.update(label.replace('Hide','Show'));
		this.solutionBox.hide();
		this.inputBox.show();
		this.updateLayout();
	},


	showSolution: function(){
		var label = this.showSolutionBtn.getHTML();

		this.updateSolutionButton();
		this.currentHint = ((this.currentHint+1) % (this.part.get('hints').length || 1));

        //if there are images, after they load, update layout.
        this.solutionBox.select('img').on('load',function(){
            this.updateLayout();
            this.syncElementHeight();
        },this,{single:true});

		this.showSolutionBtn.update(label.replace('Show','Hide'));
		this.inputBox.hide();
		this.solutionBox.show();
		this.updateLayout();
	}
});
