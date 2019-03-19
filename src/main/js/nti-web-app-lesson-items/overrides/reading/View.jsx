import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Loading, Layouts} from '@nti/web-commons';
import {rawContent} from '@nti/lib-commons';

import ContentViewer from 'legacy/app/contentviewer/Index';
import PageInfo from 'legacy/model/PageInfo';
import RelatedWorkRef from 'legacy/model/RelatedWork';
import ExternalToolAsset from 'legacy/model/LTIExternalToolAsset';

import Registry from '../Registry';

import Styles from './View.css';
import Store from './Store';
import Notes from './Notes';

const cx = classnames.bind(Styles);

const {Aside} = Layouts;

const DATA_ATTR = 'data-reading-content-placeholder';
const PLACEHOLDER_TPL = `<div ${DATA_ATTR}></div>`;

const MIME_TYPES = {
	'application/vnd.nextthought.ltiexternaltoolasset': true,
	'application/vnd.nextthought.relatedworkref': true,
	'application/vnd.nextthought.questionsetref': true,
	'application/vnd.nextthought.surveyref': true
};

const handles = (obj) => {
	const {location} = obj || {};
	const {item} = location || {};

	if (item && item.isTableOfContentsNode && item.isTopic()) {
		return true;
	}

	return item && MIME_TYPES[item.MimeType] ;
};

export default
@Registry.register(handles)
@Store.connect([
	'loading',
	'error',

	'page',
	'contentPackage',
	'rootId',
	'bundle',

	'setNotes',
	'notes'
])
class NTIWebAppLessonItemsReading extends React.Component {
	static deriveBindingFromProps (props) {
		const {location = {}} = props;

		return {
			page: location.item,
			parents: location.items,
			course: props.course
		};
	}

	static propTypes = {
		location: PropTypes.shape({
			item: PropTypes.object,
			items: PropTypes.array
		}),
		course: PropTypes.object.isRequired,

		loading: PropTypes.bool,
		error: PropTypes.any,

		page: PropTypes.object,
		contentPackage: PropTypes.object,
		rootId: PropTypes.string,
		bundle: PropTypes.object,

		setNotes: PropTypes.func,
		notes: PropTypes.array
	}

	state = {}

	attachContentRef = (node) => {
		if (!this.node && node) {
			this.node = node;
			this.setupReading();
		} else if (this.node && !node) {
			this.node = null;
			this.tearDownReading();
		}
	}


	componentDidUpdate (prev) {
		const {page} = this.props;
		const {page:prevPage} = prev;

		if (page !== prevPage) {
			this.setupReading();
		}
	}

	componentWillUnmount () {
		this.tearDownReading();
	}


	setupReading () {
		this.tearDownReading();

		const {page, contentPackage, rootId, bundle, setNotes} = this.props;
		const renderTo = this.node && this.node.querySelector(`[${DATA_ATTR}]`);

		if (!renderTo || !page) { return; }

		this.contentViewer = ContentViewer.create({
			pageInfo: page instanceof PageInfo ? page : null,
			relatedWork: page instanceof RelatedWorkRef ? page : null,
			externalToolAsset: page instanceof ExternalToolAsset ? page : null,
			contentPackage,
			bundle,
			rootId,
			renderTo,
			beforeSubmit: () => {
				this.setState({submitting: true});
			},
			afterSubmit: () => {
				this.setState({submitting: false});
			},
			contentOnly: true,
			doNotAssumeBodyScrollParent: true
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
					filterchange: () => updateStore()
				});

				setNotes(store.getRange());
			}
		});
	}


	tearDownReading () {
		if (this.contentViewer) {
			this.contentViewer.destroy();
			delete this.contentViewer;
		}
	}


	render () {
		const {loading, error, notes} = this.props;
		const {submitting} = this.state;

		return (
			<div className={cx('reading-view', {submitting})}>
				<Aside component={Notes} notes={notes} />
				{loading && (
					<div className={cx('loading-container')}>
						<Loading.Spinner.Large />
					</div>
				)}
				{!loading && error && this.renderError()}
				{!loading && !error && this.renderContent()}
			</div>
		);
	}


	renderError () {
		//TODO: figure this out
		return null;
	}

	renderContent () {
		return (
			<div
				ref={this.attachContentRef}
				{...rawContent(PLACEHOLDER_TPL)}
			/>
		);
	}
}
