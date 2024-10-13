// 로그인 선택 모달 담당자목록 업데이트
function setModalManagerList() {
    return new Promise(function (resolve) {
        $('#loginType').empty();

        let currManagerNo = $('#searchOptManager').val();

        ajaxRequest('/gw/managerList', 'POST', {}, (response) => {
            let $select = $('#loginType');
            let $basicOption = $('<option>').val('cert').text('공동인증서').attr('selected', true);
            $select.append($basicOption);

            $basicOption = $('<option>').val('direct').text('직접입력');
            $select.append($basicOption);

            if (response.result === 'success' && response.managers) {
                $.each(response.managers, function (key) {
                    if (key === '' || key === '-') return;

                    let $option = $('<option>').val(key).text(key);
                    if (currManagerNo === key) {
                        $option.attr('selected', true);
                        $basicOption.removeAttr('selected');
                    }
                    $select.append($option);
                });
                setSettingAutoYn();
                resolve();
            } else {
                alert_error('시스템 오류', '세무담당자 목록을 불러오는 데 실패했습니다. 담당자에게 문의하세요');
            }
        })

    });
}

function setSettingAutoYn() {
    ajaxRequest('/gw/settingInfo', 'POST', {}, (response) => {
        $('#autoYn').val(Object.keys(response).length === 0 ? 'N' : (response.mgrPwdAutoYn === 'Y' ? 'Y' : 'N'));
        setManagerInfo();
        $('#loginCheckModal').modal();
    })
}

function setManagerInfo() {
    let autoYn = $('#autoYn').val();
    let loginType = $('#loginType').val();

    $('#managerId, #managerPwd').val('').attr('disabled', loginType === 'cert');

    // 공동인증서
    if (loginType === 'cert') {
        $('#managerId, #managerPwd').attr('disabled', true);
    // 직접입력
    } else if (loginType === 'direct') {
        $('#managerId, #managerPwd').attr('disabled', false);
    // 담당자 비밀번호 자동입력
    } else {
        if (autoYn === 'Y') {
            getManagerInfo().then(function (managerInfo) {
                $('#managerPwd').val(managerInfo?.managerPwd || '').attr('disabled', managerInfo?.managerPwd !== '');
                $('#managerId').val(managerInfo?.managerId || '').attr('disabled', true); // 로그인 유형이 아닌 managerId로 설정
            });
        } else {
            $('#managerId').val(loginType);
            $('#managerId').attr('disabled', true);
            $('#managerPwd').attr('disabled', false);
        }
    }
}

// 담당자 정보
function getManagerInfo() {
    return new Promise(function (resolve) {
        ajaxRequest('/user/selectManagerInfoOne', 'POST', {managerId: $('#loginType').val()}, (response) => {
            if (response.errYn === 'N') {
                resolve(response.managerInfo);
            } else {
                alert_error('시스템 오류', '세무담당자 목록을 불러오는 데 실패했습니다. 담당자에게 문의하세요');
            }
        })
    });
}

function validateManagerInfoInputs() {
    const loginType = $('#loginType').val();
    const managerId = $('#managerId').val();
    const managerPwd = $('#managerPwd').val();

    if (loginType !== 'cert' && (managerId === '' || managerPwd === '')) {
        alert_basic('입력정보 확인', 'ID 또는 비밀번호를 확인해 주시기 바랍니다.');
        return false;
    }

    return true;
}