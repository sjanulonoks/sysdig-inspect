import Ember from 'ember';
import layout from '../templates/components/wsd-capture-breadcrumbs';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-breadcrumbs'],
    classNameBindings: ['isRoot:wsd-capture-breadcrumbs--is-root'],

    viewsManager: Ember.inject.service('views-manager'),
    shortcutsService: Ember.inject.service('keyboard-shortcuts'),

    steps: null,

    breadcrumbItems: Ember.computed('viewsManager.store.views', 'steps', function() {
        const views = this.get('viewsManager.store.views');
        const steps = this.get('steps');

        if (Ember.isEmpty(steps)) {
            console.assert(false, 'component:wsd-capture-breadcrumbs.breadcrumbSteps', 'Unexpected attribute', 'steps');

            return [];
        } else {
            return steps.map((step, i, list) => {
                return new BreadcrumbItem(
                    step,
                    i > 0 ? list[i - 1] : null,
                    Ember.isEmpty(views) ? null : this.get('viewsManager').peekViewConfiguration(step.viewId),
                    i === list.length - 1,
                    i === 0
                );
            });
        }
    }).readOnly(),

    isRoot: Ember.computed.equal('breadcrumbItems.length', 1),

    didInsertElement() {
        this.get('shortcutsService').bind(
            'navigation.drillUp',
            () => {
                const steps = this.get('steps');
                if (steps.length > 1) {
                    this.sendAction('select', steps[steps.length - 2]);
                }
            }
        );
    },

    willDestroyElement() {
        this.get('shortcutsService').unbind('navigation.drillUp');
    },
});

class BreadcrumbItem {
    constructor(step, previousStep, configuration, isSelected = false, isHome = null) {
        this.step = step;
        this.previousStep = previousStep;
        this.configuration = configuration;
        this.isSelected = isSelected;
        this.isHome = isHome;
    }

    get name() {
        return this.configuration.name;
    }

    get iconName() {
        switch (this.configuration.id) {
            case 'echo':
                return 'swap_horiz_black';
            case 'dig':
                return 'view_list_black';
            default:
                return null;
        }
    }

    get iconSize() {
        if (this.hasDescription) {
            return '16px';
        } else {
            return '24px';
        }
    }

    get hasDescription() {
        return this.key || this.selection;
    }

    get key() {
        if (this.previousStep && this.previousStep.configuration) {
            return this.previousStep.key;
        } else {
            return null;
        }
    }

    get selection() {
        if (this.previousStep && this.previousStep.selection) {
            return this.previousStep.selection;
        } else {
            return null;
        }
    }
}