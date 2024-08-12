const moment = require('moment');
const EventEmitter2 = require('eventemitter2').EventEmitter2;
const AccountsManager = require('../accounts/accounts-manager.js');
const DevicesManager = require('../devices/devices-manager.js');
const ScenesManager = require('../scenes/scenes-manager.js');
const Notifications = require('../notifications.js');

const ONE_SECOND_IN_MILLISECONDS = 1000;
const services_subscribed_to = new Map();
const TAG = '[Automator]';

class Automator {
    constructor() {
        this._startDateEmitter();
    }

    _startDateEmitter() {
        if (this.dateEmitter instanceof EventEmitter2) {
            return;
        }

        const updateCurrentDate = () => this.now = moment().utc().startOf('minute');

        this.dateEmitter = new EventEmitter2({wildcard: true, newListener: false, maxListeners: 0});
        updateCurrentDate();

        setInterval(() => {
            if (this.now.isSame(moment().utc(), 'minute')) {
                return;
            }

            updateCurrentDate();
            this.dateEmitter.emit([this.now.format(), '*'], {date: this.now});
        }, ONE_SECOND_IN_MILLISECONDS);
    }

    async setUpAutomation(automation) {
        const services_subscribed_to_for_automation = services_subscribed_to.get(automation.id) || new Set();

        console.log(TAG, "setUpAutomation:", automation);
        services_subscribed_to.set(automation.id, services_subscribed_to_for_automation);

        automation.triggers.forEach((trigger) => {
            const run = async (event_data = {}, trigger_data = {}) => {
                const triggered_date = moment(event_data.date).utc();

                await this.runAutomation(automation, {
                    ...trigger_data,
                    trigger,
                    event_data,
                    date: triggered_date.isValid() ? triggered_date : moment().utc()
                });
            };

            switch (trigger.type) {
                case 'event':
                    console.log(TAG, "incoming event:", trigger);
                    const service = DevicesManager.getServiceById(trigger.service_id, automation.account_id);

                    if (!service) {
                        console.error(TAG, automation.id, 'Tried to subscribe to service events, but the service was not found.');
                        return;
                    }

                    service.on([trigger.event, automation.id], (event_data) => run(event_data, {service}));
                    services_subscribed_to_for_automation.add(service.id);
                    break;
                case 'date':
                    this.dateEmitter.on([moment(trigger.date).utc().startOf('minute').format(), automation.id], run);
                    break;
                case 'time-of-day':
                    const listenForDate = () => {
                        const date_emitter_event = [automation.getNextTimeOfDayDate(trigger).startOf('minute').format(), automation.id];

                        this.dateEmitter.on(date_emitter_event, async (event_data) => {
                            await run(event_data);
                            this.dateEmitter.removeAllListeners(date_emitter_event);
                            listenForDate();
                        });
                    };

                    listenForDate();
                    break;
            }
        });
    }

    async tearDownAutomation(automation) {
        const services_subscribed_to_for_automation = services_subscribed_to.get(automation.id) || new Set();

        services_subscribed_to_for_automation.forEach((service_id) => {
            const service = DevicesManager.getServiceById(service_id, automation.account_id);

            if (!service) {
                console.error(TAG, automation.id, 'Tried to unsubscribe from service events, but the service was not found.');
                return;
            }

            service.off(['*', automation.id]);
        });

        services_subscribed_to_for_automation.clear();
        this.dateEmitter.removeAllListeners(['*', automation.id]);
    }

    checkConditions(conditions = [], trigger_data, account) {
        const any_conditions_failed = conditions.some((condition = {}) => {
            switch (condition.type) {
                case 'day-of-week':
                    return !(condition.days && condition.days.includes && condition.days.includes(trigger_data.date.isoWeekday()));
                case 'armed':
                    return account.armed !== condition.mode;
                default:
                    return true;
            }
        });

        return !any_conditions_failed;
    }

    async runAutomation(automation, trigger_data) {
        const account = AccountsManager.getAccountById(automation.account_id);

        if (!automation.is_enabled || !this.checkConditions(automation.conditions, trigger_data, account)) {
            return;
        }

        automation.scenes.forEach((scene_id) => {
            console.log(TAG, automation.id, 'Setting scene:', scene_id);
            ScenesManager.setScene(scene_id, automation.account_id, trigger_data.event_data.service_values);
        });

        try {
            await Notifications.init();

            for (const notification of automation.notifications) {
                const content = this.generateNotificationContent(trigger_data, notification, automation);

                try {
                    await Notifications.sendNotification(
                        notification.type,
                        {
                            account_id: notification.account_id,
                            email: notification.email,
                            phone_number: notification.phone_number,
                            phone_provider: notification.phone_provider
                        },
                        content.subject,
                        content.body,
                        content.attachments
                    );
                    console.log(TAG, `Notification sent for automation ${automation.id}`);
                } catch (error) {
                    console.error(TAG, `Failed to send notification for automation ${automation.id}:`, error);
                }
            }
        } catch (error) {
            console.error(TAG, `Failed to initialize or send notifications for automation ${automation.id}:`, error);
        }

        automation.actions.forEach((action) => {
            const service = DevicesManager.getServiceById(action.service_id, automation.account_id);
            service._deviceEmitAction('action', {property: action.action, value: true});
        });
    }

    generateNotificationContent(trigger_data, notification, automation) {
        const {trigger, service, date, event_data} = trigger_data;
        let subject, body, attachment;

        switch (trigger.type) {
            case 'time-of-day':
            case 'date':
                subject = 'Triggered at ' + date.clone().local().format('h:mm a');
                body = this.getAutomationNameOrGeneric(automation) + ' was triggered at ' + date.clone().local().format('h:mm a on dddd, MMMM Do') + '.';
                break;
            case 'event':
                const default_event_description = 'The "' + service.getFriendlyEventName(trigger.event) + '" event on ' + service.getNameOrType(true, false, true) + ' triggered ' + this.getAutomationNameOrGeneric(automation, false) + '.';

                attachment = service.getEventAttachment(trigger.event, event_data);
                subject = service.getFriendlyEventName(trigger.event) + ' (' + service.getNameOrType() + ')';

                body = {
                    text: service.getEventDescription(trigger.event, event_data) || default_event_description,
                    html: service.getEventHtmlDescription(trigger.event, event_data, attachment) || default_event_description
                };

                break;
        }

        if (attachment && notification.type === 'sms') {
            delete attachment.cid;
        }

        if (notification.message && typeof notification.message === 'string') {
            body = notification.message;
        }

        return {
            subject: (process.env.OA_APP_NAME ? process.env.OA_APP_NAME + ' - ' : '') + subject + ' - ' + (automation.name ? automation.name : 'Automation'),
            body,
            attachments: attachment && [attachment]
        };
    }

    getAutomationNameOrGeneric(automation, capitalized = true) {
        const the = capitalized ? 'The' : 'the',
            an = capitalized ? 'An' : 'an';

        return automation.name
            ? the + ' "' + automation.name + '" automation'
            : an + ' automation';
    }
}

module.exports = Automator;