Ext.define('NextThought.view.forums.Editor', {
    extend: 'NextThought.editor.Editor',
    alias: 'widget.forums-topic-editor',

    cls: 'forums-topic-editor-box',
    border: 1,

    enableTags: true,
    enableTitle: true,
    enableVideo: true,

    headerTplOrder: '{title}{toolbar}',

    renderTpl: Ext.DomHelper.markup([
        { cls: 'header-container', cn: { cls: 'header', cn: [
            { tag: 'tpl', 'if': '!isEdit', cn: { cls: 'controls', cn: [
                { cls: 'new-topic disabled', html: 'New Discussion'}
            ] }},
            { cls: 'path', cn: ['{path} / ', {tag: 'span', cls: 'title-part', html: '{title}'}]}
        ]}
        },
        { cls: 'forums-topic-editor', cn: { cls: 'editor active', html: '{super}' } }
    ]),


    renderSelectors: {
        editor: '.editor',
        cancelEl: '.action.cancel',
        saveEl: '.action.save',
        titleWrapEl: '.title',
        footerEl: '.footer',
        editorBodyEl: '.content',
        publishEl: '.action.publish'
    },


    initComponent: function () {
        this.callParent(arguments);
        this.addEvents(['save-post']);
    },


    beforeRender: function () {
        this.callParent(arguments);
        var rd = this.renderData = this.renderData || {};

        rd.path = this.path;
        rd.isEdit = Boolean(this.record);
        rd.title = rd.isEdit ? this.record.get('title') : 'New Topic';
    },


    afterRender: function () {
        this.callParent(arguments);
        var r = this.record,
            me = this,
            h,
            parentCtEl = this.ownerCt.getEl(),
            hasScrollBar = Ext.getDom(parentCtEl).scrollHeight !== parentCtEl.getHeight();

        this.mon(this.tags, 'new-tag', this.syncHeight, this);
        this.on('beforedeactivate', this.onBeforeDeactivate, this);

        if (r) {
            h = r.get('headline');
            this.editBody(h.get('body'));
            this.setTitle(h.get('title'));
            this.setTags(h.get('tags'));
            this.setPublished(r.isPublished());
        }

        this.mon(this.titleWrapEl, 'keyup', function () {
            this.clearError(this.titleWrapEl);
        }, this);
        parentCtEl.addCls('scroll-lock' + (hasScrollBar ? ' scroll-padding-right' : '')).scrollTo(0);
        Ext.EventManager.onWindowResize(this.syncHeight, this, null);
        Ext.defer(this.syncHeight, 1, this);

        if (Ext.is.iPad) {
            var tokenInput = this.tagsEl.el.down('.token-field .token-input-wrap input');
            this.mon(tokenInput, {
                'blur': function (e) {
                    me.onFocusChange(e);
                }
            });
        }

        this.titleEl.focus();
        this.moveCursorToEnd(this.titleEl);
        window.scrollTo(this.titleEl.top);

        //Don't scroll all the way, to let the input field show on ipad.
        if(Ext.is.iPad){
            window.scrollTo(0, 100);
        }
    },


    /**
     * Scrolls to the top of the page if a text input field is not focused
     */
    onFocusChange: function (e) {
        var titleInput = this.titleWrapEl.el.down('input'),
            tokenInput = this.tagsEl.el.down('.token-field .token-input-wrap input');
        if (e.relatedTarget !== titleInput.dom
            && e.relatedTarget !== tokenInput.dom
            && e.relatedTarget !== this.editorBodyEl.dom) {
            window.scrollTo(0, 0);
        }
    },


    destroy: function () {
        var container = this.ownerCt.getEl();
        container.removeCls('scroll-lock scroll-padding-right');
        Ext.EventManager.onWindowResize(this.syncHeight, this, null);

//        if (Ext.is.iPad) {
//            window.scrollTo(0, 0);
//            document.body.scrollTop = 0;
//        }

        return this.callParent(arguments);
    },


    onBeforeDeactivate: function () {
        /*
         *   NOTE: For now, since forums views aren't destroyed when you go away,
         *   and we like that behavior, don't warn the user if the editor is open, since it will still be there when we can back.
         *   If we change at some point, just uncomment the following lines to display a warning message.
         */
//		if(this.isVisible()){
//			this.warnBeforeDismissingEditor();
//		}
//		return !this.isVisible();
        return true;
    },


    warnBeforeDismissingEditor: function () {
        var msg = "You are currently editing or creating a discussion topic. Please save or cancel it first.";
        Ext.defer(function () {
            alert({msg: msg});
        }, 1);
    },


    moveCursorToEnd: function (el) {
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


    syncHeight: function () {
        var el = this.editorBodyEl,
            p = this.ownerCt && Ext.getDom(this.ownerCt.getEl()),
            top;
        if (!el || !p) {
            return;
        }
        top = el.getTop() + p.scrollTop;

        el.setHeight(Ext.dom.Element.getViewportHeight() - top - this.footerEl.getHeight() - 10);
        Ext.defer(this.updateLayout, 700, this, []);
    },


    onKeyUp: function () {
        this.clearError(this.editorBodyEl);
    },


    clearError: function (el) {
        el.removeCls('error-top').set({'data-error-tip': undefined});
    },


    markError: function (el, message) {
        el.addCls('error-tip').set({'data-error-tip': message});
    },


    onSave: function (e) {
        e.stopEvent();
        var v = this.getValue(),
            re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g;

        if (!Ext.isArray(v.body) || v.body.join('').replace(re, '') === '') {
            console.error('bad forum post');
            this.markError(this.editorBodyEl, 'You need to type something');
            return;
        }

        if (Ext.isEmpty(v.title)) {
            console.error('You need a title');
            this.markError(this.titleWrapEl, 'You need a title');
            this.titleWrapEl.addCls('error-on-bottom');
            return;
        }

        if (/^[^a-z0-9]+$/i.test(v.title)) {
            console.error('Title cant be all special chars');
            this.markError(this.titleWrapEl, "Title can't be all special characters.");
            this.titleWrapEl.addCls('error-on-bottom');
            return;
        }

        if (/^@{1,}/.test(v.title)) {
            console.error('Title cant start with @');
            this.markError(this.titleWrapEl, "Title can't start with @");
            this.titleWrapEl.addCls('error-on-bottom');
            return;
        }

        //console.debug('Save:',v);
        //If new there will not be a record on this, it will be undefined
        this.fireEvent('save-post', this, this.record, v.title, v.tags, v.body, v.publish);
    },


    onSaveSuccess: function () {
        this.destroy();
    },


    onSaveFailure: function (proxy, response, operation) {
        var msg = 'An unknown error occurred saving your Discussion.', error;

        if (response && response.responseText) {
            error = JSON.parse(response.responseText) || {};
            if (error.code === "TooLong") {
                msg = "Could not save your Discussion. The title is too long. It can only be 140 characters or less";
            }
        }
        alert({title: 'Error', msg: msg, icon: 'warning-red'});
        console.debug(arguments);
    },


    onCancel: function (e) {
        e.stopEvent();

        //TODO: Logic... if edit go back to post, if new just destroy and go back to list.
        this.destroy();
    }
});
