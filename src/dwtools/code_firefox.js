NewCommentPageList = '.page-links';
OldCommentPageList = 'div.action-box div.inner > span > a';

//For Text insertion
var $textBox = jQuery("#body, #commenttext");
function saveSelection() {
    $textBox.data("lastSelection", $textBox.getSelection());
}
$textBox.focusout(saveSelection);
$textBox.bind("beforedeactivate", function () {
    saveSelection();
    $textBox.unbind("focusout");
});

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



    getDT(function () {


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

            pages = (jQuery(NewCommentPageList + ":last").children().length);
            pageBox = 'div.comment-page-list';
            commentThread = '.comment-thread';
            nextButton = ".page-next > b > :last";
            oldLastComment = ".bottomcomment";
        }

//Adding buttons
        if (jQuery("#subject").length == 0) {
            isPreviewPage = true;
            $textBox = jQuery("textarea.textbox");
            $textBox.focusout(saveSelection);
            $textBox.bind("beforedeactivate", function () {
                saveSelection();
                $textBox.unbind("focusout");
            });
            jQuery('input[name=subject]').after('<input type="button" id="openTag" value="Action Tag"><input type="button" id="textTag" value="Text Tag">');   //<input type="button" id="editor" value="Rich Edit">');
        }
        else {
            jQuery('#subject').after('<input type="button" id="openTag" value="Action Tag"><input type="button" id="textTag" value="Text Tag">');   //<input type="button" id="editor" value="Rich Edit">');
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

        if (jQuery('#lj_userpicselect').length == 0) {
            if (jQuery('.userpics').length > 0) {
                jQuery(".userpics").append('<input type="button" id="lj_userpicselect" value="Browse">');
            }
            else {
                jQuery("#randomicon").replaceWith('<input type="button" id="lj_userpicselect" value="Browse">');
            }

            jQuery("#prop_picture_keyword").iconselector({
                "selectorButtons": "#lj_userpicselect",
                "smallicons": false,
                "metatext": true
            });
        }

        jQuery("#lj_userpicselect").after('<input type="button" id="imgur_userpicselect" value="Imgur Icons">');
        jQuery("#imgur_userpicselect").iconselector_imgur({
            "selectorButtons": "#imgur_userpicselect",
            "smallicons": false,
            "metatext": true
        });


        jQuery(document).on('click', '#openTag', function (event) {
            ActionTagInsert();
        });

        jQuery(document).on('click', '#textTag', function (event) {
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
            jQuery(window).scroll(function () {
                if (jQuery(window).scrollTop() == jQuery(document).height() - jQuery(window).height()) {
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
            });
        }
    });
});

jQuery(document).on('click', '.load_all', function (event) {
    event.preventDefault();

    jQuery(commentThread).remove();
    jQuery(window).unbind('scroll');
    page = 1;
    getPage();

});

jQuery(document).on('keydown', document, function (e) {
    if (e.ctrlKey && ( e.which === 47)) {
        ActionTagInsert();
    }
});

function findAllIcons(data) {
    var body = '<div id="body-mock">' + data.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '') + '</div>';

    var newPage = jQuery(body);
    var imgTags = newPage.find('.userpic-img');
    var images = [];
    for (var x in imgTags) {
        images = {src: imgTags.attr('src'),}
    }
}

function addComments(data) {
    var body = '<div id="body-mock">' + data.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '') + '</div>';


    var cmtinfo_new = data.match(/var LJ_cmtinfo[\s\S]*}}/);
    try {
        eval(cmtinfo_new[0]);
    }
    catch (err) {
        console.log("Problem eval cmtinfo.");
    }

    var sciptToExecute = ""
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

    var newPage = jQuery(body);
    var newList = newPage.find(commentThread);
    var oldLast = jQuery(oldLastComment);

    oldLast.before(newList);

    var newActionBox = newPage.find(pageBox).html();
    jQuery(pageBox).html(newActionBox);

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
        jQuery(pageBox).spin('large');
        (function () {
            jQuery.ajax({
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
        jQuery(pageBox).spin(false);
    }

}
function getDT(fn) {

    if (!window.localStorage.getItem("savedDT")) {
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
        DT = JSON.parse(window.localStorage.getItem("savedDT"));
        fn();
    }

}

function saveDT(fn) {
    window.localStorage.setItem("savedDT",JSON.stringify(DT));
    fn();

}