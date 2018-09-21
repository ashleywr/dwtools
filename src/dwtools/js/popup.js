(function () {
    //globals
    var defaultDT = {
        LAT: "<small>[ ",
        RAT: " ]</small>",
        TEXT: "font-family:courier new",
        AUTOSCROLL: true,
        IMGUR: [],
        EXPERIMENTAL: true,
        BLACKLIST: []

    };
    var DT = {};

    //global fuctions
    function autosaveInput(ele, optVal) {
        var feature = ele.attr('title');
        DT[feature] = optVal || ele.val();

        DWSync.save();

        //this is the same for everyone
        var check = ele.siblings(".feedback-icon");
        check.css("display", "inline");
        ele.addClass("valid");
        window.setTimeout(function () {
            check.css("display", "none");
            ele.removeClass("valid");
        }, 1000);

    }

    var delay = (function () {
        var timer = 0;
        return function (callback, ms, that) {
            clearTimeout(timer);
            timer = setTimeout(callback.bind(that), ms);
        };
    })();


    //page sections
    var CustomTextButtonsSection = (function () {


    })();
    var ActionButtonsSection = (function () {

        var render = function () {
            var ele = jQuery("#ACTION-SECTION");
            $("#LAT").val(DT["LAT"]);
            $("#RAT").val(DT["RAT"]);
            setActionText();

            ele.on('keyup', '.autosave', function () {
                autosaveInput($(this));
                setActionText();
            });
        };

        function setActionText() {
            $("#ACTION").html(DT["LAT"] + "This is your action text." + DT["RAT"]);
        }

        return {
            render: render
        };

    })();
    var TextStyleSection = (function () {
        var render = function () {
            var ele = jQuery("#TEXT-SECTION");


            $("#TEXT").val(DT["TEXT"]);
            setText();

            ele.on('keyup', '.autosave', function () {
                setText();
                autosaveInput($(this));
            });
        };

        function setText() {
            $("#TEXT-ex").attr("style", DT["TEXT"]);
        }


        return {
            render: render
        };

    })();
    var AutoScrollSection = (function () {

        var render = function () {
            var ele = jQuery("#AUTOSCROLL-SECTION");
            if (DT["AUTOSCROLL"]) {
                $("#AUTOSCROLL").prop("checked", true);
            }
            else {
                $("#AUTOSCROLL").prop("checked", false);
            }

            ele.on('click', '#AUTOSCROLL', function () {
                DT["AUTOSCROLL"] = !!$("#AUTOSCROLL").prop("checked");

                DWSync.save();
            });
        };

        return {
            render: render
        };

    })();
    var ImgurSection = (function () {

        function addRowIMGURSavedRows(input) {
            return `<div class="row">
    <div class="col-sm-auto">
        <button class="album-remove btn btn-outline-danger btn-sm"
                style="height: 18px; width: 18px; padding: 0; vertical-align: middle; line-height: 0;">&#x2717;</button>
        <input type="hidden" class="journal-name" value="${input[0]}">
        <input type="hidden" class="album-id" value="${input[1]}">
    </div>
    <div class="col-sm-auto">
        <img src="../img/newicon.png" width="16" height="16"
             style="vertical-align: text-bottom; border: 0; padding-right: 1px;"><b>${input[0]}</b>

    </div>
    <div class="col-sm-auto">
        <a href="http://imgur.com/a/${input[1]}" target="_blank"><img src="../img/imgur.png" width="16"
                                                                            height="16"
                                                                            style="vertical-align: text-bottom; border: 0; padding-right: 1px;">${input[1]}</a>
    </div>

</div>`;
        }

        function render() {
            //Create the imgur-album table
            var html = "";
            var savedTable = $("#IMGUR-saved");
            for (var x = 0; x < DT["IMGUR"].length; x++) {
                html += addRowIMGURSavedRows(DT["IMGUR"][x]);
            }
            savedTable.html(html);

            savedTable.on('click', '.album-remove', function () {

                var sibs = $(this).siblings();
                var validate = [$(sibs[0]).val(), $(sibs[1]).val()];
                for (var x = 0; x < DT["IMGUR"].length; x++) {

                    if (DT["IMGUR"][x][0].toLocaleLowerCase() == validate[0].toLocaleLowerCase() && DT["IMGUR"][x][1] == validate[1]) {
                        DT["IMGUR"].splice(x, 1);
                        $(this).parent().parent().remove();
                        break;
                    }

                }

                DWSync.save();
            });
            jQuery(".imgur-form").on('submit', function (event) {
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
                                    DWSync.save();
                                    savedTable.append(addRowIMGURSavedRows(validate));

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

        }


        return {
            render: render
        }

    })();
    var ExperimentalSection = (function () {

        var render = function () {
            var ele = jQuery("#EXPERIMENTAL-SECTION");
            if (DT["EXPERIMENTAL"]) {
                $("#EXPERIMENTAL").prop("checked", true);
                $("#experimental-options").removeClass('d-none');

            }
            else {
                $("#EXPERIMENTAL").prop("checked", false);
            }

            jQuery("#EXPERIMENTAL").on('click', function () {
                DT["EXPERIMENTAL"] = !DT["EXPERIMENTAL"];

                if (DT["EXPERIMENTAL"]) {
                    $("#experimental-options").removeClass('d-none');
                }
                else {
                    $("#experimental-options").addClass('d-none');
                }

                DWSync.save();
            });

            //blacklist subjects
            try{
                str = DT["BLACKLIST"].join(", ");
                $("#BLACKLIST").val(str);
            }
            catch(e){
                DT["BLACKLIST"] = [];
            }


            $("#BLACKLIST").on('keyup', function () {
                var self = $(this);
                delay(function () {
                    var str = self.val();
                    var arr = str.split(",").map(function(item) {
                        return item.trim();
                    });
                    autosaveInput(self, arr);
                }, 500);

            });
        };

        return {
            render: render
        };

    })();

    //for saving and loading of settings
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

    var DWToolsInit = async function () {
        DT = await DWSync.load();

        ActionButtonsSection.render();
        TextStyleSection.render();
        AutoScrollSection.render();
        ImgurSection.render();
        ExperimentalSection.render();

    };

    $(document).ready(function () {
        DWToolsInit();

    });

})
();