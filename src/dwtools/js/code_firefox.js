NewCommentPageList = '.page-links';
OldCommentPageList = 'div.action-box div.inner > span > a';

//For Text insertion
var $textBox;
function saveSelection() {
    $textBox.data("lastSelection", $textBox.getSelection());
}


var DT = {};
var path = window.location.pathname;

var ver;
var pages;
var page;
var pageList;
var pageBox;
var commentThread;
var nextButton;
var oldLastComment;
var isPreviewPage = false;


$(document).ready(function () {

    $textBox = $("#body, #commenttext");
    $textBox.focusout(saveSelection);
    $textBox.bind("beforedeactivate", function () {
        saveSelection();
        $textBox.unbind("focusout");
    });

    getDT(function () {
        //Check if icon page
        if (path.indexOf("editicons") > -1) {
            editIconsInsert();
        }

        if ($(NewCommentPageList).length <= 0) {
            pageList = OldCommentPageList;
            ver = 0;

            pages = ($(OldCommentPageList).length / 2) + 1;
            pageBox = 'div.action-box div.inner';
            commentThread = '.comment';
            nextButton = "div.action-box div.inner > :last";
            oldLastComment = "#Comments hr";
        }
        else {
            pageList = NewCommentPageList;
            ver = 1;

            pages = ($(NewCommentPageList + ":last").children().length);
            pageBox = 'div.comment-page-list';
            commentThread = '.comment-thread';
            nextButton = ".page-next > b > :last";
            oldLastComment = ".bottomcomment";
        }

//Adding buttons
        if ($("#subject").length == 0) {
            isPreviewPage = true;
            $textBox = $("textarea.textbox");
            $textBox.focusout(saveSelection);
            $textBox.bind("beforedeactivate", function () {
                saveSelection();
                $textBox.unbind("focusout");
            });
            $('input[name=subject]').after('<input type="button" id="openTag" value="Action Tag"><input type="button" id="textTag" value="Text Tag">');   //<input type="button" id="editor" value="Rich Edit">');
        }
        else {
            $('#subject').after('<input type="button" id="openTag" value="Action Tag"><input type="button" id="textTag" value="Text Tag">');   //<input type="button" id="editor" value="Rich Edit">');
        }


        if (pages > 1) {
            if (ver == 0) {
                $(".view-top-only").parent().append(' | <span class="load_all"> (<a href="" onclick="">Load All</a>)</span>');
            }
            else {
//        $(".expand_all").parent().append(' | <span class="load_all"> (<a href="" onclick="">Load All</a>)</span>');
                $(".view-top-only").parent().append(' | <span class="load_all"> (<a href="" onclick="">Load All</a>)</span>');
            }

        }

        if ($('#lj_userpicselect').length == 0) {
            if ($('.userpics').length > 0) {
                $(".userpics").append('<input type="button" id="lj_userpicselect" value="Browse">');
            }
            else {
                $("#randomicon").before('<input type="button" id="lj_userpicselect" value="Browse">');
            }

            $("#prop_picture_keyword").iconselector({
                "selectorButtons": "#lj_userpicselect",
                "smallicons": false,
                "metatext": true
            });
        }

        $("#lj_userpicselect").after('<input type="button" id="imgur_userpicselect" value="Imgur Icons">');
        $("#imgur_userpicselect").iconselector_imgur({
            "selectorButtons": "#imgur_userpicselect",
            "smallicons": false,
            "metatext": true
        });


        $(document).on('click', '#openTag', function (event) {
            ActionTagInsert();
        });

        $(document).on('click', '#textTag', function (event) {
            getDT(function () {
                var selection = $textBox.data("lastSelection");
                $textBox.focus();

                if (selection == undefined) {
                    $textBox.text('<span style="' + DT["TEXT"] + '"></span>');
                }
                else {
                    $textBox.setSelection(selection.start, selection.end);
                    var text = $textBox.getSelection();
                    $textBox.replaceSelectedText('<span style="' + DT["TEXT"] + '">' + text.text + '</span>');
                }

            });
        });

        if (DT["AUTOSCROLL"]) {
            $(window).scroll(function () {
                if ($(window).scrollTop() == $(document).height() - $(window).height()) {
                    var actionBoxes = $(pageBox);

                    var nextPageButton = $(nextButton);
                    var url = '';

                    if (nextPageButton.is('a')) {
                        url = nextPageButton.attr('href');

                        actionBoxes.spin('large');


                        $.ajax({
                            url: url,
                            type: 'GET',
                            success: function (data) {
                                addComments(data);

                            }
                        });
                    }
                }
            });
        }
    });
});

$(document).on('click', '.load_all', function (event) {
    event.preventDefault();

    $(commentThread).remove();
    $(window).unbind('scroll');
    page = 1;
    getPage();

});

$(document).on('keydown', document, function (e) {
    if (e.ctrlKey && ( e.which === 47)) {
        ActionTagInsert();
    }
});

function findAllIcons(data) {
    var body = '<div id="body-mock">' + data.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '') + '</div>';

    var newPage = $(body);
    var imgTags = newPage.find('.userpic-img');
    var images = [];
    for (var x in imgTags) {
        images = {src: imgTags.attr('src')}
    }
}

function addComments(data) {
    var body = '<div id="body-mock">' + data.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '') + '</div>';


    var cmtinfo_new = data.match(/var LJ_cmtinfo[\s\S]*}}/);
    var LJ_cmtinfo = "";

    try {
        //eval(cmtinfo_new[0]);
        LJ_cmtinfo = JSON.parse(cmtinfo_new[0].substring(16,cmtinfo_new[0].length));
    }
    catch (err) {
        console.log("Problem eval cmtinfo.");
    }

    var sciptToExecute = ""

    if (LJ_cmtinfo != "") {
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

    var newPage = $(body);
    var newList = newPage.find(commentThread);
    var oldLast = $(oldLastComment);

    oldLast.before(newList);

    var newActionBox = newPage.find(pageBox).html();
    $(pageBox).html(newActionBox);

}

function ActionTagInsert() {
    getDT(function () {
        var selection = $textBox.data("lastSelection");
        $textBox.focus();

        if (selection == undefined) {
            var text = DT["LAT"] + " " + DT["RAT"];
            text = text.replace(/^\s+|\s+$/g, '');
            $textBox.text(text);
        }
        else {
            $textBox.setSelection(selection.start, selection.end);
            var text = $textBox.getSelection();
            var originalText = text.text;

            text = text.text.replace(/^\s+|\s+$/g, '');
            text = DT["LAT"] + text + DT["RAT"];
            text = text.replace(/^\s+|\s+$/g, '');

            if(originalText.charAt(0) == '\n'){
                text = "\n" + text;
            }
            if(originalText.charAt(originalText.length) == '\n'){
                text = text + '\n';
            }

            $textBox.replaceSelectedText(text);
        }

    });
}

function getPage() {
    if (page <= pages) {
        $(pageBox).spin('large');
        (function () {
            $.ajax({
                url: path + '?page=' + page,
                type: 'GET',
                success: function (data) {
                    addComments(data);
                    page++;
                    (function () {
                        getPage();
                    })();
                }
            });
        })(page);
    }
    else {
        $(pageBox).spin(false);
    }

}
function getDT(fn) {
    if (chrome.storage) {
        chrome.storage.sync.get("savedDT", function (res) {
            if (res == undefined || res.savedDT == undefined) {
                DT = {
                    LAT: "<small>[ ",
                    RAT: " ]</small>",
                    TEXT: "font-family:courier new",
                    AUTOSCROLL: true,
                    IMGUR: []
                };
                saveDT(fn);
            }
            else {
                DT = JSON.parse(res.savedDT);
                fn();
            }
        });
    }
    else{
        DT = {
            LAT: "<small>[ ",
            RAT: " ]</small>",
            TEXT: "font-family:courier new",
            AUTOSCROLL: true,
            IMGUR: []
        };
        fn(-1);
    }
}

function saveDT(fn) {
    if (chrome.storage) {
        chrome.storage.sync.set({"savedDT": JSON.stringify(DT)}, function () {
            fn();
        });
    }
    else{
        fn(-1);
    }
}

function htmlEscape(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}


//This is for icon uploading!
function editIconsInsert() {

    var box = $("#uploadBox");
    box.css({'float': 'none'});
    box.before(('<div id="left_wrapper" style="float: left;"> <div class="highlight-box box pkg" style="width: 300px; margin: 0 15px 0 0;margin-top:2em;"> <div style="padding: 6px 12px;"><h1>Upload a batch of icons</h1> <p></p> <form enctype="multipart/form-data" action="editicons" method="post" id="uploadPic_batch"> <div class="pkg"> <p class="pkg"> <input type="radio" checked="checked" value="file" id="batch_radio_file" class="radio" name="src"> <label for="batch_radio_file">Batch Files:</label> <br> <input type="file" class="file" multiple name="batch_files" id="batch_files" size="18" style="margin: 0em 0em 0.5em 2em;"> </p> <p class="pkg" id="batch_urls_form"> <input type="radio" value="url" id="batch_radio_urls" class="radio" name="src"> <label for="batch_radio_urls">Batch URLs:</label> <br> <textarea style="z-index:1000;margin: 0em 0em 0.5em 2em;width: 240px;" id="batch_url_text"></textarea> <p class="detail">Copy and pasting multiple images is accepted.</p> </p> </div> <hr class="hr"> <input type="hidden" id="go_to" name="go_to" value="editicons"> <p class="pkg"> <label class="left" style="">Comment:</label> <br> <span class="input-wrapper"> <input type="text" maxlength="120" name="" class="text" value="" style="width: 240px;" id="comments_batch"> <p class="detail">Optional comments about the icon. Credit can go here. Will be set for all icons in batch.</p> </span> </form> <center><input style="text-align: center;" type="button" id="batch_url_upload" value="Batch upload"> </center> </div> </div> </div>'));
    try {
        box.prependTo($("#left_wrapper"));
    }
    catch (e) {

    }

    $("#no_default_userpic").append('<input style="margin-left: 16px;" type="checkbox" id="checkAllDelete" class="checkbox" value="0"><label for="checkAllDelete">Select all delete</label>');

    $("#checkAllDelete, #checkAllDeleteLabel").on("click", function (e) {
        $('[id^="del_"]').each(function () {
            $(this).trigger('click');
        });
    });

    $("#batch_url_upload").on("click", function (e) {
        e.preventDefault();

        var form = $("#uploadPic_batch");
        var comment = $("#comments_batch").val();
        var formData;

        form.append('<input type="text" class="text" name="make_default" style="display:none" value="0">');

        if ($("#batch_radio_file").prop("checked") == true) {
            var files = $("#batch_files")[0].files;

            $("#batch_files").prop('disabled', true);
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
            var text = $("#batch_url_text").text();
            if (text && text.length > 0) {
                var uri_pattern = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
                var list = text.match(uri_pattern);

                var keys = [];
                $('[id^="kw_"]').each(function (e) {
                    keys[$(this).val()] = 1;
                });
                //var data = new FormData();


                for (var x = 0; x < list.length; x++) {
                    //data.append("urlpic_" + x,list[x]);
                    //data.append("keywords_" + x,x);
                    //data.append("comments_" + x,"");
                    //data.append("descriptions_" + x,"");
                    var urlsForm = $("#batch_urls_form");
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
                $("#batch_files").prop('disabled', true);
                formData = new FormData(form[0]);
            }
        }

        $.ajax({
            url: 'editicons',
            type: 'POST',
            data: formData,
            async: true,
            cache: false,
            contentType: false,
            processData: false,
            mimeType: 'multipart/form-data',
            success: function (returndata) {
                window.location.href = "editicons"
            }
        });

        return true;
    });


    $("#batch_url_text").on("paste", function (e) {
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

                        $("#batch_url_text").text(clean);

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