(function () {
    //globals
    var defaultDT = {
        CUSTOMBUTTONS: [
            {label: "Action Tag", open: `<small>[ `, close: ` ]</small>`},
            {label: "Text Tag", open: `<span style="font-family:courier new;">`, close: `</span>`}
        ],
        AUTOSCROLL: true,
        IMGUR: [],
        EXPERIMENTAL: false,
        BLACKLIST: [],
        BLACKLISTMSG: true,
        BLACKLISTDOMAIN: [],
        BLACKLISTJOURNALS: [],
        BLACKLISTJOURNALDOMAINS: [],
        BLACKLISTJOURNALMSG: true,
        FIXIMGURINLINE: false
    };
    var DT = {};

    var NewCommentPageList = '.page-links';
    var OldCommentPageList = 'div.action-box div.inner > span > a';

    var path = window.location.protocol + '//' + window.location.hostname + window.location.pathname;
    var $textBox;
    var ver;
    var pages;
    var page;
    var pageList;
    var pageBox;
    var commentThread;
    var nextButton;
    var oldLastComment;

    function saveSelection() {
        $textBox.data("lastSelection", $textBox.getSelection());
    }

    jQuery(document).on('click', '.load_all', function (event) {
        event.preventDefault();

        jQuery(commentThread).remove();
        jQuery(window).unbind('scroll');
        page = 1;
        getPage(page);

    });

    jQuery(document).on('keydown', document, function (e) {
        if (e.ctrlKey && ( e.which === 47)) {
            ActionTagInsert();
        }
    });

    function addCustomButtons() {

        //Adding buttons

        // Respectively: quick-reply, old talkform, old preview form.
        $textBox = jQuery("#body, #commenttext, #previewform textarea.textbox");
        $textBox.focusout(saveSelection);

        var makeButton = (button, i) => `<input type="button" data-id="${i}" class="custom-button" value="${button.label}" />`;
        var buttons =
            '<div class="dwtools-custom-buttons">' +
            DT['CUSTOMBUTTONS'].map( makeButton ).join(' ') +
            '</div>';

        // Try to insert between the subject and the body.
        if ( jQuery('.qr-body').length > 0 ) {
            // quick-reply or post-#2480 talkform. Insert above body's parent
            // div. In mid-2019 quick-reply, this ends up above the subject, to
            // avoid a stretchy width: 100% situation. After #2522, it goes between.
            jQuery('.qr-body').before(buttons);
        } else if ( jQuery('.talkform #misc_controls').length > 0 ) {
            // old talkform. Insert above message body, but don't misalign the
            // "Message:" label.
            jQuery('#misc_controls').after(buttons);
        } else {
            // old preview page, or something unexpected.
            $textBox.before(buttons);
        }
    }

    function CustomButtonTagInsert(ele) {

        var id = ele.attr("data-id");
        var tag = DT['CUSTOMBUTTONS'][id];


        var selection = $textBox.data("lastSelection");
        $textBox.focus();

        if (selection == undefined) {
            var text = tag.open + " " + tag.close;
            text = text.replace(/^\s+|\s+$/g, '');
            $textBox.text(text);
        }
        else {
            $textBox.setSelection(selection.start, selection.end);
            var text = $textBox.getSelection();
            var originalText = text.text;

            text = text.text.replace(/^\s+|\s+$/g, '');
            text = tag.open + text + tag.close;
            text = text.replace(/^\s+|\s+$/g, '');

            if (originalText.charAt(0) == '\n') {
                text = "\n" + text;
            }
            if (originalText.charAt(originalText.length - 1) == '\n') {
                text = text + '\n';
            }

            $textBox.replaceSelectedText(text);
        }


    }

    function addComments(data) {
        var body = '<div id="body-mock">' + data.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '') + '</div>';


        var cmtinfo_new = data.match(/var LJ_cmtinfo[\s\S]*}}/);

        try {
            //needs eval because for some reason lj uses octals in numbers
            eval(cmtinfo_new[0]);
        }
        catch (err) {
            console.log(err);
            console.log("Problem eval cmtinfo.");
        }

        var sciptToExecute = "";
        try {
            if (LJ_cmtinfo) {
                for (var x in LJ_cmtinfo) {
                    if (typeof LJ_cmtinfo[x] === 'object') {
                        sciptToExecute += "window.LJ_cmtinfo[" + x + "] = " + JSON.stringify(LJ_cmtinfo[x]) + ";";
                    }
                }

                var rwscript = document.createElement("script");
                rwscript.type = "text/javascript";
                rwscript.textContent = sciptToExecute;
                document.documentElement.appendChild(rwscript);
                rwscript.parentNode.removeChild(rwscript);
            }
        }
        catch (err) {
            console.log(err);
            console.log("LJ_cmtinfo not defined.");
            //console.log(data);
        }

        var newPage = jQuery(body);
        var newList = newPage.find(commentThread);
        var oldLast = jQuery(oldLastComment);

        oldLast.before(newList);

        var newActionBox = newPage.find(pageBox).html();
        jQuery(pageBox).html(newActionBox);

        if (DT['EXPERIMENTAL'] && (DT['BLACKLIST'].length > 0 || DT['BLACKLISTJOURNALS'].length > 0)) {
            runBlackList(DT);
        }


    }

    function getPage(currentPage) {
        if (currentPage <= pages) {
            jQuery(pageBox).spin('large');


            var url = path + '?page=' + currentPage;

            jQuery.ajax({
                url: url,
                type: 'GET',
                success: function (data) {
                    addComments(data);

                    currentPage += 1;
                    getPage(currentPage);


                },
                error: function (res) {
                    console.log(res);
                }
            });


        }
        else {
            jQuery(pageBox).spin(false);
        }

    }

    //This is for icon uploading!
    function editIconsInsert(path) {

        var box = jQuery("#uploadBox");
        box.css({'float': 'none'});
        box.before(('<div id="left_wrapper" style="float: left;"> <div class="highlight-box box pkg" style="width: 300px; margin: 0 15px 0 0;margin-top:2em;"> <div style="padding: 6px 12px;"><h1>Upload a batch of icons</h1><small>[by dwtools]</small> <p></p> <form enctype="multipart/form-data" action="editicons" method="post" id="uploadPic_batch"> <div class="pkg"> <p class="pkg"> <input type="radio" checked="checked" value="file" id="batch_radio_file" class="radio" name="src"> <label for="batch_radio_file">Batch Files:</label> <br> <input type="file" class="file" multiple name="batch_files" id="batch_files" size="18" style="margin: 0em 0em 0.5em 2em;"> </p> <p class="pkg" id="batch_urls_form"> <input type="radio" value="url" id="batch_radio_urls" class="radio" name="src"> <label for="batch_radio_urls">Batch URLs:</label> <br> <textarea style="z-index:1000;margin: 0em 0em 0.5em 2em;width: 240px;" id="batch_url_text"></textarea> <p class="detail">Copy and pasting multiple images is accepted.</p> </p> </div> <hr class="hr"> <input type="hidden" id="go_to" name="go_to" value="editicons"> <p class="pkg"> <label class="left" style="">Comment:</label> <br> <span class="input-wrapper"> <input type="text" maxlength="120" name="" class="text" value="" style="width: 240px;" id="comments_batch"> <p class="detail">Optional comments about the icon. Credit can go here. Will be set for all icons in batch.</p> </span> </form> <center><input style="text-align: center;" type="button" id="batch_url_upload" value="Batch upload"> </center> </div> </div> </div>'));
        try {
            box.prependTo(jQuery("#left_wrapper"));
        }
        catch (e) {

        }

        jQuery("#no_default_userpic").append('<input style="margin-left: 16px;" type="checkbox" id="checkAllDelete" class="checkbox" value="0"><label for="checkAllDelete">Select all delete</label>');

        jQuery("#checkAllDelete, #checkAllDeleteLabel").on("click", function (e) {
            jQuery('[id^="del_"]').each(function () {
                jQuery(this).trigger('click');
            });
        });

        jQuery("#batch_url_upload").on("click", function (e) {
            e.preventDefault();

            var form = jQuery("#uploadPic_batch");
            var comment = jQuery("#comments_batch").val();
            var formData;

            form.append('<input type="text" class="text" name="make_default" style="display:none" value="0">');

            if (jQuery("#batch_radio_file").prop("checked") == true) {
                var files = jQuery("#batch_files")[0].files;

                jQuery("#batch_files").prop('disabled', true);
                formData = new FormData(form[0]);

                for (var z = 0; z < files.length; z++) {
                    formData.append('userpic_' + z, files[z]);

                    var name = files[z].name.split(".");
                    formData.append('keywords_' + z, name[0]);
                    formData.append('comments_' + z, comment);
                    formData.append('descriptions_' + z, '');
                }


            }
            else {
                var text = jQuery("#batch_url_text").text();
                if (text && text.length > 0) {
                    var uri_pattern = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
                    var list = text.match(uri_pattern);

                    var keys = [];
                    jQuery('[id^="kw_"]').each(function (e) {
                        keys[$(this).val()] = 1;
                    });
                    //var data = new FormData();


                    for (var x = 0; x < list.length; x++) {
                        //data.append("urlpic_" + x,list[x]);
                        //data.append("keywords_" + x,x);
                        //data.append("comments_" + x,"");
                        //data.append("descriptions_" + x,"");
                        var urlsForm = jQuery("#batch_urls_form");
                        urlsForm.append('<input type="hidden" class="text" id="urlpic_' + x + '" name="urlpic_' + x + '"  value="' + list[x] + '">');

                        var keyword = x;

                        while (keys[keyword]) {
                            keyword++;
                        }
                        keys[keyword] = 1;

                        urlsForm.append('<input type="hidden" class="text" id="keywords_' + x + '" name="keywords_' + x + '"  value="' + keyword + '">');
                        urlsForm.append('<input type="hidden" class="text" id="comments_' + x + '" name="comments_' + x + '"  value="' + comment + '">');
                        urlsForm.append('<input type="hidden" class="text" id="descriptions_' + x + '" name="descriptions_' + x + '"  value="">');


                    }
                    jQuery("#batch_files").prop('disabled', true);
                    formData = new FormData(form[0]);
                }
            }

            $.ajax({
                url: path,
                type: 'POST',
                data: formData,
                async: true,
                cache: false,
                contentType: false,
                processData: false,
                mimeType: 'multipart/form-data',
                success: function (returndata) {
                    window.location.href = path
                }
            });

            return true;
        });


        jQuery("#batch_url_text").on("paste", function (e) {
            e.preventDefault();

            // use event.originalEvent.clipboard for newer chrome versions
            var items = (event.clipboardData || event.originalEvent.clipboardData).items;
            // find pasted image among pasted items
            var blob = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") === 0) {
                    //blob = items[i].getAsFile();
                    //console.log(blob.name);
                }
                else {
                    //look for some urls
                    if (items[i].kind === 'string') {
                        items[i].getAsString(function (s) {
                            var str = s.replace(/url\((.*?)\)/g, '');
                            var uri_pattern = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
                            var list = str.match(uri_pattern);

                            var clean = "";
                            for (var x in list) {
                                clean += list[x] + "\n";
                            }

                            jQuery("#batch_url_text").text(clean);

                        });
                    }
                }
            }

            //if (blob !== null) {
            //    var reader = new FileReader();
            //    reader.onload = function (event) {
            //        console.log(event.target.result); // data url!
            //    };
            //    reader.readAsDataURL(blob);
            //}


        });

    }

    var DWSync = {

        load: async function () {

            return new Promise(function (resolve, reject) {
                try {
                    chrome.storage.sync.get("savedDT", function (res) {
                        if (res != undefined && res.savedDT != undefined) {
                            resolve($.extend(defaultDT, JSON.parse(res.savedDT)));
                        }
                        else {
                            resolve($.extend({}, defaultDT))
                        }
                    });
                }
                catch (e) {
                    console.log(e);
                    resolve($.extend({}, defaultDT));
                }
            });

        },

        save: async function () {
            return new Promise(function (resolve, reject) {
                try {
                    chrome.storage.sync.set({"savedDT": JSON.stringify(DT)}, function () {
                        resolve();
                    });
                }
                catch (e) {
                    console.log(e);
                    resolve();
                }
            });

        }


    };

    function initDWTools() {

        addCustomButtons();
        $(".custom-button").on("click", function () {

            CustomButtonTagInsert($(this))

        });


        //for imgur icons in line

        if (DT['FIXIMGURINLINE']) {
            jQuery('[data-dwtimgsrc], .comment-content > table > tbody > tr > td > table').each(function () {
                jQuery(this).hide();
                jQuery(this).parents('.comment-content').find("td").each(function () {
                    jQuery(this).css({'padding': '0'});
                });
                var src = jQuery(this).attr("background");

                var img = jQuery(this).parents(".comment").find(".userpic img");
                if (img.length > 0) {
                    img.css({'display': "none"}).addClass("old-img");
                    img.after("<img class='new-img' src='" + src + "'>");
                }
                else {
                    jQuery(this).parents(".comment").find(".userpic").html("<img class='new-img' src=" + src + ">");
                }

                var undo = chrome.extension.getURL('img/undo.png');
                jQuery(this).parents(".comment").find(".comment-info").append("<span><img style='cursor: pointer' class='dw-undo' title='Undo the hidden icon (DWTools)' src=" + undo + "></span>");
                //$(".comments-content > img").each(function(){ $(this).css({'margin-top':'-101px','position':'relative','float':'left'});});
            });


            var padded = false;
            jQuery('body').on("click", '.dw-undo', function () {
                var ele = jQuery(this).parents(".comment").find(".comment-content > table > tbody > tr > td > table, [data-dwtimgsrc], .new-img, .old-img");
                ele.toggle();

                if (!padded) {
                    ele.parents('.comment-content').find("td").each(function () {
                        jQuery(this).css({'padding': '.2em .5em'});
                    });
                    padded = true;
                }
                else {
                    ele.parents('.comment-content').find("td").each(function () {
                        jQuery(this).css({'padding': '0'});
                    });
                    padded = false;
                }
            });
        }


        if (jQuery(NewCommentPageList).length <= 0) {
            pageList = OldCommentPageList;
            ver = 0;

            pages = (jQuery(OldCommentPageList).length / 2) + 1;
            pageBox = 'div.action-box div.inner';
            commentThread = '.comment';
            nextButton = "div.action-box div.inner > :last";
            oldLastComment = "#Comments hr";
        }
        else {
            pageList = NewCommentPageList;
            ver = 1;

            pages = jQuery(".page-links:first > a").length + 1;
            pageBox = 'div.comment-page-list';
            commentThread = '.comment-thread';
            nextButton = ".page-next > b > :last";
            oldLastComment = ".bottomcomment";
        }


        if (pages > 1) {
            if (ver == 0) {
                jQuery(".view-top-only").parent().append(' | <span class="load_all"> (<a href="" onclick="">Load All</a>)</span>');
            }
            else {
//        jQuery(".expand_all").parent().append(' | <span class="load_all"> (<a href="" onclick="">Load All</a>)</span>');
                jQuery(".view-top-only").parent().append(' | <span class="load_all"> (<a href="" onclick="">Load All</a>)</span>');
            }

        }


        var lj_userpicselect = jQuery('#lj_userpicselect');
        if (lj_userpicselect.length == 0) {
            var userpics = jQuery('.userpics');
            if (userpics.length > 0) {
                userpics.append('<input type="button" id="lj_userpicselect" value="Browse">');
            }
            else {
                jQuery("#randomicon").before('<input type="button" id="lj_userpicselect" value="Browse">');
            }


            jQuery("#prop_picture_keyword").iconselector({
                "selectorButtons": "#lj_userpicselect",
                "smallicons": false,
                "metatext": true
            });


        }


        var journal = "";


        if ($("#remote").length > 0) {
            journal = $("#remote").val();
        }
        else if (!(typeof LJ_cmtinfo === "undefined")) {
            if (!(typeof LJ_cmtinfo.remote === "undefined")) {
                journal = LJ_cmtinfo.remote;
            }
        }
        else if (!(typeof remote === "undefined")) {
            journal = remote;
        }
        else if ($("input[name=user]").length > 0) {
            journal = $("input[name=user]").val();
        }

        var albumID = "";
        for (var x in DT["IMGUR"]) {
            if (DT["IMGUR"][x][0] == journal) {
                albumID = DT["IMGUR"][x][1];
                break;
            }
        }

        if (albumID != "") {
            if (lj_userpicselect.length != 0) {
                lj_userpicselect.after('<input type="button" id="imgur_userpicselect" value="Imgur Icons">');
            }
            else {

                jQuery("#randomicon").before('<input type="button" id="imgur_userpicselect" value="Imgur Icons">');


            }

            jQuery("#imgur_userpicselect").iconselector_imgur({
                "selectorButtons": "#imgur_userpicselect",
                "smallicons": false,
                "metatext": true
            });
        }


        if (DT["AUTOSCROLL"]) {
            jQuery(window).scroll(function () {
                if (jQuery(window).scrollTop() == jQuery(document).height() - jQuery(window).height()) {
                    if ($('#comments').is(':visible')) {
                        var actionBoxes = jQuery(pageBox);

                        var nextPageButton = jQuery(nextButton);
                        var url = '';

                        if (nextPageButton.is('a')) {
                            url = nextPageButton.attr('href');

                            actionBoxes.spin('large');


                            jQuery.ajax({
                                url: url,
                                type: 'GET',
                                success: function (data) {
                                    addComments(data);

                                }
                            });
                        }
                    }
                }
            });
        }


        //Check if icon page
        if (path.indexOf("manage/icons") > -1) {
            editIconsInsert("icons");
        }
        if (path.indexOf("editicons") > -1) {
            editIconsInsert("editicons");
        }

        //add blacklist stuff
        $(".dwtools-hidden a").on("click", function (e) {
            e.preventDefault();
            $(".hidden-" + $(this).attr("data-hiddenId")).show();
            $(this).parent().remove();
        });

    }

    async function docStart() {
        DT = await DWSync.load();
        if (DT['EXPERIMENTAL'] && (DT['BLACKLIST'].length > 0 || DT['BLACKLISTJOURNALS'].length > 0)) {
            $("#comments").hide();
            runBlackList(DT);
            $("#comments").show();
        }
        initDWTools();
    }

    docStart();

    $(document).ready(function () {

        //initDWTools();
    });


})();

DT = {};
