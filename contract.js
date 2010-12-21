(function (window, undefined) {

    var PHASE_IN = "in",
        PHASE_OUT = "out",
        ARGUMENTS_LENGTH = "argumentsLength",
        VALIDATORS = {
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
                                Constraints.range(constraint, len) : (constraint == len);
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
                    },
            "validator":    // кастомный js валидатор (Function или String)
                    function (constraint, value) {
                        var ret = false, func;
                        try {
                            func = (constraint instanceof Function) ? constraint : new Function("value", constraint);
                            ret = func(value);
                        } catch (ex) {}
                        return ret;
                    }
        };


    function log(msg) {
        if (console && console.log) {
            console.log(msg);
        }
    }

    function stringBuilder(phase, name, position) {
        var s = [phase];
        if (phase === PHASE_IN && name !== ARGUMENTS_LENGTH) {
            s.push(position || 0)
        }
        s.push(name);
        return s.join(".");
    }

    function check(opts, validators, data, phase, log) {
        var i, name, contracts;
        for (i = 0; i < data.length; i++) {
            if (opts[i]) {
                contracts = opts[i];
                for (name in contracts) if (contracts.hasOwnProperty(name) && validators.hasOwnProperty(name)) {
                    if (!validators[name](contracts[name], data[i])) {
                        log(stringBuilder(phase, name, i));
                    }
                }
            }
        }
    }

    function before() {
        var opts = this.args;
        if (opts.length && opts.length !== arguments.length) {
            this.log(stringBuilder(PHASE_IN, ARGUMENTS_LENGTH, 0));
        }
        check(opts, this.validators, arguments, PHASE_IN, this.log);
    }

    function after() {
        check(this.result, this.validators, arguments, PHASE_OUT, this.log);
    }

    function extend(obj, opts) {
        var name, copy;

        for (name in opts) {
            copy = opts[name];
            if (copy !== undefined) {
                obj[name] = copy;
            }
        }

        return obj;
    }

    window['Contract'] = function (fn, opts) {

        var local = extend({validators: VALIDATORS, log: log, args: [], result: []}, opts);

        return function () {
            var result;
            before.apply(local, arguments);
            result = fn.apply(this, arguments);
            after.call(local, result);
            return result;
        };
    };

}(window));
