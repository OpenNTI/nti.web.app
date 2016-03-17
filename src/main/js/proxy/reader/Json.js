export default Ext.define('NextThought.proxy.reader.Json', {
	extend: 'NextThought.proxy.reader.Base',
	alias: 'reader.nti',
	initialConfig: {root: 'Items'},

	collectionTypes: {
		'application/vnd.nextthought.collection': 1,
		'application/vnd.nextthought.searchresults': 1
	},

	onItemRead: Ext.identityFn,

	readRecords: function(data) {
		var records = [], key,
			items = data.Items, item,
			mimeType = data.MimeType,
			links = data.Links,
			lastViewed = data.lastViewed,
			baseModel = this.model,
			result, i, record, modelName;

		if (data.request) {
			if (data.status !== 204) {
				console.warn('Unknown response?', data);
			}
			return [];
		}

		if (this.collectionTypes[mimeType] || (mimeType === undefined && items)) {
			for (key in items) {
				if (items.hasOwnProperty(key)) {
					item = this.onItemRead(items[key], key);

					if (typeof item === 'string') {
						console.warn('IGNORING: Received string item at key:', key, item);
						continue;
					}

					if (!ParseUtils.findModel(item)) {
						console.warn('IGNORING: Received object that does not match a model', item);
						continue;
					}

					records.push(item);
				}
			}

			data.Items = records;
		} else {
			data = [data];
		}

		try {

			result = this.callParent([data]);
			if (lastViewed) {
				result.lastViewed = Ext.Date.parse(lastViewed, 'timestamp', true);
			}
			if (links && Ext.isArray(links)) {
				result.links = {};
				Ext.each(links, function(l) {result.links[l.rel] = l.href;});
			}

			try {
				i = result.records.length - 1;
				for (i; i >= 0; i--) {
					record = result.records[i];
					try {
						//Stores like to have one type of model in them, but we need non-homogenous stores.
						//e.g. PageItem stores have notes, highlights, redaction, etc.  So make sure we coerce the proper model
						//here.  TODO move into NextThought.proxy.reader.Base and/or a more elegant way to do this
						if (record instanceof NextThought.model.Base && !record.homogenous) {
							modelName = record.get('Class');
							if (record.modelName.substr(-modelName.length) !== modelName) {
								result.records[i] = this.__rebuildRecordAsType(
										ParseUtils.findModel(record.raw), record.getId(), record.raw);
								delete record.raw;
							}
						}
					}
					catch (e1) {
						console.error(Globals.getError(e1), '\n\nNo model for record? : ', record);
					}
				}
			} finally {
				//put the base back
				if (this.model !== baseModel) {
					this.model = baseModel;
					this.buildExtractors(true);
				}
			}

			return result;
		}
		catch (e) {
			console.error(e.stack || e, records);
			return Ext.data.ResultSet.create({
				total: 0,
				count: 0,
				records: [],
				success: false
			});
		}
	},

	__rebuildRecordAsType: function(Model, id, data) {
		var convertedValues,
				record = new Model(undefined, id, data, convertedValues = {});

		if (this.model !== Model) {
			this.model = Model;
			this.buildExtractors(true);
		}

		record.phantom = false;

		this.convertRecordData(convertedValues, data, record);

		return record;
	}
});
