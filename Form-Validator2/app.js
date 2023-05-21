function Validator(formSelector) {
    const _this = this;
    const formRules = {};
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

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
                const isRuleHasValue = rule.includes(':');
                let ruleInfo;
                if (isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                    
                }

                let ruleFunc = validatorRules[rule];
                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
            }

            // Lắng nghe sự kiện để validate (blur, change, ...)
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }
        
        // Hàm thực hiện validate
        function handleValidate(event) {
            const rules = formRules[event.target.name];
            let errorMessage;

            for (let rule of rules) {
                errorMessage = rule(event.target.value);
                if (errorMessage) break;
            }

            // Nếu có lỗi thì hiển thị message lỗi ra UI 
            if (errorMessage) {
                const formGroup = getParent(event.target, '.form-group');
                if (formGroup) {
                    formGroup.classList.add('invalid');

                    const formMessage = formGroup.querySelector('.form-message');
                    if (formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
            }

            return !errorMessage;
        }

        // Hàm clear message lỗi
        function handleClearError(event) {
            const formGroup = getParent(event.target, '.form-group');
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');

                const formMessage = formGroup.querySelector('.form-message');
                if (formMessage) {
                    formMessage.innerText = '';
                }
            }
        }
    }

    // Xử lí hành vi submit form
    formElement.onsubmit = function (event) {
        event.preventDefault();

        const inputs = formElement.querySelectorAll('[name][rules]');
        let isValid = true;

        for (let input of inputs) {
            if (!handleValidate({ target: input })) {
                isValid = false;
            };
        }

        // Khi không có lỗi thì submit form
        if (isValid) {
            if (typeof _this.onSubmit === 'function') {
                const enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                // Cover từ nodeLists sang Array
                const formValues = Array.from(enableInputs).reduce(function (values, input) {
                    switch (input.type) {
                        case 'radio':
                            if (input.checked) {
                                values[input.name] = input.value;
                            }
                            if (!values[input.name]) {
                                values[input.name] = '';
                            }
                            break;
                        case 'checkbox':
                            if (!input.checked) return values;
                            if (!values[input.name]) {
                                values[input.name] = '';
                            }
                            if (!Array.isArray(values[input.name])) {
                                values[input.name] = [];
                            }
                            values[input.name].push(input.value);
                            break;
                        case 'file': 
                            values[input.name] = input.files;
                            break;
                        default:
                            values[input.name] = input.value;
                    }
                    return values;
                }, {});

                // Gọi lại hàm onSubmit() và trả về kèm giá trị của form
                _this.onSubmit(formValues);
            } else {
                formElement.submit();
            }
        }
    }
}   