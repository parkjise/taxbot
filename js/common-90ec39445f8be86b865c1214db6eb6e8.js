function ajaxRequest(url, method, data, successCallback, errorCallback) {
    $.ajax({
        url: url,
        method: method,
        data: JSON.stringify(data),
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            if (successCallback && typeof successCallback === 'function') {
                successCallback(response);
            }
        },
        error: function (xhr, status, error) {
            if (errorCallback && typeof errorCallback === 'function') {
                errorCallback(xhr, status, error);
            } else {
                console.error('AJAX Error:', error);
            }
            errorCodeHandling(xhr.responseText);
            closeBlockUI();
        }
    });
}
function ajaxRequestForm(url, method, data, successCallback, errorCallback) {
    $.ajax({
        url: url,
        method: method,
        data: data,
        success: function (response) {
            if (successCallback && typeof successCallback === 'function') {
                successCallback(response);
            }
        },
        error: function (xhr, status, error) {
            if (errorCallback && typeof errorCallback === 'function') {
                errorCallback(xhr, status, error);
            } else {
                console.error('AJAX Error:', error);
            }
            errorCodeHandling(xhr.responseText);
            closeBlockUI();
        }
    });
}
function errorCodeHandling(responseText) {
    const responseJSON = JSON.parse(responseText);

    if (401 === responseJSON.status) {
        alert_error('', "로그아웃되었습니다. 다시 로그인해주시기 바랍니다.");
        setTimeout(function () {
            window.location.reload();
        }, 2000);
        return;
    }
    if (403 === responseJSON.status) {
        alert_error('', '접근 권한이 없습니다.');
        return;
    }

    if (418 === responseJSON.status) {
        alert_basic('', '다운로드 가능한 파일이 없습니다.');
        return;
    }

    if (483 === responseJSON.status) {
        $("#endDateCheckModal_3").modal("show");
        return;
    }
    if (493 === responseJSON.status) {
        eventModalPopup('freeEnd_modal');
        return;
    }

    if (504 === responseJSON.status) {
        alert_error('서버 연결 끊김', responseJSON.error);
        return;
    }

    alert_error('서버 통신 에러', responseJSON.error + ' 관리자에게 문의하세요.');
}

function eventModalPopup(modalId) {
    if (getCookie("endDateCheckCookie_" + modalId) === 'Y') return;
    $('#' + modalId).modal('show');
}

function userAccess(action) {
    ajaxRequest('/user/userAccessLog', 'POST', {"action": action});
}

function showBlockUI(msg) {
    $.blockUI({
        message: '<i class="xi-spinner-1 xi-spin"></i><br><h3 class="mt-2">' + msg + '</h3>',
        fadeIn: 200,
        overlayCSS: {
            backgroundColor: 'rgb(0,0,0)',
            opacity: 0.95,
            cursor: 'wait',
        },
        css: {
            border: 0,
            padding: 0,
            color: '#fff',
            backgroundColor: 'transparent',
        },
    });
}

function closeBlockUI() {
    $.unblockUI();
}

//쿠키설정
function setCookie(name, value, expiredays) {
    let todayDate = new Date();
    todayDate.setDate(todayDate.getDate() + expiredays);
    document.cookie = name + '=' + escape(value) + '; path=/; expires=' + todayDate.toGMTString() + ';'
}

//쿠키 불러오기
let endOfCookie;

function getCookie(name) {
    let obj = name + "=";
    let x = 0;
    while (x <= document.cookie.length) {
        let y = (x + obj.length);
        if (document.cookie.substring(x, y) === obj) {
            if ((endOfCookie = document.cookie.indexOf(";", y)) === -1)
                endOfCookie = document.cookie.length;
            return unescape(document.cookie.substring(y, endOfCookie));
        }
        x = document.cookie.indexOf(" ", x) + 1;

        if (x === 0) break;
    }
    return "";
}