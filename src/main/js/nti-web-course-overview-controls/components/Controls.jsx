import React from 'react';
import cx from 'classnames';
import {scoped} from 'nti-lib-locale';
import PropTypes from 'prop-types';
import {ControlBar, Button} from 'nti-web-commons';

const PREVIEW = 'preview';
const EDITING = 'editing';

const DEFAULT_TEXT = {
	previewing: 'You\'re previewing this lesson.',
	previewButton: 'Stop Editing',
	editButton: 'Start Editing',
	changeLog: 'Change Log',
	resources: 'Resources'
};

const t = scoped('nti-course-overview-controls.Controls', DEFAULT_TEXT);

export default class CourseOverviewControls extends React.Component {
	static PREVIEW = PREVIEW
	static EDITING = EDITING

	static propTypes = {
		gotoResources: PropTypes.func,
		switchToEdit: PropTypes.func,
		switchToPreview: PropTypes.func,
		showAuditLogs: PropTypes.func,
		mode: PropTypes.oneOf([PREVIEW, EDITING]),
		canDoAdvancedEditing: PropTypes.bool,
		hide: PropTypes.bool,
		disabled: PropTypes.bool
	}

	static defaultProps = {
		mode: PREVIEW,
		hide: false,
		disabled: false
	}


	onShowEditing = () => {
		const {switchToEdit} = this.props;

		if (switchToEdit) {
			switchToEdit();
		}
	}


	onShowAuditLogs = () => {
		const {showAuditLogs} = this.props;

		if (showAuditLogs) {
			showAuditLogs();
		}
	}


	onShowPreview = () => {
		const {switchToPreview} = this.props;

		if (switchToPreview) {
			switchToPreview();
		}
	}


	onShowResources = () => {
		const {gotoResources} = this.props;

		if (gotoResources) {
			gotoResources();
		}
	}


	render () {
		const {mode, hide, canDoAdvancedEditing, disabled} = this.props;
		const isPreview = mode === PREVIEW;
		const isEditing = mode === EDITING;
		const cls = cx('course-overview-control-bar', {disabled});

		return (
			<ControlBar visible={!hide}>
				<div className={cls}>
					{isEditing && this.renderResourceControl()}
					{isPreview && this.renderMessage()}
					<div className="spacer" />
					{this.renderButton(isPreview, canDoAdvancedEditing)}
				</div>
			</ControlBar>
		);
	}


	renderResourceControl = () => {
		return (
			<div className="resources" onClick={this.onShowResources}>
				<i className="icon-folder" />
				<span>{t('resources')}</span>
			</div>
		);
	}


	renderMessage = () => {
		return (
			<div className="message">
				<i className="icon-view" />
				<span>{t('previewing')}</span>
			</div>
		);
	}


	renderButton = (preview, canDoAdvancedEditing) => {
		return (
			<div className="buttons">
				{preview ?
					(
						<Button className="start-editing" onClick={this.onShowEditing} rounded>
							{t('editButton')}
						</Button>
					) :
					null
				}
				{!preview && canDoAdvancedEditing ?
					(
						<Button className="audit-logs" onClick={this.onShowAuditLogs} rounded>
							{t('changeLog')}
						</Button>
					) :
					null
				}
				{!preview ?
					(
						<Button className="show-preview" onClick={this.onShowPreview} rounded>
							{t('previewButton')}
						</Button>
					) :
					null

				}
			</div>
		);
	}
}
