#!/usr/bin/env node
'use strict';
var http = require("http");
var Notify = require("node-notifier");
var htmlparser = require("htmlparser2");

function linksFromID(id) {
    return {
        scrape: "http://www.dominos.co.uk/checkout/pizzaTrackeriFrame.aspx?id=" + id,
        link: "http://www.dominos.co.uk/checkout/pizzatracker.aspx?id=" + id
    };
}

function matcher(name, attribs, cb) {
    if (name === "div") {
        switch (attribs.class) {
        case "step-wrap step5-collection-selected":
        case "step-wrap step5-collection-past":
            cb("Ready for collection", 5);
            break;
        case "step-wrap step5-delivery-selected":
        case "step-wrap step5-delivery-past":
            cb("Delivered", 5);
            break;
        case "step-wrap step4-selected":
            cb("Running through quality control", 4);
            break;
        case "step-wrap step3-selected":
            cb("Baking", 3);
            break;
        case "step-wrap step2-selected":
            cb("Preparing", 2);
            break;
        case "step-wrap step1-selected":
            cb("Order placed...", 1);
            break;
        default:
            break;
        }
    }
}

/*jslint unparam: true*/
function poll_pizza(id, current, end, timeout) {
    current = current !== undefined ? current : "Nothing";

    var URL = linksFromID(id);
    http.get(URL.scrape,
        function (res) {
            console.log(URL);
            var page = "";
            res.on('data',
                function (chunk) {
                    page = page + chunk;
                });
            res.on('end', function () {
                // We got the page, parse the html output for particular
                // styles to indicate what stage of delivery we're in.
                var notifier = new Notify(),
                    parser = new htmlparser.Parser({
                        onopentag:
                            function (name, attribs) {
                                matcher(name, attribs,
                                    function (note, state) {
                                        if (note !== current) {
                                            console.log("Pizza:", note, " ", URL.link);
                                            notifier.notify({
                                                // Pizza Emojii
                                                title: "🍕 Pizza 🍕",
                                                sender: "Pizza.js",
                                                open: URL.link,
                                                message: note,
                                                // Specify group so we don't have to
                                                // keep rewriting the notification
                                                group: "pizza:" + id
                                            });
                                            current = note;
                                        }

                                    });
                            },
                        onend:
                            function () {
                                console.log(current + "->" + end);
                                if (current !== end) {
                                    // Recurse on end.  We need the context to
                                    // match.
                                    setTimeout(poll_pizza, timeout,
                                            id, current, end, timeout);
                                }
                            }
                    });
                parser.write(page);
                parser.end();
            });
        });
}
/*jslint unparam: false*/

//delivery_id = process.argv[2];

//poll_pizza(delivery_id, "start", "Delivered", 5000);
var pizza_state = ["Ordered", "Preparing", "Baking", "QC", "Delivered"];

function dominos_on(data) {
    poll_pizza(data.ID, "start", "Delivered", 5000);
    data[pizza_state[4]]();
    return true;
}

module.exports = {
    on: dominos_on,
    states: pizza_state
};

