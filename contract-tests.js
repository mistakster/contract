$(function () {

    var func = function (a, b) {
        return a * b;
    };

    var opts = {
        args: [
            {
                min: 0,
                max: 3
            },
            {
                min: 0
            }
        ],
        result: [
            {
                max: 15
            }
        ],
        log: function(msg) {
            ok(false, msg);
        }
    };

    var fc = Contract(func, opts);

    module("Contract");

    test("base", function () {
        fc(1,2);
        fc(4,2);
        fc(5,5,6,7);
    });

});
