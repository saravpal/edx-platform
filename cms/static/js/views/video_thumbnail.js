define(
    ['underscore', 'gettext', 'js/utils/date_utils', 'js/views/baseview', 'common/js/components/utils/view_utils',
        'edx-ui-toolkit/js/utils/html-utils', 'edx-ui-toolkit/js/utils/string-utils',
        'text!templates/video-thumbnail.underscore'],
    function(_, gettext, DateUtils, BaseView, ViewUtils, HtmlUtils, StringUtils, VideoThumbnailTemplate) {
        'use strict';

        var VideoThumbnailView = BaseView.extend({

            addThumbnailText: gettext('Add Thumbnail'),
            editThumbnailText: gettext('Edit Thumbnail'),

            events: {
                'click .thumbnail-select-area': 'chooseFile'
            },

            initialize: function(options) {
                this.template = HtmlUtils.template(VideoThumbnailTemplate);
                _.bindAll(this, 'render', 'imageSelected', 'imageUploadSucceeded', 'imageUploadFailed',
                            'validateImageSize');
            },

            render: function() {
                var durationSeconds = this.model.get('duration');

                HtmlUtils.setHtml(
                    this.$el,
                    this.template({
                        thumbnailURL: this.getThumbnailURL(),
                        actionText: this.getActionText(),
                        durationTextHuman: this.getDurationTextHuman(durationSeconds),
                        durationTextMachine: this.getDurationTextMachine(durationSeconds)
                    })
                );

                // Initialize jquery fileuploader
                this.$('.upload-image-input').fileupload({
                    url: this.options.imageUploadUrl,
                    add: this.imageSelected,
                    done: this.imageUploadSucceeded,
                    fail: this.imageUploadFailed
                });

                return this;
            },

            getThumbnailURL: function() {
                return 'https://i.imgur.com/lTcnHU4.png';
            },

            getActionText: function() {
                return '';
            },

            getDurationTextHuman: function(durationSeconds) {
                return StringUtils.interpolate(
                    gettext('Duration of video is {humanizeDuration}'),
                    {
                        humanizeDuration: this.getHumanizeDuation(durationSeconds)
                    }
                );
            },

            getHumanizeDuation: function(durationSeconds) {
                return '10 minutes and 10 seconds';
            },

            getDurationTextMachine: function(durationSeconds) {
                var minutes,
                    seconds;

                if (durationSeconds <= 0) {
                    return '--:--';
                }

                minutes = Math.floor(durationSeconds / 60);
                seconds = Math.floor(durationSeconds - minutes * 60);
                return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            },

            chooseFile: function(event) {
                event.preventDefault();
                this.$('.upload-image-input').click();
            },

            imageSelected: function(e, data) {
                if (_.isUndefined(data.files[0].size) || this.validateImageSize(data.files[0].size)) {
                    data.submit();
                }
            },

            imageUploadSucceeded: function() {

            },

            imageUploadFailed: function() {

            },

            validateImageSize: function() {
                return true;
            }
        });

        return VideoThumbnailView;
    }
);
