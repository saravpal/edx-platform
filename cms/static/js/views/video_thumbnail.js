define(
    ['underscore', 'gettext', 'moment', 'js/utils/date_utils', 'js/views/baseview',
        'common/js/components/utils/view_utils', 'edx-ui-toolkit/js/utils/html-utils',
        'edx-ui-toolkit/js/utils/string-utils', 'text!templates/video-thumbnail.underscore'],
    function(_, gettext, moment, DateUtils, BaseView, ViewUtils, HtmlUtils, StringUtils, VideoThumbnailTemplate) {
        'use strict';

        var VideoThumbnailView = BaseView.extend({

            actionsInfo: {
                upload: {
                    icon: '',
                    text: gettext('Add Thumbnail')
                },
                edit: {
                    icon: '<span class="icon fa fa-pencil" aria-hidden="true"></span>',
                    text: gettext('Edit Thumbnail')
                },
                error: {
                    icon: '<span class="icon fa fa-exclamation-triangle" aria-hidden="true"></span>',
                    text: gettext('Image upload failed')
                },
                progress: {
                    icon: '<span class="icon fa fa-spinner fa-pulse fa-spin" aria-hidden="true"></span>',
                    text: gettext('Uploading')
                },
                requirements: {
                    icon: '',
                    text: HtmlUtils.interpolateHtml(
                        // Translators: This is a 3 part text which tells the image requirements.
                        gettext('Image requirements {lineBreak} 1280px by 720px {lineBreak} .jpg | .png | .gif'),
                        {
                            lineBreak: HtmlUtils.HTML('<br>')
                        }
                    ).toString()
                }
            },

            events: {
                'click .thumbnail-wrapper': 'chooseFile',
                'mouseover .thumbnail-wrapper': 'showHoverState',
                'mouseout .thumbnail-wrapper': 'hideHoverState'
            },

            initialize: function(options) {
                this.template = HtmlUtils.template(VideoThumbnailTemplate);
                this.imageUploadURL = options.imageUploadURL;
                this.action = this.model.get('thumbnail_url') ? 'edit' : 'upload';
                _.bindAll(
                    this, 'render', 'imageSelected', 'imageUploadSucceeded', 'imageUploadFailed', 'validateImageSize',
                    'showHoverState', 'hideHoverState'
                );
            },

            render: function() {
                var durationSeconds = this.model.get('duration'),
                    duration;

                if (durationSeconds > 0) {
                    duration = {
                        humanize: this.getDurationTextHuman(durationSeconds),
                        machine: this.getDurationTextMachine(durationSeconds)
                    };
                }

                HtmlUtils.setHtml(
                    this.$el,
                    this.template({
                        action: this.action,
                        duration: duration,
                        videoId: this.model.get('edx_video_id'),
                        actionInfo: this.actionsInfo[this.action],
                        thumbnailURL: this.model.get('thumbnail_url')
                    })
                );

                // Initialize jquery fileuploader
                this.$('.upload-image-input').fileupload({
                    url: this.imageUploadURL,
                    add: this.imageSelected,
                    done: this.imageUploadSucceeded,
                    fail: this.imageUploadFailed
                });

                return this;
            },

            getDurationTextHuman: function(durationSeconds) {
                return StringUtils.interpolate(
                    // Translators: humanizeDuration will be like 10 minutes, an hour and 20 minutes etc
                    gettext('Video duration is {humanizeDuration}'),
                    {
                        humanizeDuration: this.getHumanizeDuration(durationSeconds)
                    }
                );
            },

            getHumanizeDuration: function(durationSeconds) {
                var hours,
                    minutes,
                    hoursText = null,
                    minutesText = null;

                hours = moment.duration(durationSeconds, 'seconds').hours();
                minutes = moment.duration(durationSeconds, 'seconds').minutes();

                if (hours) {
                    hoursText = moment.duration(hours + ':00', 'HH:mm').humanize();
                }

                if (minutes) {
                    minutesText = moment.duration('00:' + minutes, 'HH:mm').humanize();
                }

                // Translators: `and` will be used to combine both hour and minutes like `an hour and 20 minutes` etc
                return _.filter([hoursText, minutesText]).join(gettext(' and '));
            },

            getDurationTextMachine: function(durationSeconds) {
                var minutes,
                    seconds;

                minutes = Math.floor(durationSeconds / 60);
                seconds = Math.floor(durationSeconds - minutes * 60);
                return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            },

            chooseFile: function(event) {
                event.preventDefault();
                this.$('.upload-image-input').click();
            },

            imageSelected: function(event, data) {
                if (_.isUndefined(data.files[0].size) || this.validateImageSize(data.files[0].size)) {
                    this.showUploadInProgressMessage();
                    data.submit();
                }
            },

            imageUploadSucceeded: function(event, data) {
                this.action = 'edit';
                this.setActionInfo(this.action, false);
                this.$('img').attr('src', data.result.asset.url);
            },

            imageUploadFailed: function(event, data) {
                this.action = 'error';
                this.setActionInfo(this.action, true);
            },

            showUploadInProgressMessage: function() {
                this.action = 'progress';
                this.setActionInfo(this.action, true);
            },

            showHoverState: function() {
                if (this.action === 'upload') {
                    this.setActionInfo('requirements', true);
                } else if (this.action === 'edit') {
                    this.setActionInfo(this.action, true);
                }
            },

            hideHoverState: function() {
                if (this.action === 'upload') {
                    this.setActionInfo(this.action, true);
                } else if (this.action === 'edit') {
                    this.setActionInfo(this.action, false);
                }
            },

            setActionInfo: function(action, showText) {
                this.$('.thumbnail-overlay').toggle(showText);
                this.$('.thumbnail-action .action-icon').html(this.actionsInfo[action].icon);
                this.$('.thumbnail-action .action-text').html(this.actionsInfo[action].text);
                this.$('.thumbnail-wrapper').attr('class', 'thumbnail-wrapper {action}'.replace('{action}', action));
            },

            validateImageSize: function() {
                return true;
            }
        });

        return VideoThumbnailView;
    }
);
