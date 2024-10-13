$('input[type="text"]').attr('autocomplete', 'one-time-code');
let defaultTaxCode = '14';

$(document).ready(function () {
    // 2023-02-01 최봉운대리 요청으로 전체로 변경, 2023-05-01 '14'로 변경
    defaultTaxCode = '14'

    setCurrentMenuFixed();
    getHeaderData()
        .then(function(outJson){
            setHeader(outJson);
        })
        .catch(function(error){
            console.log(error);
        });

    // 스크롤바
    new PerfectScrollbar(".vertical-scroll", {
        wheelPropagation: !0
    })
    new PerfectScrollbar(".vertical-scrollbar01", {
        wheelPropagation: !0
    });
    new PerfectScrollbar(".vertical-scrollbar02", {
        wheelPropagation: !0
    });
});

$(".cm-tooltip-open-btn").hover(function () {
    $(this).find(".cm-tooltip-con").show();
}, function () {
    $(".cm-tooltip-con").hide();
});

// 사이드바, 헤더 활성화
function setCurrentMenuFixed() {
    let menu = $('#menuStat').val();
    if (menu) {
        let $menuItem = $('#' + menu).closest('li');
        // 4대보험 공지사항 탭
        if ('noticeView' === menu || 'noticeWrite' === menu) {
            $menuItem = $('#noticeList').closest('li');
        }

        $menuItem.addClass('active');
        $menuItem.parents('.nav-item').addClass('has-sub open');
    }

    let menuType = $('#menuType').val();
    if (menuType) {
        menuType = 'salary' === menuType ? 'notice' : menuType;
        $('#' + menuType + 'MenuType').addClass('active');
    }
}

function openModal(id) {
    $('#' + id).modal();
}

function getHeaderData(){
    return new Promise(function(resolve){
        ajaxRequest('/user/taxFirmName', 'GET', null, (response) => {
            resolve(response);
        })
    });
}

// 수집 spinner, 세무사협회 set
function setHeader(outJson){
    if (outJson.result === 'success') {

        // 세무사협회
        if (outJson.groupName) {
            $("#groupExist").removeClass('d-none');
            $("#groupName").text(outJson.groupName);
        }

        // 수집 spinner
        let spinner = $('#scrapingSpinner');
        if (Number(outJson.validCount) < 1) {
             spinner.removeClass('xi-spin');
             spinner.addClass('none');
        } else {
            spinner.removeClass('none');
            spinner.addClass('xi-spin');
        }

    } else {
        alert_error('시스템 오류', '로그인 사용자 정보를 불러오는데 실패하였습니다. 관리자에게 문의하세요 \n');
    }
}

//4대보험 활성화여부 체크
function check4InsureValid() {
    ajaxRequest('/user/is4InsureValid', 'POST', {type: '4insure'}, (response) => {
        const cnt = response.cnt;
        if (cnt === 0) {
            alert_confirm_after('알림', "택스봇 4대보험 서비스를 활성화합니다.", () => {
                certModalInit('4insure', false);
            });
        } else {
            location.href = '/service/insurance/customerList';
        }
    });
}

function loginGbChange() {
    $('#socialNo').prop('disabled', $('#loginGb').val() !== '개인');
}

function setManagerList() {
    return new Promise(function (resolve, reject) {
        let currManagerNo = $('#currManagerSelected').val();

        let $select = $('#searchOptManager').empty();
        let $basicOption = $('<option>;', {
            value: 'all',
            text: '전체',
            selected: true
        });
        $select.append($basicOption);

        ajaxRequest('/gw/managerList', 'POST', {}, (response) => {
            if (response.result === 'success') {
                if (response.managers) {
                    $.each(response.managers, function(key) {
                        let $option = $('<option>', {
                            value: key,
                            text: key
                        });
                        $select.append($option);
                        if (currManagerNo === key && key !== '') {
                            $select.css('color', 'blue');
                            $option.prop('selected', true);
                            $basicOption.prop('selected', false);
                        }
                    });
                }
                resolve();
            } else {
                reject(response);
            }
        })
    });
}

function adminLogin() {
    ajaxRequest('/admin/adminLogin', 'GET', '', (response) => {
        location.href = response.url;
    })
}

// pro 전용 체크
function proRollCheck(type) {
    ajaxRequest('/rollCheck/pro', 'GET', null, (response) => {
        if ('taxbotCloud' === type) checkTaxbotCloudAccount();
        if ('addons' === type) location.href = "/service/addons/hometaxIssuanceApply";
        if ('notice' === type) location.href = "/service/notice/management";
        if ('biznote' === type) location.href = "/service/biznote/main";
    })
}

// 세액공제 계정 체크
function checkTaxbotCloudAccount() {
    ajaxRequest('/cloud/checkTaxbotCloudAccount', 'GET', null, (response) => {
        if (response.errYn === 'N') {
            if (response.accountYn === 'N') connectTaxbotCloudService();
            else updateTaxbotCloudInfo();
        } else {
            alert_error('시스템 오류', response.errMsg);
        }
    })
}

// 세액공제 약관동의
function connectTaxbotCloudService() {
    ajaxRequest('/cloud/connectTaxbotCloudService', 'GET', null, (response) => {
        if (response.errYn === 'N') {
            const param = response.data;
            const url = response.taxbotCloudUrl;

            // window.open('http://127.0.0.1:9037/connectCloud/connectFromTaxbot?p=' + param, "_blank", "width=1200, height=1000, top=0,left=0");
            // window.open('https://103.244.111.143:9037/connectCloud/connectFromTaxbot?p=' + param, "_blank", "width=1200, height=1000, top=0,left=0");

            let w = 860;
            let h = 1080;

            let screenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
            let screenTop = window.screenTop != undefined ? window.screenTop : screen.top;

            let width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
            let height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

            let left = ((width / 2) - (w / 2)) + screenLeft;
            let top = ((height / 2) - (h / 2)) + screenTop;

            window.open(url + '/connectCloud/connectFromTaxbot?p=' + param, '_blank', 'width=' + w + ', height=' + h + ', top=' + top + ',left=' + left);

        } else {
            alert_error('시스템 오류', response.errMsg);
        }
    })
}

// 세액공제 정보 업데이트
function updateTaxbotCloudInfo() {
    ajaxRequest('/cloud/updateTaxbotCloudInfo', 'GET', null, (response) => {
        if (response.errYn === 'N') {
            location.href = '/service/cloud/list';
        } else {
            alert_error('시스템 오류', response.errMsg);
        }
    })
}

function clickBasicTaxcredit(modalId) {
    $('#' + modalId).modal('hide');
    openModal('modal_pro_service_application');
}

// 프로 서비스 신청
function applicateProService() {
    let data = {
        callTime: $('#callTime option:selected').text(),
        callTel: $('#callTel').val(),
        applyType: 'taxbotPro'
    }

    applyService(data);
}

function taxbotRCloudServiceReqModalExct() {
    let data = {
        callTime: $('#callTimeByCloudHeader option:selected').text(),
        callTel: $('#callTelByCloudHeader').val(),
        applyType: 'taxbotCloud'
    }

    applyService(data);
}

function applyService(data) {
    if (!data.callTel) {
        alert_basic("휴대폰번호 입력확인", "휴대폰번호를 입력해주세요.");
        return;
    }

    ajaxRequest('/customer/applyProService', 'POST', data, (response) => {
        if (response.message === "SUCCESS"){
            alert_basic_after('완료','서비스 신청 예약이 완료되었습니다.', () => {
                location.reload();
            });
        } else {
            alert_error('시스템 오류', '요청에 실패하였습니다. 관리자에게 문의하세요.');
        }
    })
}

// 무료 체험 10일 연장
function extendProTrial() {
    ajaxRequest('/user/extendProTrial', 'GET', null, (response) => {
        if (response.errYn === 'N') {
            alert_basic('', response.msg);
            $('#freeEnd_modal').modal('hide');
        } else {
            alert_error('', response.errMsg);
        }
    })
}

function loginTaxbotCloudService() {
    ajaxRequest('/cloud/loginTaxbotCloudService', 'GET', null, (response) => {
        if (response.errYn === 'N') {
            $('#cloudR_move').modal('hide');

            const param = response.data;
            const url = response.taxbotCloudUrl;

            // window.open('http://127.0.0.1:9037/connectCloud/loginTaxbotCloud?p=' + param);
            window.open(url + '/connectCloud/loginTaxbotCloud?p=' + param);

        } else {
            alert_error('시스템 오류', response.errMsg);
        }
    })
}

////////////////////////////////아래 수정예정//////////////////////////////////////////////////

function setCookieWithClose(name, expiredays) {
    setCookie(name, 'Y', expiredays);
    $('#' + name).modal('hide');
}