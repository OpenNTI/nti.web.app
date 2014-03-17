Ext.define('NextThought.view.account.history.mixins.Feedback', {
	extend: 'NextThought.view.account.history.mixins.Grade',
	keyVal: 'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback',
	alias: 'widget.history-item-feedback',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{
			cls: 'history grade {assignmentName:boolStr("","x-hidden")}',
			cn: [
				{cls: 'body', cn: [
					'Feedback received {assignmentName:boolStr("for ")}',
					{tag: 'span', cls: 'link', html: '{assignmentName}'}
				]}
			]
		}
	]))
});
