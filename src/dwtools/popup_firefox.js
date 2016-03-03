


$(document).ready(function () {

    getDT(function () {
        $("#LAT").val(DT["LAT"]);
        $("#RAT").val(DT["RAT"]);
        $("#TEXT").val(DT["TEXT"]);

        if (DT["AUTOSCROLL"]) {
            $("#AUTOSCROLL").prop("checked", true)
        }
        else {
            $("#AUTOSCROLL").prop("checked", false)
        }

        setActionText();
        $("#TEXT-ex").attr('style', DT["TEXT"]);

        drawIMGURTable();
    });


    $("body").on('blur', '#LAT', function (event) {
        DT["LAT"] = $("#LAT").val();

        saveDT(function () {
            $("#lat-check").css("display", "inline");
            window.setTimeout(function () {
                $("#lat-check").css("display", "none");
            }, 1000);
            setActionText();

        });
    });
    $("body").on('blur', '#RAT', function (event) {
        DT["RAT"] = $("#RAT").val();

        saveDT(function () {
            $("#rat-check").css("display", "inline");
            window.setTimeout(function () {
                $("#rat-check").css("display", "none");
            }, 1000);
            setActionText();
        });
    });
    $("body").on('blur', '#TEXT', function (event) {
        DT["TEXT"] = $("#TEXT").val();

        saveDT(function () {
            $("#TEXT-ex").attr("style", DT["TEXT"]);
            $("#text-check").css("display", "inline");
            window.setTimeout(function () {
                $("#text-check").css("display", "none");
            }, 1000);
        });
    });

    $("body").on('click', '#text-save', function (event) {
        DT["TEXT"] = $("#TEXT").val();

        saveDT(function () {
            $("#TEXT-ex").attr("style", DT["TEXT"]);
            $("#text-check").css("display", "inline");
            window.setTimeout(function () {
                $("#text-check").css("display", "none");
            }, 2000);
        });
    });

    $("body").on('click', '#AUTOSCROLL', function (event) {
        if ($("#AUTOSCROLL").prop("checked")) {
            DT["AUTOSCROLL"] = true;
        }
        else {
            DT["AUTOSCROLL"] = false;
        }

        saveDT(function () {

        });
    });

    $("body").on('click', '.imgur-save', function (event) {

        DT["IMGUR"] = [];

        $("#IMGUR tr").each(function (index, ele) {
            var jo = $(ele).find(".journal-name-input").val();
            var id = $(ele).find(".imgur-id-input").val();
            if (jo.length == 0 && id.length == 0) {
                $(ele).remove();
            }
            else if (jo.length > 0 && jo.length < 100 && id.length > 0) {

                //TEST THE ALBUM
                DT["IMGUR"].push([jo, id]);
            }


        });

        saveDT(function () {


            for (var z in DT["IMGUR"]) {
                (function (z) {
                    $.ajax({
                        beforeSend: function (request) {
                            request.setRequestHeader("Authorization", "Client-ID 1f9dd436ec6a677");
                        },
                        type: "GET",
                        url: 'https://api.imgur.com/3/album/' + DT["IMGUR"][z][1],
                        error: function () {
                            DT["IMGUR"][z][2] = false;
                            saveDT(function () {
                                drawIMGURTable();
                            });
                        },
                        success: function (res) {
                            if (res.status == 200) {
                                DT["IMGUR"][z][2] = true;
                            }
                            else {
                                DT["IMGUR"][z][2] = false;
                            }
                            saveDT(function () {
                                drawIMGURTable();
                            });

                        }
                    });
                })(z);
            }

            drawIMGURTable();
        });

    });
});

function drawIMGURTable() {
    //Create the imgur-album table
    $("#IMGUR").html("");
    for (var x in DT["IMGUR"]) {
        var html = ' <tr>        <td>        <input type="text" class="journal-name-input" value="' + DT["IMGUR"][x][0] + '">        </td>        <td>        <input type="text" class="imgur-id-input" value="' + DT["IMGUR"][x][1] + '">        </td>        <td>        <button class="imgur-save">Save</button>';
        if (DT["IMGUR"][x][2] != undefined && DT["IMGUR"][x][2]) {
            html += '<div class="check" style="color: green; display: inline">&#x2713;';
        }
        if (DT["IMGUR"][x][2] != undefined && !DT["IMGUR"][x][2]) {
            html += '<div class="check" style="color: red; display: inline">&#x2717;';
        }
        else {
            html += '<div class="check" style="display: none;">';
        }

        html += '</div>        </td>    </tr>';
        $("#IMGUR").append(html);

    }
    $("#IMGUR").append(' <tr>        <td>        <input type="text" class="journal-name-input">        </td>        <td>        <input type="text" class="imgur-id-input">        </td>        <td>        <button class="imgur-save">Save</button><div class="check" style="display: none;"></div>        </td>    </tr>');

}

function setActionText() {
    $("#ACTION").html(DT["LAT"] + " This is your action text. " + DT["RAT"]);
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