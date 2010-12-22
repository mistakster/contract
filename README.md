Contract
========

JS библиотека для отладки и контроля аргументов и результата работы функции

Использование
-------------

var f = Contract(functionToTest, {
        args: {},
        result: {},
        log: function () {},
        validators: {}
    });

Первым аргументом задается функция, которую нужно будет проверят, а вторым —
опции проверки, обратный вызов логгирования и именованные валидаторы.

В результате вернется прокси-функция, которую можно будет использовать
так же как и обычную. Дизайн модуля предполагает использование как
именованных функций, так и анонимных.