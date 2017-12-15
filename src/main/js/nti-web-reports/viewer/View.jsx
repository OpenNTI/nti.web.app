import React from 'react';
import PropTypes from 'prop-types';
import {Prompt, DialogButtons, Loading} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';

const DEFAULT_TEXT = {
	download: 'Download',
	loading: 'Generating Report',
	done: 'Done'
};
const t = scoped('nti-web-reports.viewer.View', DEFAULT_TEXT);

export default class ReportViewer extends React.Component {
	static propTypes = {
		report: PropTypes.object.isRequired
	}

	static show (report) {
		return new Promise((fulfill, reject) => {
			Prompt.modal(
				<ReportViewer
					report={report}
					onSelect={fulfill}
					onCancel={reject}
				/>,
				'report-viewer-container'
			);
		});
	}


	state = {loading: true}


	getDownloadLink () {
		const {report} = this.props;

		return report.href;
	}


	getEmbedLink () {
		const {report} = this.props;

		return `${report.href}#view=FitH&toolbar=0&navpanes=0&statusbar=0&page=1`;
	}


	onLoad = () => {
		this.setState({
			loading: false
		});
	}


	onError = () => {}


	render () {
		const {report} = this.props;
		const {loading} = this.state;
		const buttons = [
			{label: t('done'), action: this.onDismiss}
		];

		return (
			<div className="report-viewer">
				<div className="header">
					<div className="name">
						{report.title}
					</div>
					<a className="download" href={this.getDownloadLink} Download>
						<i className="icon-download" />
						<span>{t('download')}</span>
					</a>
				</div>
				<div className="content">
					{loading && (<Loading.Mask message={t('loading')} />)}
					<iframe src={this.getEmbedLink()} onLoad={this.onLoad} onError={this.onError}/>
				</div>
				<DialogButtons buttons={buttons} />
			</div>
		);
	}

}
