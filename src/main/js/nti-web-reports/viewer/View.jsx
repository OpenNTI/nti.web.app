import React from 'react';
import PropTypes from 'prop-types';
import {Prompt, DialogButtons, Loading} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';

const DEFAULT_TEXT = {
	download: 'Download',
	loading: 'Generating',
	done: 'Done'
};
const t = scoped('nti-web-reports.viewer.View', DEFAULT_TEXT);

export default class ReportViewer extends React.Component {
	static propTypes = {
		report: PropTypes.object.isRequired,
		onDismiss: PropTypes.func
	}

	static show (report) {
		return new Promise((fulfill) => {
			Prompt.modal(
				<ReportViewer
					report={report}
					onDismiss={fulfill}
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

	onDismiss = () => {
		const {onDismiss} = this.props;

		if (onDismiss) {
			onDismiss();
		}
	}


	render () {
		const {report} = this.props;
		const {loading} = this.state;
		const buttons = [
			{label: t('done'), onClick: this.onDismiss}
		];

		return (
			<div className="report-viewer">
				<div className="header">
					<div className="title">
						{report.title}
					</div>
					<a className="download" href={this.getDownloadLink()} download>
						<i className="icon-upload" />
						<span>{t('download')}</span>
					</a>
					<i className="icon-light-x" onClick={this.onDismiss}/>
				</div>
				<div className="content">
					{loading && (<Loading.Mask message={t('loading')} />)}
					<iframe
						src={this.getEmbedLink()}
						onLoad={this.onLoad}
						onError={this.onError}
						frameBorder="0"
						marginWidth="0"
						marginHeight="0"
						seamless="true"
						transparent="true"
						allowTransparency="true"
					/>
				</div>
				<DialogButtons buttons={buttons} />
			</div>
		);
	}

}
