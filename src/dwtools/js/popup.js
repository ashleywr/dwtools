var dwtools = {};

$(document).ready(function () {

    dwtools.body = jQuery('body');
    dwtools.imgur = jQuery("#IMGUR");
    dwtools.imgurSaved = jQuery("#IMGUR-saved");
    getDT(function () {

        //apply all the values

        //action text
        $("#LAT").val(DT["LAT"]);
        $("#RAT").val(DT["RAT"]);
        setActionText();

        //text style
        $("#TEXT").val(DT["TEXT"]);
        $("#TEXT-ex").attr('style', DT["TEXT"]);

        //autoscroll
        if (DT["AUTOSCROLL"]) {
            $("#AUTOSCROLL").prop("checked", true);
        }
        else {
            $("#AUTOSCROLL").prop("checked", false);
        }

        //experimental switch
        if (DT["EXPERIMENTAL"]) {
            $("#EXPERIMENTAL").prop("checked", true);
            $("#experimental-options").removeClass('d-none');

        }
        else {
            $("#EXPERIMENTAL").prop("checked", false);
        }

        //blacklist subjects
        $("#BLACKLISTSUBJECTS").val(DT["BLACKLISTSUBJECTS"].join(", "));


        drawIMGURTable();
    });


    dwtools.body.on('blur', 'input.autosave', function () {
        var ele = $(this);
        var feature = ele.attr('title');
        DT[feature] = ele.val();


        //preprocess
        switch (feature) {
            case 'BLACKLISTSUBJECTS':
                DT[feature] = DT[feature].toLowerCase();
                DT[feature] = DT[feature].split(/[^a-zA-Z-]+/g).filter(v=>v);

                break;
        }


        saveDT(function () {

            //postprocess
            switch (feature) {
                case 'LAT':
                    setActionText();
                    break;
                case 'RAT':
                    setActionText();
                    break;
                case 'TEXT':
                    $("#TEXT-ex").attr("style", DT["TEXT"]);
                    break;


            }

            //this is the same for everyone
            var check = ele.siblings(".feedback-icon");
            check.css("display", "inline");
            ele.addClass("valid");
            window.setTimeout(function () {
                //check.css("display", "none");
                //ele.removeClass("valid");
            }, 1000);
        });
    });


    dwtools.body.on('click', '#AUTOSCROLL', function () {
        DT["AUTOSCROLL"] = !!$("#AUTOSCROLL").prop("checked");

        saveDT();
    });

    dwtools.body.on('click', '#EXPERIMENTAL', function () {
        DT["EXPERIMENTAL"] = !DT["EXPERIMENTAL"];

        if (DT["EXPERIMENTAL"]) {
            $("#experimental-options").removeClass('d-none');
        }
        else {
            $("#experimental-options").addClass('d-none');
        }

        saveDT();
    });

    dwtools.body.on('click', '.album-remove', function () {

        var sibs = $(this).siblings();
        var validate = [$(sibs[0]).val(), $(sibs[1]).val()];
        for (var x = 0; x < DT["IMGUR"].length; x++) {

            if (DT["IMGUR"][x][0].toLocaleLowerCase() == validate[0].toLocaleLowerCase() && DT["IMGUR"][x][1] == validate[1]) {
                DT["IMGUR"].splice(x, 1);
                $(this).parent().parent().remove();
                break;
            }

        }

        saveDT();
    });

    dwtools.body.on('submit', '.imgur-form', function (event) {
        event.preventDefault();

        //var form = $(this);

        var validate = [];
        var journal = $(this).find(".journal-name-input");
        var jo = journal.val();
        var imgurId = $(this).find(".imgur-id-input");
        var id = imgurId.val();
        var valid = true;
        if (jo.length == 0 && id.length == 0) {
            valid = false;
        }
        if (jo.length > 100 || jo.length < 3) {
            journal.addClass('is-invalid');
            valid = false;
        }
        if (id.length < 3 || id.length > 20) {
            //error

            imgurId.addClass('is-invalid');
            valid = false;
        }

        if (valid) {
            validate = [jo, id];

            //check if it exists
            var isNew = true;
            for (var x = 0; x < DT["IMGUR"].length; x++) {

                if (DT["IMGUR"][x][0].toLocaleLowerCase() == validate[0].toLocaleLowerCase() && DT["IMGUR"][x][1] == validate[1]) {
                    isNew = false;
                    break;
                }

            }

            if (isNew) {


                //var ele = $(this);
                jQuery.ajax({
                    beforeSend: function (request) {
                        request.setRequestHeader("Authorization", "Client-ID 1f9dd436ec6a677");
                    },
                    type: "GET",
                    url: 'https://api.imgur.com/3/album/' + validate[1],
                    error: function () {
                        //validate[2] = false;
                        //$("#album-check").css("display", "inline");
                        imgurId.addClass("is-invalid");

                    },
                    success: function (res) {
                        if (res.status == 200) {
                            journal.removeClass('is-invalid');
                            imgurId.removeClass('is-invalid');

                            journal.val('');
                            imgurId.val('');
                            DT["IMGUR"].push(validate);
                            saveDT(function () {
                                addRowIMGURSavedRows(validate)
                            });
                        }
                        else {
                            imgurId.addClass("is-invalid");
                        }


                    }
                });
            }
            else {
                journal.removeClass('is-invalid');
                imgurId.removeClass('is-invalid');
                journal.val('');
                imgurId.val('');
            }
        }
    });
});


function addRowIMGURSavedRows(inputs) {

    dwtools.imgurSaved.append(`<div class="row">
    <div class="col-sm-auto">
        <button class="album-remove btn btn-outline-danger btn-sm" style="height: 18px; width: 18px; padding: 0; vertical-align: middle; line-height: 0;">&#x2717;</button>
        <input type="hidden" class="journal-name" value="${inputs[0]}">
        <input type="hidden" class="album-id" value="${inputs[1]}">
    </div>
    <div class="col-sm-auto">
        <img src="../img/newicon.png" width="16" height="16" style="vertical-align: text-bottom; border: 0; padding-right: 1px;"><b>${inputs[0]}</b>

    </div>
    <div class="col-sm-auto">
        <a href="http://imgur.com/a/${inputs[1]}" target="_blank"><img src="../img/imgur.png" width="16" height="16" style="vertical-align: text-bottom; border: 0; padding-right: 1px;">${inputs[1]}</a>
    </div>

</div>


    `);

}


function drawIMGURTable() {
    //Create the imgur-album table

    for (var x = 0; x < DT["IMGUR"].length; x++) {
        addRowIMGURSavedRows(DT["IMGUR"][x]);
    }

}

function setActionText() {
    $("#ACTION").html(DT["LAT"] + " This is your action text. " + DT["RAT"]);
}

function getDT(fn = ()=> {
}) {

    var defaultDT = {
        LAT: "<small>[ ",
        RAT: " ]</small>",
        TEXT: "font-family:courier new",
        AUTOSCROLL: true,
        IMGUR: [['test', 'D1K9L']],
        EXPERIMENTAL: true,
        BLACKLISTSUBJECTS: []
    };

    try {
        chrome.storage.sync.get("savedDT", function (res) {
            if (res == undefined || res.savedDT == undefined) {
                DT = $.extend({}, defaultDT);
                saveDT(fn);
            }
            else {
                DT = JSON.parse(res.savedDT);
                fn();
            }
        });
    }
    catch (e) {
        console.log(e);
        DT = $.extend({}, defaultDT);
        fn();

    }

}

function saveDT(fn = ()=> {
}) {
    try {
        chrome.storage.sync.set({"savedDT": JSON.stringify(DT)}, function () {
            fn();
        });
    }
    catch (e) {
        console.log(e);
        fn();
    }
}