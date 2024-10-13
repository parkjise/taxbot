$(window).ready(function () {
    initSendModal();
})

function initSendModal() {
    const menuStat = $('#menuStat').val();

    if ('hometaxIssuanceList' === menuStat) {
        convertToDisplayNone('sendModalTxnrmYmRow');
        convertToDisplayNone('sendModalCheckAll');

        convertSendModalText('sendModalDocTypeTitle', '증명서종류');
        convertSendModalText('sendModalFilesTitle', '3. 민원증명서류');
        convertSendModalText('sendModalButton', '민원증명서류보기');

        return;
    }
    if ('salarySend' === menuStat) {
        convertToDisplayNone('sendModalFileAddDiv');
        convertToDisplayNone('sendModalCheckAll');
    }

    if ('writeForm' === menuStat) {
        convertToDisplayNone('sendModalTxnrmYmRow');
        convertToDisplayNone('sendModalFileAddDiv');
        convertToDisplayNone('sendModalCheckAll');

        convertSendModalText('sendModalDocType', '납부서');
        convertSendModalText('sendModalFilesTitle', '3. 납부서류');
        convertSendModalText('sendModalButton', '납부서류 보기');
    }

    if ('hometaxAssistance' === menuStat) {
        convertToDisplayNone('sendModalFileAddDiv');
        convertToDisplayNone('sendModalCheckAll');

        convertSendModalText('sendModalDocType', '종합소득세 안내문');
        convertSendModalText('sendModalFilesTitle', '3. 첨부파일');
    }

    if ('customerInfo' === menuStat) {
        convertToDisplayNone('sendModalFileAddDiv');
        convertToDisplayNone('sendModalCheckAll');
        convertToDisplayNone('sendModalTxnrmYmRow');

        convertToDisplayShow('channelDanger');
        convertSendModalText('channelDangerText', '수임동의 발송은 LMS문자 발송이 불가합니다');

        convertSendModalText('sendModalButton', '수임동의하기');
    }

    if ('biznote' === menuStat) {
        convertToDisplayNone('sendModalFileWrap');
        convertToDisplayNone('sendModalTxnrmYmRow');
        convertToDisplayNone('sendModalCnt');

        convertSendModalText('sendModalDocTypeTitle', '종류');
        convertSendModalText('sendModalDocType', '택스봇 경영노트');
        convertSendModalText('sendModalButton', '서비스 가입');
    }
}

function sendModalSetCommon(index, modalData) {
    let data = modalData[index];
    $('#sendModalIdx').val(index);
    $('#sendModalCnt').text(`(${index + 1}/${modalData.length})`);

    $('#fileCheckAll').prop('checked', false);

    $('#sendModalPhoneReception').prop('checked', data['휴대폰수신여부'] === 'Y');
    $('#sendModalLmsReception').prop('checked', data['LMS수신여부'] === 'Y');
    $('#sendModalEmailReception').prop('checked', data['이메일수신여부'] === 'Y');
    if (data['휴대폰수신여부'] === 'N' && data['LMS수신여부'] === 'N' && data['이메일수신여부'] === 'N') {
        $('#sendModalPhoneReception').prop('checked', true);
    }


    $('input[name="sendModalPhoneNo"]').each((idx, el) => {
        $(el).val((data['휴대폰'] || '').split(';')[idx]);
    });
    $('input[name="sendModalEmail"]').each((idx, el) => {
        $(el).val((data['이메일'] || '').split(';')[idx]);
    });

    $('#sendModalFiles').empty();

    $('#sendModalNextBtn').toggleClass('active', index + 1 !== modalData.length)
        .toggleClass('d-none', index + 1 === modalData.length)
        .prop('disabled', index + 1 === modalData.length)
        .off('click').on('click', () => sendModalInputCheck(index + 1, 'modal'));

    $('#sendModalPrevBtn').toggleClass('active', index !== 0)
        .toggleClass('d-none', index === 0)
        .prop('disabled', index === 0)
        .off('click').on('click', () => sendModalInputCheck(index - 1, 'modal'));

    $('#sendModalSendBtn').toggleClass('positive-btn1-1', index + 1 === modalData.length)
        .toggleClass('negative-btn1', index + 1 !== modalData.length)
        .prop('disabled', index + 1 !== modalData.length);
}

function sendModalInputCheck(index, flag) {
    let phoneCheck = $('#sendModalPhoneReception').prop('checked');
    let emailCheck = $('#sendModalEmailReception').prop('checked');
    let lmsCheck = $('#sendModalLmsReception').prop('checked');
    let customerPhoneNo = [];
    let customerEmail = [];
    if (!phoneCheck && !emailCheck && !lmsCheck) {
        alert_basic('입력정보 확인', '발송채널을 선택해주세요');
        return;
    }
    if ((phoneCheck || lmsCheck) && !$('input[name="sendModalPhoneNo"]').filter((_, el) => $(el).val()).length) {
        alert_basic('입력정보 확인', '휴대폰번호를 입력해주세요');
        return;
    }

    let customerPhoneNoCheck = true;
    $('input[name="sendModalPhoneNo"]').each((_, el) => {
        let value = $(el).val();
        if (value && !/^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/.test(value)) {
            customerPhoneNoCheck = false;
            return false;
        }
        if (value) customerPhoneNo.push(value);
    });
    if (!customerPhoneNoCheck) {
        alert_basic('입력정보 확인', '잘못된 형식의 핸드폰 번호가 있습니다.<br/>핸드폰 번호를 확인해 주시기 바랍니다.');
        return;
    }

    if (emailCheck && !$('input[name="sendModalEmail"]').filter((_, el) => $(el).val()).length) {
        alert_basic('입력정보 확인', '이메일주소를 입력해주세요');
        return;
    }

    let customerEmailCheck = true;
    $('input[name="sendModalEmail"]').each((_, el) => {
        let value = $(el).val();
        if (value && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
            customerEmailCheck = false;
            return false;
        }
        if (value) customerEmail.push(value);
    });
    if (!customerEmailCheck) {
        alert_basic('입력정보 확인', '잘못된 형식의 이메일 주소가 있습니다.<br/>이메일 주소를 확인해 주시기 바랍니다.');
        return;
    }

    let dataIndex = $('#sendModalIdx').val();

    let data = modalData[dataIndex];

    if (data['pdfSelect']) {
        data['pdfSelect'] = [];

        $('#sendModalFiles').find("input[name='pdfInfoCheck']:checked").each((i, e) => {
            data['pdfSelect'].push($(e).siblings('a').eq(0).attr("data-pdfid"));
        });

        if (data['pdfSelect'].length === 0) {
            alert_basic('입력정보 확인', '첨부된 파일이 없습니다.<br/>첨부하실 파일을 확인해주세요.');
            return;
        }
    }

    if (data['pdfInfo']) {
        let certCheckYn = false;
        data['pdfInfo'].forEach(obj => { if (obj.민원증명순번) certCheckYn = true; })

        if (certCheckYn) {
            let certPdfList = data['pdfInfo'].filter(obj => obj.checked === true && obj.민원증명순번 !== 'none');
            if (certPdfList.length === 0) {
                alert_basic('', '민원증명서류가 포함되지 않았습니다.<br>민원증명서류를 확인해 주시기 바랍니다.');
                return;
            }
        }
    }

    data['휴대폰수신여부'] = $('#sendModalPhoneReception').is(':checked') ? 'Y' : 'N';
    data['이메일수신여부'] = $('#sendModalEmailReception').is(':checked') ? 'Y' : 'N';
    data['LMS수신여부'] = $('#sendModalLmsReception').is(':checked') ? 'Y' : 'N';
    data['휴대폰'] = customerPhoneNo.join(';');
    data['이메일'] = customerEmail.join(';');

    // 주의 : js에서 input 만들어서 넣을 경우 id 변경되어 체크 필요
    if ($('#sendModalManagerPhoneNo')) data['담당자대표번호'] = $('#sendModalManagerPhoneNo').val();
    if ($('#sendModalManagerMail')) data['담당자이메일'] = $('#sendModalManagerMail').val();
    if ($('#sendModalManagerId')) data['담당자아이디'] = $('#sendModalManagerId').val();

    if ($('#managerPhoneNo' + dataIndex)) data['managerPhoneNo'] = $('#managerPhoneNo' + dataIndex).val();
    if ($('#managerMail' + dataIndex)) data['managerMail'] = $('#managerMail' + dataIndex).val();
    if ($('#managerId' + dataIndex)) data['managerId'] = $('#managerId' + dataIndex).val();

    if (flag === 'modal') sendModalSet(index);
    if (flag === 'send') sendModalExecution();
}

function convertToDisplayNone(id) {
    $('#' + id).addClass('d-none');
}

function convertSendModalText(id, name) {
    $('#' + id).html(name);
}

function convertToDisplayShow(id){
    $('#' + id).removeClass('d-none');
}