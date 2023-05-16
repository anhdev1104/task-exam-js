function Validator(formSelector) {
    const formRules = {};

    /* Quy ước tạo rule: 
        * Nếu có lỗi thì return `error Message`
        * Nếu không có lỗi thì return `undefined`
    */
    const validatorRules = {
        required: function(value) {
            return value ? undefined : 'Vui lòng nhập trường này !';
        },
        email: function(value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email !';
        },
        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`;
            }
        },
        max: function(max) {
            return function(value) {
                return value.length <= max ? undefined : `Vui lòng nhập tối đa ${max} kí tự`;
            }
        },
    }
    // Lấy form element trong DOM theo `formSelector`
    const formElement = document.querySelector(formSelector);

    // Chỉ xử lý khi có element trong DOM 
    if (formElement) {
        const inputs = formElement.querySelectorAll('[name][rules]');
        for (let input of inputs) {
            const rules = input.getAttribute('rules').split('|');
            for (let rule of rules) {
                if (rule.includes(':')) {
                    const ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }
                // console.log(rule);
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(validatorRules[rule]);
                } else {
                    formRules[input.name] = [validatorRules[rule]];
                }
            }
        }
        console.log(formRules);
    }
}   