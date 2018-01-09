import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';

const DEFAULT_TEXT = {
	download: 'Download'
};
const t = scoped('nti-web-reports.viewer.Header', DEFAULT_TEXT);

export default class ReportViewerHeader extends React.Component {
	static propTypes = {
		report: PropTypes.object,
		context: PropTypes.object,

		onDismiss: PropTypes.func,
		onBackToContext: PropTypes.func
	}

	get downloadLink () {
		const {report} = this.props;

		return report && report.href;
	}


	onBack = () => {
		const {onBackToContext} = this.props;

		if (onBackToContext) {
			onBackToContext();
		}
	}


	onDismiss = () => {
		const {onDismiss} = this.props;

		if (onDismiss) {
			onDismiss();
		}
	}


	render () {
		return (
			<div className="report-viewer-header">
				{this.renderBack()}
				{this.renderTitle()}
				{this.renderDownload()}
				{this.renderDismiss()}
			</div>
		);
	}


	renderBack () {
		const {report, context} = this.props;

		//if we don't have a report and we have context that means we haven't drilled in
		//if we don't have context there's never a need to show back
		if (!report || !context) { return null; }

		return (
			<div className="back" onClick={this.onBack}>
				Back
			</div>
		);
	}


	renderTitle () {
		const {report} = this.props;

		return (
			<div className="title">
				{report && report.title}
			</div>
		);
	}


	renderDownload () {
		const {downloadLink} = this;

		if (!downloadLink) { return null; }

		return (
			<a className="download" href={downloadLink} download>
				<i className="icon-upload" />
				<span>{t('download')}</span>
			</a>
		);
	}


	renderDismiss () {
		return (<i className="icon-light-x dismiss" onClick={this.onDismiss}/>);
	}
}
