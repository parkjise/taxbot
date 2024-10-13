function alert_basic(title, message) {
    Swal.fire({
        title: title,
        html: message,
        confirmButtonClass: 'cm-btn-type positive-btn1-1 medium',
        buttonsStyling: !1,
    });
}

function alert_warning(title, message) {
    Swal.fire({
        title: title,
        html: message,
        type: 'warning',
        confirmButtonClass: 'cm-btn-type basic-btn medium',
        buttonsStyling: !1,
    });
}

function alert_error(title, message) {
    Swal.fire({
        type: 'error',
        title: title,
        html: message,
        confirmButtonClass: 'cm-btn-type basic-btn medium',
        buttonsStyling: !1,
    });
}

function alert_success(title, message) {
    Swal.fire({
        title: title,
        html: message,
        type: 'success',
        confirmButtonClass: 'cm-btn-type positive-btn1-1 medium',
        buttonsStyling: !1,
    });
}

function alert_confirm(title, message, resultMsg, cancelMsg, func) {
    Swal.fire({
        title: title,
        html: message,
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '확인',
        confirmButtonClass: 'cm-btn-type positive-btn1-1 medium',
        cancelButtonClass: 'cm-btn-type basic-btn medium ml-1',
        cancelButtonText: '취소',
        buttonsStyling: !1,
    }).then(function (t) {
        if (t.value) {
            Swal.fire({
                title: '사용자 확인',
                html: resultMsg,
                type: 'success',
                timer: 2e3,
                confirmButtonClass: 'cm-btn-type positive-btn1-1 medium',
                buttonsStyling: !1,
            }).then(function (t) {
                // if (t.value) {
                func();
                // }
            });
        } else {
            alert_error('사용자 취소', cancelMsg);
        }
    });
}

function alert_confirm2(title, message, resultMsg, cancelMsg, func) {
    Swal.fire({
        title: title,
        html: message,
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '확인',
        confirmButtonClass: 'cm-btn-type positive-btn1-1 medium',
        cancelButtonClass: 'cm-btn-type basic-btn medium ml-1',
        cancelButtonText: '취소',
        buttonsStyling: !1,
    }).then(function (t) {
        if (t.value) {
            func();
        } else {
            alert_error('사용자 취소', cancelMsg);
        }
    });
}

function alert_basic_after(title, message, func) {
    Swal.fire({
        title: title,
        html: message,
        type: 'success',
        confirmButtonClass: 'cm-btn-type positive-btn1-1 medium',
        buttonsStyling: !1,
    }).then(function (t) {
        func();
    });
}

function alert_confirm_after(title, message, func) {
    Swal.fire({
        title: title,
        html: message,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "확인",
        confirmButtonClass: "cm-btn-type positive-btn1-1 medium",
        cancelButtonClass: "cm-btn-type basic-btn medium ml-1",
        cancelButtonText: "취소",
        buttonsStyling: true
    }).then((function (t) {
            if (t.value) {
                func();
            }
        }
    ));
}

function alert_basic_after2(title, message, func) {
    Swal.fire({
        title: title,
        html: message,
        confirmButtonClass: "cm-btn-type positive-btn1-1 medium",
        buttonsStyling: !1
    }).then(function (t) {
        func();
    });
}

function alert_success_after(title, message, func) {
    Swal.fire({
        title: title,
        text: message,
        type: "success",
        confirmButtonClass: "cm-btn-type positive-btn1-1 medium",
        buttonsStyling: !1
    }).then(function (t) {
        func();
    })
}

function alert_error_after(title, message, func) {
    Swal.fire({
        type: "error",
        title: title,
        text: message,
        confirmButtonClass: "cm-btn-type basic-btn medium",
        buttonsStyling: !1
    }).then(function (t) {
        func();
    })
}

function alert_custom_modal_confirm(title, message, checkBtnName) {
    document.getElementById('alert_modal_confirm_title').innerHTML = title;
    document.getElementById('alert_modal_confirm_context').innerHTML = message;
    if ("" !== checkBtnName) {
        document.getElementById('alert_modal_confirm_check_btn').innerHTML = checkBtnName;
    }
    $('#alert_modal_confirm').modal();
}

function alert_custom_modal_confirm_func(title, message, checkBtnName, func) {
    document.getElementById('alert_modal_confirm_title').innerHTML = title;
    document.getElementById('alert_modal_confirm_context').innerHTML = message;
    if ("" !== checkBtnName) {
        document.getElementById('alert_modal_confirm_check_btn').innerHTML = checkBtnName;
    }
    alert_function=func;
    $('#alert_modal_confirm_check_btn').attr('onclick', 'javascript:alert_function();');
    $('#alert_modal_confirm').modal();
}