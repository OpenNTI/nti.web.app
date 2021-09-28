import './View.scss';
import React from 'react';

import { getService } from '@nti/web-client';
import { Input, Loading } from '@nti/web-commons';
import { scoped } from '@nti/lib-locale';

import Error from './Error';
import Instructions from './Instructions';
import Result from './Result';

const t = scoped(
	'web-site-admin.components.advanced.transcripts.bulkimport.Upload',
	{
		title: 'Drag a file to upload, or',
		requirements: 'Must be a .csv file',
		importCredits: 'Bulk Import Transcript Credits',
	}
);

const ALLOWED = {
	'text/csv': true,
};

const REL = 'bulk_awarded_credit';

export default class TranscriptCreditBulkImport extends React.Component {
	state = {};
	input = React.createRef();

	componentDidMount() {
		this.setUp();
	}

	setUp = async () => {
		const service = await getService();

		this.setState({
			model: service.capabilities.canBulkAwardCredits
				? service.getCollection('Credit', 'Global')
				: void 0,
		});
	};

	onUpload = async file => {
		if (!file) {
			return;
		}

		const { model } = this.state;
		let busy = true,
			error,
			result;

		this.setState({
			error,
			busy,
		});

		try {
			const formData = new FormData();
			formData.append('source', file);
			result = await model.postToLink(REL, formData, true);
		} catch (e) {
			error = e;
		}

		// clear the file input; without this, dropping the same file again won't trigger a change event.
		this.input.current?.onFileRemove?.();

		this.setState({
			result,
			busy: false,
			error,
		});
	};

	onError = error => this.setState({ error });

	render() {
		const { model, error, result, busy } = this.state;

		return !model ? null : (
			<div>
				<div className="section-header">{t('importCredits')}</div>
				<div className="transcript-credit-import">
					<Instructions />
					{!error && <Result result={result} />}
					{error && <Error error={error} />}
					<Input.FileDrop
						ref={this.input}
						getString={t}
						allowedTypes={ALLOWED}
						onChange={this.onUpload}
						onError={this.onError}
					/>

					{busy && <Loading.Ellipsis mask />}
				</div>
			</div>
		);
	}
}
