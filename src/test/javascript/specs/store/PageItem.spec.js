describe("PageItem Store Tests", function(){

    describe ('add item', function(){

		function createStore(){
			var store = Ext.create('NextThought.store.PageItem', {});
			return store;
		}

		function createNote(id, placeholder, children){
			var note = Ext.create('NextThought.model.Note', {
				NTIID: id
			});
			note.placeholder = placeholder;
			note.children = children ? children.slice() : undefined;
			if(note.children){
				Ext.each(note.children, function(kid){
					kid.parent = note;
				});
			}
			return note;
		}

        it('Buffers events for duration of add', function(){
            var childToAdd = createNote('c1', false),
				root = createNote('r', false),
				store = createStore(), childAddedRecv = 0, addRecv = 0;

			childToAdd.set('inReplyTo', root.getId());
			childToAdd.set('references', [root.getId()]);

			store.add(root);

			function onAdd(){
				//child add has been called already but add has not
				expect(childAddedRecv).toBeTruthy();
				expect(addRecv).toBeFalsy();
				addRecv++;
			}

			function onChildAdded(){
				//add has not been called yet, neither has child added
				expect(childAddedRecv).toBeFalsy();
				expect(addRecv).toBeFalsy();
				childAddedRecv++;
			}

			//When we add our child we need to make sure the child-added
			//event gets fired on root before the store add event gets fired
			store.on('add', onAdd);
			root.on('child-added', onChildAdded);

			//do the child add
			store.add(childToAdd);

			expect(store.getCount()).toBe(2);
			//Each event should only have been called once
			expect(childAddedRecv).toBe(1);
			expect(addRecv).toBe(1);

			store.un('add', onAdd);
			root.un('child-added', onChildAdded);
        });
    });

	describe('ProfileItem tests: want item', function(){
		var store, username;

		beforeEach(function(){
			username = 'testUser1';
			store = Ext.create('NextThought.store.ProfileItem')	;
			store.profileStoreFor = username;
		});

		it('accepts item given creator as string', function(){
			var rec =  Ext.create('NextThought.model.Note', {NTIID: 'tag:ntiid1', Creator: username});

			expect(rec.isTopLevel()).toBeTruthy();
			expect(rec.get('Creator')).toEqual(store.profileStoreFor);
			expect(store.wantsItem(rec)).toBeTruthy();
		});

		it('accepts item given creator is a userObject', function(){
			var userObject = Ext.create('NextThought.model.User', {'Username': username}),
				rec = Ext.create('NextThought.model.forums.CommunityHeadlinePost', {'Creator': userObject});

			expect(rec.isTopLevel()).toBeTruthy();
			expect(rec.get('Creator')).not.toEqual(store.profileStoreFor); //one is a string and the other is a model object
			expect(store.wantsItem(rec)).toBeTruthy();
		});

		it('rejects item because the user is not the creator', function(){
			var rec = Ext.create('NextThought.model.forums.CommunityHeadlinePost', {'Creator': 'testUser2'});

			expect(rec.isTopLevel()).toBeTruthy();
			expect(rec.get('Creator')).not.toEqual(store.profileStoreFor); //both strings but with different values.
			expect(store.wantsItem(rec)).toBeFalsy();
		});
	});
});
