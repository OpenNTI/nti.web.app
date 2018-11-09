import React from 'react';
import {getService} from '@nti/web-client';
import {Input, Loading} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';

import Error from './Error';
import Instructions from './Instructions';
import Result from './Result';

const t = scoped('web-site-admin.components.advanced.transcripts.bulkimport.Upload', {
	title: 'Drag a file to upload, or',
	requirements: 'Must be a .csv, comma- or tab-delimited',
});

const ALLOWED = {
	'text/csv': true
};

const REL = 'bulk_awarded_credit';

export default class TranscriptCreditBulkImport extends React.Component {

	state = {}

	constructor (props) {
		super(props);
		this.input = React.createRef();
	}

	componentDidMount () {
		this.setUp();
	}

	setUp = async () => {
		const collection = await getService().then(service => service.getCollection('Credit', 'Global'));
		const canUpload = collection && collection.hasLink(REL);

		this.setState({
			model: canUpload ? collection : void 0
		});
	}

	onUpload = async file => {
		if (!file) {
			return;
		}

		const {model} = this.state;
		let busy = true, error, result;

		this.setState({
			error,
			busy
		});

		try {
			const formData = new FormData();
			formData.append('source', file);
			result = await model.postToLink(REL, formData);
		}
		catch (e) {
			error = e;
		}

		// clear the file input; without this, dropping the same file again won't trigger a change event.
		this.input.current && this.input.current.onFileRemove && this.input.current.onFileRemove();

		this.setState({
			result,
			busy: false,
			error
		});
	}

	onError = error => this.setState({error})

	render () {
		const {model, error, result, busy} = this.state;

		const E = !error ? null : <Error error={error} onDismiss={this.clearError} />;

		return !model ? null : (
			<div className="transcript-credit-import">
				<Instructions />
				<Result result={result} />
				<Input.FileDrop
					error={E}
					ref={this.input}
					getString={t}
					allowedTypes={ALLOWED}
					onChange={this.onUpload}
					onError={this.onError} />

				{busy && <Loading.Ellipsis mask />}
			</div>
		);
	}
}
