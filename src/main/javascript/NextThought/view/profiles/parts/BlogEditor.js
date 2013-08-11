Ext.define('NextThought.view.profiles.parts.BlogEditor',{
	extend: 'NextThought.editor.Editor',
	alias: 'widget.profile-blog-editor',

	enableTags: true,
	enableTitle: true,
	enableVideo: true,
	enableShareControls: true,
    keyboardUp: false,
    amountScrolled: 0,

	cls: 'blog-editor',
	headerTplOrder: '{title}{toolbar}',
	//TODO: update CSS to not require this nesting.
	renderTpl: Ext.DomHelper.markup({ cls: 'editor active', html:'{super}' }),

	renderSelectors: {
		cancelEl: '.action.cancel',
		saveEl: '.action.save',
		publishEl: '.action.publish',
		titleWrapEl: '.title',
		footerEl: '.footer',
		editorBodyEl: '.content',
		editorEl: '.editor'
	},

    requires: [
        'NextThought.modules.TouchSender',
        'NextThought.view.chat.TouchHandler'
    ],

    mixins: [
        'NextThought.mixins.ModuleContainer'
    ],

	initComponent: function(){
		this.callParent(arguments);
		this.addEvents(['save-post']);
	},


	afterRender: function(){
		this.callParent(arguments);
		var r = this.record,
			h,
			profileEl = Ext.get('profile'),
			titleEl = this.titleEl,
			hasScrollBar = Ext.getDom(profileEl).scrollHeight !== profileEl.getHeight();

		this.mon(this.tags,'new-tag', this.syncHeight,this);

		if( r ){
			h = r.get('headline');
			this.editBody(h.get('body'));
			this.setTitle(h.get('title'));
			this.setTags(h.get('tags'));
			this.setSharedWith(r.getSharingInfo());
		}

		this.sizer = Ext.DomHelper.insertAfter(this.el,{},true);
		this.sizer.setHeight(1000);

		this.mon(this.titleWrapEl,'keyup',function(){ this.clearError(this.titleWrapEl); },this);
		profileEl.addCls('scroll-lock'+ (hasScrollBar? ' scroll-padding-right':''));

		Ext.EventManager.onWindowResize(this.syncHeight,this,null);

        if(Ext.is.iPad){
            var navigation = Ext.Element.select('.main-navigation');

            /*navigation.on('mouseover', function(e){
             console.log("navigation mousehover called");
             Ext.Element.select('.x-panel-navigation-menu').hide();
             this.titleEl.focus();
             }, this, {delay:550});*/

            var titleInput = this.getEl().down('.title > :first');
            titleInput.on('focus', function(){
                this.keyboardUp = true;

            }, this);

            titleEl.on('focus', function(){
                this.keyboardUp = true;
            }, this);

            titleInput.on('blur', function(){
                this.keyboardUp = false;

            }, this);

            titleEl.on('blur', function(){
                this.keyboardUp = false;
            }, this);


            //Close navigation menu when clicking on title
            //TODO find a way to keep it from popping up in the first place.
            titleInput.on('focus', function(){
                Ext.Element.select('.x-panel-navigation-menu').hide();
            }, this, {delay:1000});

            titleEl.on('focus', function(){
                Ext.Element.select('.x-panel-navigation-menu').hide();
            }, this, {delay:1000});
        }

		Ext.defer(Ext.Function.createSequence(this.syncHeight,this.focus,this),500,this);//let the animation finish
	},


	focus: function focus(){
		this.titleEl.focus();
		this.moveCursorToEnd(this.titleEl);

		if(Ext.is.iPad){
            Ext.Element.select('.x-panel-navigation-menu').hide();
			if(!focus.setup){
				focus.setup = true;
                this.setUpTouch();
			}
        }
	},


    setUpTouch: function(){
        var me = this;

        var cancelButton = this.getEl().down('.cancel'),
            saveButton = this.getEl().down('.save');

        cancelButton.dom.addEventListener('touchstart', function(e){
            cancelButton.dom.click();
        }, this);

        saveButton.dom.addEventListener('touchstart', function(e){
            saveButton.dom.click();
        }, this);

        var container = this;


        var addPeopleField = Ext.get(Ext.query('.recipients')[0]).down('input'),
            tagsField = Ext.get(Ext.query('.post-view')[0]).down('.tags').down('input'),
            messageField = Ext.get(Ext.get(Ext.query('.content')[0]));

        addPeopleField.on('focus', function(){
            this.keyboardUp = true;
        }, this);

        tagsField.on('focus', function(){
            this.keyboardUp = true;
        }, this);

        messageField.on('focus', function(){
            this.keyboardUp = true;
        }, this);

        addPeopleField.on('blur', function(){
            this.keyboardUp = false;
        }, this);

        tagsField.on('blur', function(){
            this.keyboardUp = false;
        }, this);

        messageField.on('blur', function(){
            this.keyboardUp = false;
        }, this);

        container.on('touchElementIsScrollable', function(ele, callback) {
            callback(false);
        });

        container.on('touchElementAt', function(x,y, callback) {
            Ext.Element.select('.x-panel-navigation-menu').hide();
            var element;
            console.log("x:" + x + " y:" + y);
            if(this.keyboardUp){
                element = Ext.getDoc().dom.elementFromPoint(x, y-396);
            }
            else{
                element = Ext.getDoc().dom.elementFromPoint(x, y);
            }
            callback(element);
        },this);

    },


	destroy: function(){
		Ext.get('profile').removeCls('scroll-lock scroll-padding-right');
		Ext.EventManager.onWindowResize(this.syncHeight,this,null);
		Ext.destroy(this.sizer);

        //after iPad version goes back to Thoughts, can't scroll down to see
        //profile, so set height back to normal when quitting editor
        if(Ext.is.iPad){//pushes the profile up
            var pEl = Ext.get('profile');
            pEl.scrollBy(0, -400, true);
        }

		return this.callParent(arguments);
	},


	moveCursorToEnd: function(el) {
		//this is only for input/textarea elements
		el = Ext.getDom(el);
		if (typeof el.selectionStart === "number") {
			el.selectionStart = el.selectionEnd = el.value.length;
		}
		else if (el.createTextRange !== undefined) {
			el.focus();
			var range = el.createTextRange();
			range.collapse(false);
			range.select();
		}
	},


	syncHeight: function(){
		var pEl = Ext.get('profile'),
			el = this.editorBodyEl,
			footEl = this.footerEl,
			vpH = Ext.Element.getViewportHeight(),
			top,
			containerTop = pEl.down('.profile-items').getY() + pEl.getScroll().top,
			scrollPos = vpH < 800 ? (containerTop - pEl.getY()) : 0,
			newHeight;

		if(!el){
			return;
		}

		top = el.getY() + pEl.getScroll().top - scrollPos;

		newHeight = ((vpH - top) - footEl.getHeight()) - 8;
		this.sizer.setHeight(newHeight);

		el.setHeight(newHeight);

		Ext.defer(function(){
			pEl.scrollTo('top',scrollPos);
		},100);

		Ext.defer(this.updateLayout,700,this,[]);
	},


	onKeyUp: function(){
		this.clearError(this.editorBodyEl);
	},


	clearError:function(el){ el.removeCls('error-top').set({'data-error-tip':undefined}); },


	markError: function(el,message){ el.addCls('error-tip').set({'data-error-tip':message}); },


	onSave: function(e){
		e.stopEvent();
		var v = this.getValue(),
			re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g, t;

		if( !Ext.isArray(v.body) || v.body.join('').replace(re,'') === '' ){
			console.error('bad blog post');
			this.markError(this.editorBodyEl,'You need to type something');
			return;
		}

		if(Ext.isEmpty(v.title)){
			console.error('You need a title');
			this.markError(this.titleWrapEl,'You need a title');
			this.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		if(/^[^a-z0-9]+$/i.test(v.title)){
			console.error('Title cant be all special chars');
			this.markError(this.titleWrapEl,"Title can't be all special characters.");
			this.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		if(/^@{1,}/.test(v.title)){
			console.error('Title cant start with @');
			this.markError(this.titleWrapEl,"Title can't start with @");
			this.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		//console.debug('Save:',v);
		//If new there will not be a record on this, it will be undefined
		// NOTE: For now, as a matter of simplicit, we are ignoring the 'publish' field.
		// We will derive it from the sharedWith value. ~PM.
		this.fireEvent('save-post',this, this.record, v.title, v.tags, v.body, v.sharingInfo);
	},


	onSaveSuccess: function(){
		this.destroy();
	},


	onSaveFailure: function(proxy, response, operation){
		var msg = 'An unknown error occurred saving your Thought.', error;

		if(response && response.responseText){
			error = JSON.parse(response.responseText) || {};
			if(error.code === "TooLong"){
				msg = "Could not save your Thought. The title is too long. It can only be 140 characters or less";
			}
		}
		alert({title: 'Error', msg: msg, icon: 'warning-red'});
		console.debug(arguments);
	},


	onCancel: function(e){
		e.stopEvent();

		//TODO: Logic... if edit go back to post, if new just destroy and go back to list.
		this.destroy();
	}
});
