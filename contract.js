/**
 * Programming by Contract
 *
 * @author  mista_k
 * @version 0.1
 */
(function (window, undefined) {

    var PHASE_IN = "in",
        PHASE_OUT = "out",
        ARGUMENTS_LENGTH = "argumentsLength",
        C = {}; // local namespace

    function extend(obj, opts) {
        var name, copy;
        for (name in opts) if (opts.hasOwnProperty(name)) {
            copy = opts[name];
            if (copy !== undefined) {
                obj[name] = copy;
            }
        }
        return obj;
    }

    function stringBuilder(phase, name, position) {
        var s = [phase];
        if (phase === PHASE_IN && name !== ARGUMENTS_LENGTH) {
            s.push(position || 0)
        }
        s.push(name);
        return s.join(".");
    }


    var V = {
        "blank":        // пустая / непустая строка (Boolean)
                function (constraint, value) {
                    value = ("" + value).length > 0; // convert to string and chech length
                    return constraint || value;
                },
        "inList":       // вхождение в список (Array of strings)
                function (constraint, value) {
                    var i, ret = false;
                    for (i = 0; i < constraint.length; i++) {
                        if (constraint[i] == value) {
                            ret = true;
                            break;
                        }
                    }
                    return ret;
                },
        "matches":      // соответствие регекспу (Regexp string)
                function (constraint, value) {
                    // все слеши должны быть экранированы
                    var rx = new RegExp(constraint);
                    return rx.test(value);
                },
        "max":          // проверка на максимум (Float)
                function (constraint, value) {
                    return value <= constraint;
                },
        "min":          // проверка на минимум (Float)
                function (constraint, value) {
                    return value >= constraint;
                },
        "notEqual":     // не равно (любой тип, скорее всего String)
                function (constraint, value) {
                    return value != constraint;
                },
        "nullable":     // null / не null (Boolean)
                function (constraint, value) {
                    return constraint || !!value;   // convert any not null value to true
                },
        "range":        // диапазон (Array of floats)
                function (constraint, value) {
                    return (value >= constraint[0] && value <= constraint[1]);
                },
        "scale":        // количество знаков после запятой (Integer)
                function (constraint, value) {
                    var pattern = /^-?\d+(\.\d*)?$/,
                            fv = parseFloat(value); // convert to float
                    return !isNaN(fv) &&
                            pattern.test("" + value) &&
                            parseFloat(fv.toFixed(constraint)) === fv;
                },
        "size":         // размер строки (Integer или Array of integers)
                function (constraint, value) {
                    var len = ("" + value).length;
                    return (Object.prototype.toString.call(constraint) === "[object Array]") ?
                            V.range(constraint, len) : (constraint == len);
                },
        "maxSize":      // максимальный размер строки (Integer)
                function (constraint, value) {
                    var len = ("" + value).length;
                    return len <= constraint;
                },
        "minSize":      // минимальный размер строки (Integer)
                function (constraint, value) {
                    var len = ("" + value).length;
                    return len >= constraint;
                }
    };

    C.Validators = function (opts) {
        extend(this, typeof opts === "object" ? opts : {});
    };

    extend(C.Validators.prototype, V);


    // конструктор для экземпляра контракта
    C.Proxy = function (fn, opts) {
        this.args = opts.args;
        this.result = opts.result;
        this.log = opts.log;
        this.validators = new C.Validators(opts.validators);
        this.fn = fn;
    };

    extend(C.Proxy.prototype, {
        // список контрактов для аргументов функции
        args: [],

        // список контрактов для результата
        result: [],

        // набор именованных валидаторов
        validators: {},

        // логгирование сверок с контрактом
        log: function (msg) {
            if (console && console.log) {
                console.log(msg);
            }
        },

        before: function () {
            var opts = this.args;
            if (opts.length && opts.length !== arguments.length) {
                this.log(stringBuilder(PHASE_IN, ARGUMENTS_LENGTH, 0));
            }
            this.check(opts, arguments, PHASE_IN);
        },

        after: function () {
            this.check(this.result, arguments, PHASE_OUT);
        },

        check: function (opts, data, phase) {
            var i, name, contracts;
            for (i = 0; i < data.length; i++) {
                if (opts[i]) {
                    contracts = opts[i];
                    for (name in contracts) if (contracts.hasOwnProperty(name) && this.validators[name]) {
                        if (!this.validators[name](contracts[name], data[i])) {
                            this.log(stringBuilder(phase, name, i));
                        }
                    }
                }
            }
        }


    });

    /**
     * Обертка для декларации контракта
     * @param fn    {Function}  функция, которая будет проверятся на соответствии контракту
     * @param opts  {Object}    не обязательные параметры, описывающие контракт
     */
    window.Contract = function (fn, opts) {

        var contract = new C.Proxy(fn, opts);

        return function () {
            var result;
            contract.before.apply(contract, arguments);
            result = contract.fn.apply(this, arguments);
            contract.after.call(contract, result);
            return result;
        };
    };

    extend(window.Contract, C);

}(window));
