define(
    ['jquery', 'underscore', 'backbone', 'js/views/video_thumbnail', 'common/js/spec_helpers/template_helpers',
     'common/js/spec_helpers/view_helpers'],
    function($, _, Backbone, VideoThumbnailView, TemplateHelpers, ViewHelpers) {
        'use strict';
        describe('VideoThumbnailView', function() {
            var IMAGE_UPLOAD_URL = '/videos/upload/image',
                render = function(modelData) {
                    var defaultData = {
                            client_video_id: 'foo.mp4',
                            duration: 42,
                            created: '2014-11-25T23:13:05',
                            edx_video_id: 'dummy_id',
                            status: 'uploading',
                            thumbnail_url: null
                        },
                        videoThumbnailView = new VideoThumbnailView({
                            model: new Backbone.Model($.extend({}, defaultData, modelData)),
                            imageUploadURL: IMAGE_UPLOAD_URL
                        });
                    return videoThumbnailView.render().$el;
                };

            beforeEach(function() {
                TemplateHelpers.installTemplate('video-thumbnail', false);
            });

            it('renders as expected', function() {
                var $el = render({});
                expect($el.find('.thumbnail-col .thumbnail-wrapper')).toExist();
                expect($el.find('.thumbnail-col .thumbnail-wrapper .upload-image-input')).toExist();
            });
        });
    }
);
