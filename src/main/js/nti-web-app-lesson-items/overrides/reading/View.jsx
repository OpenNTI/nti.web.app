import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Loading, Layouts, EmptyState } from '@nti/web-commons';
import { Notes } from '@nti/web-discussions';
import { LinkTo, Router, Prompt as RoutePrompt } from '@nti/web-routing';
import { decorate } from '@nti/lib-commons';
import { scoped } from '@nti/lib-locale';
import ContentViewer from 'internal/legacy/app/contentviewer/Index';
import PageInfo from 'internal/legacy/model/PageInfo';
import RelatedWorkRef from 'internal/legacy/model/RelatedWork';
import ExternalToolAsset from 'internal/legacy/model/LTIExternalToolAsset';
import SurveyModel from 'internal/legacy/model/assessment/Survey';

import Registry from '../Registry';

import Styles from './View.css';
import Store from './Store';

const cx = classnames.bind(Styles);
const t = scoped('NTIWebAppLessonItems.overrides.reading.View', {
	notFound: 'Unable to load reading.',
});

const { Aside } = Layouts;

const MIME_TYPES = {
	'application/vnd.nextthought.ltiexternaltoolasset': true,
	'application/vnd.nextthought.relatedworkref': true,
	'application/vnd.nextthought.questionsetref': true,
	'application/vnd.nextthought.naquestionset': true,
	'application/vnd.nextthought.surveyref': true,
};

const handles = obj => {
	const { location } = obj || {};
	const { item } = location || {};

	if (item && item.isTableOfContentsNode && item.isTopic()) {
		return true;
	}

	return item && MIME_TYPES[item.MimeType];
};

function alreadyPointingToContent(contentViewer, page) {
	const pageId = page.getId();

	return (
		contentViewer &&
		(contentViewer.page.getId() === pageId ||
			contentViewer.relatedWork.getId() === pageId ||
			contentViewer.externalToolAsset.getId() === pageId)
	);
}

class NTIWebAppLessonItemsReading extends React.Component {
	static deriveBindingFromProps(props) {
		const { location = {} } = props;

		return {
			page: location.item,
			parents: location.items,
			course: props.course,
			activeObjectId: props.activeObjectId,
			activeHash: props.activeHash,
		};
	}

	static propTypes = {
		location: PropTypes.shape({
			item: PropTypes.object,
			items: PropTypes.array,
		}),
		course: PropTypes.object.isRequired,
		activeObjectId: PropTypes.string,
		activeHash: PropTypes.string,

		handleNavigation: PropTypes.func,

		loading: PropTypes.bool,
		error: PropTypes.any,

		notFound: PropTypes.bool,

		page: PropTypes.object,
		contentPackage: PropTypes.object,
		rootId: PropTypes.string,
		bundle: PropTypes.object,

		activeObject: PropTypes.object,
		setNotes: PropTypes.func,
		notes: PropTypes.array,
	};

	static contextTypes = {
		router: PropTypes.object,
	};

	state = {};

	componentWillUnmount() {
		this.contentViewer?.destroy();
	}

	componentDidUpdate(prevProps) {
		const { activeObject } = this.props;
		const { activeObject: prevObject } = prevProps;

		if (
			activeObject !== prevObject &&
			activeObject &&
			this.contentViewer &&
			!this.contentViewer.isDestroyed
		) {
			this.contentViewer.goToNote(activeObject);
		}
	}

	setupReading = renderTo => {
		const {
			page,
			contentPackage,
			rootId,
			bundle,
			setNotes,
			activeObject,
			activeHash,
		} = this.props;

		if (!renderTo || !page || !document.body.contains(renderTo)) {
			return;
		}

		if (!alreadyPointingToContent(this.contentViewer, page)) {
			this.tearDownReading();
			this.contentViewer = ContentViewer.create({
				pageInfo: page instanceof PageInfo ? page : null,
				relatedWork: page instanceof RelatedWorkRef ? page : null,
				externalToolAsset:
					page instanceof ExternalToolAsset ? page : null,
				survey: page instanceof SurveyModel ? page : null,
				contentPackage,
				bundle,
				rootId,
				renderTo,
				beforeSubmit: () => {
					this.setState({ submitting: true });
				},
				afterSubmit: () => {
					this.setState({ submitting: false });
				},
				contentOnly: true,
				doNotAssumeBodyScrollParent: true,
				showMediaViewerForVideo: playlistItem => {
					const mockVideo = {
						MimeType: 'application/vnd.nextthought.ntivideo',
						getID: () => playlistItem.getId(),
					};

					LinkTo.Object.routeTo(this.context.router, mockVideo, {
						mediaViewer: true,
					});
				},
				handleNavigation: (title, route, precache) => {
					const { handleNavigation } = this.props;

					if (handleNavigation) {
						handleNavigation(title, `/content${route}`, precache);
					}
				},
			});

			this.contentViewer.on({
				single: true,
				'reader-set': () => {
					const reader = this.contentViewer.reader;
					const store = reader.flatPageStore;
					const updateStore = () => {
						setNotes(store.getRange());
					};

					this.storeMons = store.on({
						destroyable: true,
						load: () => updateStore(),
						add: () => updateStore(),
						remove: () => updateStore(),
						filterchange: () => updateStore(),
					});

					setNotes(store.getRange());

					if (activeObject) {
						this.contentViewer.goToNote(activeObject);
					} else if (activeHash) {
						this.contentViewer.goToFragment(activeHash);
					}
				},
			});
		} else {
			if (activeObject) {
				this.contentViewer.goToNote(activeObject);
			} else if (activeHash) {
				this.contentViewer.goToFragment(activeHash);
			}
		}
	};

	tearDownReading = () => {
		if (this.contentViewer) {
			this.contentViewer.destroy();
			delete this.contentViewer;
		}
	};

	getRouteFor = (obj, context) => {
		const store =
			this.contentViewer &&
			this.contentViewer.reader &&
			this.contentViewer.reader.flatPageStore;

		if (obj.MimeType === 'application/vnd.nextthought.note' && store) {
			const noteModel = store.getById(obj.getID());

			return this.context.router.getRouteFor(noteModel, context);
		}
	};

	onNewNote = () => {
		this.contentViewer
			.onceReadyForSearch()
			.then(() => this.contentViewer.showContainerNoteEditor());
	};

	onRoute = async (cont, stop) => {
		if (!this.contentViewer || !this.contentViewer.allowNavigation) {
			cont();
			return;
		}

		try {
			await this.contentViewer.allowNavigation();
			cont();
		} catch (e) {
			stop();
		}
	};

	render() {
		const { loading, error, notes } = this.props;
		const { submitting } = this.state;

		return (
			<Router.RouteForProvider getRouteFor={this.getRouteFor}>
				<div className={cx('reading-view', { submitting })}>
					<Aside
						component={Notes.Sidebar}
						notes={notes}
						onNewNote={this.onNewNote}
						fillToBottom
						sticky
					/>
					<RoutePrompt onRoute={this.onRoute} when />
					{loading && (
						<div className={cx('loading-container')}>
							<Loading.Spinner.Large />
						</div>
					)}
					{!loading && error && this.renderError()}
					{!loading && !error && this.renderContent()}
				</div>
			</Router.RouteForProvider>
		);
	}

	renderError() {
		//TODO: figure this out
		return this.renderNotFound();
	}

	renderContent() {
		const { notFound } = this.props;

		if (notFound) {
			return this.renderNotFound();
		}

		return (
			<Layouts.Uncontrolled
				onMount={this.setupReading}
				onUnmount={this.tearDownReading}
			/>
		);
	}

	renderNotFound() {
		return <EmptyState header={t('notFound')} />;
	}
}

export default decorate(NTIWebAppLessonItemsReading, [
	Registry.register(handles),
	Store.connect([
		'loading',
		'error',

		'notFound',

		'page',
		'contentPackage',
		'rootId',
		'bundle',

		'activeObject',
		'setNotes',
		'notes',
	]),
]);
