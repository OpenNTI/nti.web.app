Ext.define('NextThought.view.slidedeck.transcript.SlideView', {
    extend: 'NextThought.view.slidedeck.transcript.TranscriptView',
    alias: 'widget.slidedeck-slideview',

    buildComponents: function(){
        var items = [], lastVideoId,
            slideStore = this.slideStore,
            transcriptStore = this.transcriptStore;

        function itemWithId(list, id) {
            var item = null;

            if (Ext.isEmpty(list) || !id) {
                return null;
            }

            Ext.each(list, function(i) {
                if (i.get('NTIID') === id) {
                    item = i;
                }
                return !item;
            });

            return item;
        }

        slideStore.each(function(slide) {
            var m = slide.get('media'),
                vid = m && m.getAssociatedVideoId(),
                t = transcriptStore.findRecord('associatedVideoId', vid, 0, false, true, true),
                start = slide.get('video-start'),
                end = slide.get('video-end'), videoObj, transcript;

            console.log('slide starts: ', start, ' slide ends: ', end, ' and has transcript for videoid: ', t && t.get('associatedVideoId'));

            if (!lastVideoId || lastVideoId !== vid) {
                lastVideoId = vid;
                videoObj = itemWithId(this.videoPlaylist, lastVideoId);
                if (videoObj) {
                    items.push({
                        xtype: 'video-title-component',
                        video: videoObj
                    });
                }
            }

            items.push({
                xtype: 'slide-component',
                slide: slide,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                }
            });

            if (t) {
                // NOTE: make a copy of the transcript record,
                // since many slide can have the same transcript but different start and end time.
                t = t.copy();
                t.set('desired-time-start', start);
                t.set('desired-time-end', end);

                items.push({
                    xtype: 'video-transcript',
                    flex: 1,
                    transcript: t,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    }
                });
            }
        }, this);

        this.items = items;
        this.hasSlides = true;
    },


    selectInitialSlide: function() {
        var startOn = this.startOn,
            s = this.query('slide-component'), me = this,
            targetImageEl;


        Ext.each(s, function(i) {
            var id = i.slide.get('NTIID'), img;
            if (id === startOn) {
                targetImageEl = i.el.down('img.slide');
            }
        });

        if (targetImageEl) {
            console.log('should scroll into view: ', targetImageEl.dom);
            Ext.defer(function() {
                targetImageEl.scrollIntoView(me.getTargetEl(), false, {listeners: {}});
            }, 10, me);
        }
    },


    afterRender: function(){
        this.callParent(arguments);

        this.ownerCt.hasSlides = this.hasSlides;
    },


    selectSlide: function(slide) {
        if (!slide || !slide.isModel) {
            console.error('Unexpected argument, given', slide, 'expected a record');
            return;
        }
        var s = this.query('slide-component'),
            me = this,
            targetImageEl;

        Ext.each(s, function(i) {
            var id = i.slide.get('NTIID');

            if (id === slide.getId()) {
                targetImageEl = i.el.down('img.slide');
            }
        });

        if (!this.isMasked && targetImageEl) {
            Ext.defer(function() {
                me.scrollToEl(targetImageEl);
            }, 10, me);
        }
    },


    highlightAtTime: function(seconds, allowScroll) {
        var cmps = this.query('video-transcript[transcript]') || [],
            cmp, tEl, offset = 10;

        cmps.every(function(c) {
            var t = c.transcript, current,
                start = t.get('desired-time-start'),
                end = t.get('desired-time-end');

            if (start <= seconds && end > seconds) {
                cmp = c;
                return;
            }
            return true;
        });

        if (!cmp) { return; }

        tEl = cmp.getElementAtTime && cmp.getElementAtTime(seconds);

        if (tEl && this.currentTime !== seconds) {
            if (this.currentCue) {
                this.currentCue.removeCls('current');
            }

            tEl.addCls('current');
            this.currentCue = tEl;
            this.currentTime = seconds;

            if (allowScroll) {
                this.scrollToEl(tEl, offset);
            }
        }
    }

});