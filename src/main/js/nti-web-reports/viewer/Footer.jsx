import React from 'react';
import PropTypes from 'prop-types';
import {DialogButtons} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';

const DEFAULT_TEXT = {
	done: 'Done'
};
const t = scoped('nti-web-reports.viewer.Footer', DEFAULT_TEXT);

export default class ReportViewerFooter extends React.Component {
	static propTypes = {
		onDismiss: PropTypes.func
	}

	buttons = [
		{label: t('done'), onClick: (x) => this.onDismiss(x)}
	]


	onDismiss = () => {
		const {onDismiss} = this.props;

		if (onDismiss) {
			onDismiss();
		}
	}

	render () {
		return (
			<div className="report-viewer-footer">
				<DialogButtons buttons={this.buttons} />
			</div>
		);
	}
}
