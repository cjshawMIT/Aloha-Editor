define(
['aloha', 'aloha/plugin', 'jquery', 'ui/ui', 'ui/button', 'PubSub',
    'css!../../../mc3/oea/css/oea.css'],
function(Aloha, plugin, $, Ui, Button, PubSub) {
    "use strict";

	var GENTICS = window.GENTICS;

    var DIALOG =
    '<div class="oea-options">' +
    '    <a class="search-oea-link" href="javascript:;">Search for OEA</a> OR <a class="upload-url-link" href="javascript:;">specify a known URL.</a>' +
    '    <div class="placeholder preview">' +
    '      <h4>Preview</h4>' +
    '      <img />' +
    '    </div>' +
    '    <div class="search-oea-form">' +
    '      <input id="oea_search" class="oea-search" type="text" placeholder="Search for..." />' +
    '    </div>' +
    '    <div class="upload-url-form">' +
    '      <input type="text" class="oea-url" placeholder="Enter URL of OEA ...">' +
    '      <input type="submit" class="action preview" value="Preview OEA">' +
    '    </div>' +
    '</div>' +
    '<input type="submit" class="action preview" value="Preview OEA">' +
    '<div class="oea-alt">' +
    '  <div class="forminfo">' +
    '    Please provide a description of this OEA for the visually impaired.' +
    '  </div>' +
    '  <div>' +
    '    <textarea name="alt" placeholder="Enter description ..." type="text"></textarea>' +
    '  </div>' +
    '</div>';

    function prepareoea(plugin, img){
    }

    return plugin.create('oea', {
        // Settings:
        // uploadurl - where to upload to
        // uploadfield - field name to use in multipart/form upload
        // parseresponse - takes the xhr.response from server, return an
        //                 url to be used for the oea. Default expects
        //                 a json response with an url member.
        defaultSettings: {
            uploadfield: 'upload',
            parseresponse: function(xhr){ return JSON.parse(xhr.response).url; }
        },
        init: function(){
            this.settings = jQuery.extend(true, this.defaultSettings, this.settings);
            var plugin = this;
            Aloha.bind('aloha-editable-created', function(event, editable){
                editable.obj.find('img').each(function(){
                    prepareoea(plugin, $(this));
                });
            });
            PubSub.sub('aloha.selection.context-change', function(m){
                if ($(m.range.markupEffectiveAtStart).parent('img')
                        .length > 0) {
                    // We're inside an oea
                } else {
                    // We're outside an oea
                }
            });
            this._createDialog();
            this._createoeaButton = Ui.adopt("insertOEA", Button, {
                tooltip: "Insert OEA",
                icon: "aloha-button aloha-oea-insert",
                scope: 'Aloha.continuoustext',
                click: function(e){

                    var range = Aloha.Selection.getRangeObject(),
                        $placeholder = $('<span class="aloha-ephemera oea-placeholder"> </span>');
                    if (range.isCollapsed()) {
                        GENTICS.Utils.Dom.insertIntoDOM($placeholder, range, $(Aloha.activeEditable.obj));
                        MC3AUTH.remove_outcomes_selector();
                        $('.plugin.oea').data('placeholder', $placeholder)
                                .modal('show');
                        var $body = $('.plugin.oea').find('.modal-body');
                        MC3AUTH.append_outcomes_selector($body);
                    }
                }
            });
        },
        _createDialog: function(){
            var plugin = this,
                $dialog = $('<div class="plugin oea modal">'),
                $body = $('<div class="modal-body"></div>');
            $dialog.append('<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h3>OEA</h3></div>');
            $dialog.append($body);
            $dialog.append('<div class="modal-footer"><a href="#" class="btn action insert">Insert</a><a href="#" class="btn" data-dismiss="modal">Cancel</a></div>');
            MC3AUTH.append_outcomes_selector($body);
            $body.append(DIALOG);

            // Set onerror of preview oea
            (function(img, baseurl){
               img.onerror = function(){
                   var errimg = baseurl + '/../plugins/mc3/oea/img/warning.png';
                   if(img.src != errimg){
                       img.src = errimg;
                    }
               };
            })($body.find('.placeholder.preview img')[0], Aloha.settings.baseUrl);

            // Add click handlers
            $body.find('.search-oea-link').on('click', function(e){
                $body.find('.upload-url-form').hide();
                $body.find('.placeholder.preview').hide();
                $body.find('.search-oea-form').show();
                return e.preventDefault();
            });
            $body.find('.upload-url-link').on('click', function(e){
                $body.find('.search-oea-form').hide();
                $body.find('.placeholder.preview').hide();
                $body.find('.upload-url-form').show();
                return e.preventDefault();
            });
            $dialog.find('.action.insert').on('click', function(e){
                var $uploadform = $body.find('.search-oea-form'),
                    $urlform = $body.find('.upload-url-form'),
                    alt = $body.find('.oea-alt textarea').val();

                if($uploadform.is(':visible')){
                    var files = $uploadform.find('input[type=file]')[0].files;
                    if(files.length > 0){
                        plugin._uploadoea(files[0], function(url){
                            var $img = $('<img />').attr('src', url).attr('alt', alt);
                            $dialog.data('placeholder').replaceWith($img);
                            plugin._hideModal();
                        });
                    }
                } else {
                    // Just insert, url is a remote url
                    var url = $urlform.find('.oea-url').val(),
                        $img = $('<img />').attr('src', url).attr('alt', alt);
                    $dialog.data('placeholder').replaceWith($img);
                    plugin._hideModal();
                }

                return e.preventDefault();
            });
            $body.find('.search-oea-form .action.preview').on('click', function(e){
                var files = $dialog.find('.search-oea-form input[type=file]')[0].files;
                if(files.length > 0){
                    var $placeholder = $dialog.find('.placeholder.preview'),
                        $img = $placeholder.find('img');
                    plugin._showUploadPreview(files[0], $img);
                    $placeholder.show();
                }
                return e.preventDefault();
            });
            $body.find('.upload-url-form .action.preview').on('click', function(e){
                    var $placeholder = $dialog.find('.placeholder.preview'),
                        $img = $placeholder.find('img'),
                        url = $dialog.find('.upload-url-form .oea-url').val();
                    $img.attr('src', url);
                    $placeholder.show();
                return e.preventDefault();
            });
            $body.find('.search-oea-form').hide();
            $body.find('.placeholder.preview').hide();
            $body.find('.upload-url-form').hide();
            $('body').append($dialog);
        },
        _showUploadPreview: function(file, $img){
			var reader = new FileReader(),
				that = this;
			reader.file = file;
            reader.onloadend = function() {
                $img.attr('src', reader.result);
            };
            reader.readAsDataURL(file);
        },
        _uploadoea: function(file, callback){
            var plugin = this;
            var xhr = new XMLHttpRequest();
            if(xhr.upload){
                if(!plugin.settings.uploadurl){
                    throw new Error("uploadurl not defined");
                }
                xhr.onload = function(){
                    callback(plugin.settings.parseresponse(xhr));
                };
                xhr.open("POST", plugin.settings.uploadurl, true);
				xhr.setRequestHeader("Cache-Control", "no-cache");
                var f = new FormData();
                f.append(plugin.settings.uploadfield, file, file.name);
                xhr.send(f);
            }
        },
        _hideModal: function(){
            var $modal = $('.plugin.oea');
            $modal.find('.placeholder.preview').hide();
            $modal.find('.upload-url-form').hide();
            $modal.find('.search-oea-form').hide();
            $modal.modal('hide');
        },
        _createoeaButton: undefined
    });
});
