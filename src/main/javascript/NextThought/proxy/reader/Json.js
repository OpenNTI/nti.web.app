Ext.define('NextThought.proxy.reader.Json', {
	extend: 'NextThought.proxy.reader.Base',
	alias: 'reader.nti',
	initialConfig: {root: 'Items'},

	readRecords: function(data) {
		var records = [], key,
			items = data.Items, item,
			mimeType = data.MimeType,
			links = data.Links,
			result, i, record, modelName;

		if (data.request) {
			if (data.status !== 204) {
				console.warn('Unknown response?', data);
			}
			return [];
		}

		if (mimeType === 'application/vnd.nextthought.collection' || (mimeType === undefined && items)) {
			for (key in items) {
				if (items.hasOwnProperty(key)) {
					item = items[key];

					if (typeof item === 'string') {
						console.warn('IGNORING: Received string item at key:', key, item);
						continue;
					}

					if (!item.Class || !ParseUtils.findModel(item.Class)) {
						console.warn('IGNORING: Received object that does not match a model', item);
						continue;
					}

					records.push(items[key]);
				}
			}

      data.Items = records;
		} else {
			data = [data];
		}

		try {

			result = this.callParent([data]);
			if (links && Ext.isArray(links)) {
				result.links = {};
				Ext.each(links, function(l) {result.links[l.rel] = l.href;});
			}

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
							result.records[i] = ParseUtils.findModel(modelName).create(record.raw, record.getId());
							delete record.raw;
						}
					}
				}
				catch (e1) {
					console.error(Globals.getError(e1), '\n\nNo model for record? : ', record);
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
	}
});
