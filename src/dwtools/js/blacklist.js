function runBlackList(DT) {
    //keeps a id to be able to map to eventlisteners
    HiddenThreadId = 0;
    var BlackListJournals = {};
    var checkJournals = false;
    var checkBlacklist = false;

    try {

        var url = window.location.href;
        if(DT['BLACKLISTDOMAIN'].length == 0 && DT['BLACKLIST'].length > 0){
            if(DT['BLACKLIST'][0] != "") {
                checkBlacklist = true;
            }
        }
        else{
            for (var x in DT['BLACKLISTDOMAIN']) {
                if (matchRuleShort(url, '*' + DT['BLACKLISTDOMAIN'][x])) {
                    checkBlacklist = true;
                    break;
                }
            }
        }

        if(DT['BLACKLISTJOURNALDOMAINS'].length == 0 && DT['BLACKLISTJOURNALS'].length > 0){
            if(DT['BLACKLISTJOURNALS'][0] != "") {
                checkJournals = true;
            }
        }
        else {
            for (var z in DT['BLACKLISTJOURNALDOMAINS']) {
                if (matchRuleShort(url, '*' + DT['BLACKLISTJOURNALDOMAINS'][z])) {
                    checkJournals = true;
                    //BlackListJournals = DT['BLACKLISTJOURNALS'].reduce(function (map, obj) {
                    //    map[obj] = true;
                    //    return map;
                    //}, {});


                }
            }
        }

        if(checkJournals){

            for (var y in DT['BLACKLISTJOURNALS']) {
                BlackListJournals[DT['BLACKLISTJOURNALS'][y]] = true;
            }
        }


        if (checkJournals || checkBlacklist) {
            BlackListCommentsJquery();
        }

    }
    catch (e) {
        console.log(e);
    }

    function matchRuleShort(str, rule) {
        return new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
    }


    function BlackListCommentsJquery() {
        var hideThreadDepth = 1;
        var currentDepth = 1;
        var hidingThreads = false;
        var comments = document.querySelectorAll(".comment-thread");
        for (var x = 0; x < comments.length; x++) {
            var commentTop = comments[x];
            if (commentTop.classList.contains('processed')) {
                continue;
            }


            var comment = commentTop.firstElementChild;

            var classname = commentTop.getAttribute('class').split(' ')[2];
            classname = classname.substr(14);
            currentDepth = parseInt(classname);

            commentTop.classList.add('processed');
            //check if this comment is higher than the hideThreadDepth, if so hide it too
            if (hidingThreads && currentDepth > hideThreadDepth) {
                comment.style.display = 'none';
                comment.classList.add("hidden-" + HiddenThreadId.toString());
                continue;
            }
            else{
                hidingThreads = false;
            }

            var journal = comment.querySelector(".ljuser").getAttribute("lj:user");
            if (checkJournals && BlackListJournals[journal] == true) {
                if (DT['BLACKLISTJOURNALMSG']) {
                    commentTop.appendChild(addMsg(journal));
                }
                comment.style.display = 'none';
                comment.classList.add("hidden-" + HiddenThreadId.toString());
                hideThreadDepth = currentDepth;
                hidingThreads = true;
            }

            else if (commentTop.classList.contains("comment-depth-1")) {
                hideThreadDepth = 1;

                if (checkBlacklist) {
                    var id = comment.getAttribute("id").split("cmt")[1];
                    var titleElement = comment.querySelector(".comment-title");
                    var title = getText(titleElement);


                    var loaded = (comment.querySelector(".full") !== null);

                    var info = {};
                    info['element'] = comment;
                    info['id'] = id;
                    info['title'] = title;
                    info['loaded'] = loaded;


                    if (id !== undefined) {
                        // none of this comment's ancestors were blocked
                        //var reasons = checkFilter(info, filterSettings);


                        var searchable = info['title'];

                        //var reModifiers = (filterSettings['case-sensitive'] ? '' : 'i');
                        var filterList = DT['BLACKLIST'];
                        var matches = [];
                        for (var i = 0; i < filterList.length; ++i) {
                            if(filterList[i] != "") {
                                var reText = filterList[i];

                                var pattern = new RegExp(reText, 'i');
                                if (pattern.test(searchable)) {
                                    matches.push(filterList[i]);
                                }
                            }
                        }

                        if (matches.length !== 0) {
                            //hideThread(info, reasons, filterSettings['clear-identifiers'], hiddenComments);

                            comment.style.display = 'none';
                            comment.classList.add("hidden-" + HiddenThreadId.toString());

                            if (DT['BLACKLISTMSG']) {
                                commentTop.appendChild(addMsg(matches.join(', ')));
                            }

                            hideThreadDepth = currentDepth;
                            hidingThreads = true;

                        }
                    }
                }

            }


        }

    }

    function addMsg(reasons) {
        var blocked = document.createElement("div");
        blocked.className = "dwtools-hidden";


        blocked.textContent = `Thread is hidden by dwtools blacklist matching: [${reasons}] `;

        var link = document.createElement("a");
        link.href = "javascript:void(0)";
        link.setAttribute("data-hiddenId", HiddenThreadId.toString());
        link.innerHTML = "(Show this comment anyway)";

        blocked.appendChild(link);
        return blocked;

    }

    function BlackListComments() {

        //need to get the ljcomments object

        var selector = ".comment-thread";
        // in case the content script was injected after the page is partially loaded
        replace(document.querySelectorAll(selector));

        //var targetNode = document.querySelector("#comments");

        var mo = new MutationObserver(process);
        mo.observe(document, {subtree: true, childList: true, attributes: false});
        document.addEventListener('DOMContentLoaded', function () {
            mo.disconnect()
        });

        var hideThread = false;

        function process(mutations) {

            for (var i = 0; i < mutations.length; i++) {
                var nodes = mutations[i].addedNodes;
                for (var j = 0; j < nodes.length; j++) {
                    var n = nodes[j];
                    if (n.nodeType != 1) // only process Node.ELEMENT_NODE
                        continue;


                    replace(n.matches(selector) ? [n] : n.querySelectorAll(selector));

                }
            }
        }

        function replace(nodes) {
            if (nodes.length != 0) {
                [].forEach.call(nodes, function (commentTop) {
                    var isTopLevel = commentTop.classList.contains("comment-depth-1");
                    var comment = commentTop.firstElementChild;
                    if (isTopLevel) {
                        if (hideThread) {
                            HiddenThreadId++;
                        }
                        hideThread = false;


                        // skip if the comment is already hidden
                        // the user is in top-level-only view, and handling should occur later
                        if (comment.style.display == "none")
                            return;


                        var id = comment.getAttribute("id").split("cmt")[1];
                        var titleElement = comment.querySelector(".comment-title");
                        var title = getText(titleElement);

                        var loaded = (comment.querySelector(".full") !== null);

                        var info = {};
                        info['element'] = comment;
                        info['id'] = id;
                        info['title'] = title;
                        info['loaded'] = loaded;


                        //if (id !== undefined && !hiddenComments.hasOwnProperty("cmt" + id)) {
                        if (id !== undefined) {
                            // none of this comment's ancestors were blocked
                            //var reasons = checkFilter(info, filterSettings);


                            var searchable = info['title'];

                            //var reModifiers = (filterSettings['case-sensitive'] ? '' : 'i');
                            var filterList = DT['BLACKLIST'];
                            var matches = [];
                            for (var i = 0; i < filterList.length; ++i) {
                                var reText = filterList[i];

                                //if (!filterSettings['use-regex']) {
                                //    reText = reText.replace(/([.*?()\[\]\\^$])/g, "\\$1");
                                //}
                                //
                                //if (filterSettings['whole-words']) {
                                //    reText = '(?:\\b|\\s|^)' + reText + '(?:\\b|\\s|$)';
                                //}

                                var pattern = new RegExp(reText, 'i');
                                if (pattern.test(searchable)) {
                                    matches.push(filterList[i]);
                                }
                            }

                            if (matches.length !== 0) {
                                //hideThread(info, reasons, filterSettings['clear-identifiers'], hiddenComments);

                                comment.style.display = 'none';
                                comment.classList.add("hidden-" + HiddenThreadId.toString());
                                var blocked = document.createElement("div");
                                blocked.className = "dwtools-hidden";


                                blocked.textContent = `Thread is hidden by dwtools blacklist matching: [${matches.join(', ')}] `;

                                var link = document.createElement("a");
                                link.href = "javascript:void(0)";
                                link.setAttribute("data-hiddenId", HiddenThreadId.toString());
                                link.innerHTML = "(Show this comment anyway)";

                                blocked.appendChild(link);

                                commentTop.appendChild(blocked);


                                hideThread = true;

                            }
                        }

                    }
                    else if (!isTopLevel && hideThread) {
                        commentTop.style.display = 'none';
                        commentTop.classList.add("hidden-" + HiddenThreadId);
                    }
                });

            }

        }


    }

    function getTextElements(root, results) {
        if (!root.hasChildNodes()) {
            if (root.nodeType == 3) {
                results.push(root);
            }
        } else {
            for (var i = 0; i < root.childNodes.length; ++i) {
                getTextElements(root.childNodes[i], results);
            }
        }
    }

    function getText(element) {
        if (element === null) {
            return null;
        }

        var nodes = [];
        var result = "";

        getTextElements(element, nodes);
        for (var i = 0; i < nodes.length; ++i) {
            if (i > 0) result += " ";
            result += nodes[i].nodeValue;
        }

        return result;
    }

}


