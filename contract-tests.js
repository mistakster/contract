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
        validators: {
            dummy: function (constraint, value) {
                return true;
            },
            fail: function (constraint, value) {
                return false;
            }
        },
        log: function(msg) {
            ok(false, msg);
        }
    };


    module("Contract");

    test("Validators", function () {
        // пустой конструктор
        var v1 = new Contract.Validators();
        deepEqual(v1, Contract.Validators.prototype, "оригинальные валидаторы");
        // конструктор с дополнительными валидаторами
        var v2 = new Contract.Validators(opts.validators);
        notDeepEqual(v2, Contract.Validators.prototype, "дополнительные валидаторы");
        equal(v2.dummy, opts.validators.dummy, "валидатор dummy");
        equal(v2.fail, opts.validators.fail, "валидатор fail");
        // массив в качестве параметра
        var v3 = new Contract.Validators([
            function () {},
            function () {},
            function () {}
        ]);
        ok(v3[0], "валидатор с именем 0 существует");
        ok(v3[1], "валидатор с именем 1 существует");
        ok(v3[2], "валидатор с именем 2 существует");
        ok(!v3[3], "валидатор с именем 3 не существует");
    });



    var fc = Contract(func, opts);

    test("base", function () {
        fc(1,2);
        fc(4,2);
        fc(5,5,6,7);
    });

});
