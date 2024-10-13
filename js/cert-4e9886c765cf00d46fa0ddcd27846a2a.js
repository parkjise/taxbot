function loadDoc(s_op, s_inJson, successCallback) {
    $.ajax({
        type: "POST",
        url: "https://127.0.0.1:16566/?op=" + s_op,
        data: s_inJson || "{}",
        crossDomain: true,
        crossOrigin: true,
        dataType: "json",
        contentType: 'application/json; charset=UTF-8',
        success: function (data) {
            if (successCallback && typeof successCallback === 'function') {
                successCallback(data);
            }
        },
        error: function (xhr, status, error) {
            if ('setup' === s_op) {
                alert_error('오류', '모듈 설치가 필요합니다.');
                window.location = 'https://infotech.co.kr/ExAdapter_Web_Setup_20231011.exe';
            } else {
                alert_error('오류', '관리자에게 문의해주세요.');
            }
        }
    });
}

//설치확인
function isNxSetup() {
    return new Promise(function (resolve) {
        loadDoc('setup', '', function (res) {
            if (res.errYn === 'N') {
                resolve(true);
            } else {
                alert_error('오류', '모듈 설치가 필요합니다.');
                window.location = 'https://infotech.co.kr/ExAdapter_Web_Setup_20231011.exe';
                resolve(false);
            }
        })
    });
}

function cerRegCheck() {
    return new Promise((resolve, reject) => {
        ajaxRequest('/user/getCertValid', 'POST', {}, (response) => {
            const list = response.list;

            const hometaxCert = list.some(item => item['업무구분'] === 'hometax');
            const wetaxCert = list.some(item => item['업무구분'] === 'wetax');

            if (!hometaxCert) {
                certModalInit('hometax', false);
                resolve(false);
                return;
            }
            if (!wetaxCert) {
                certModalInit('wetax', false);
                resolve(false)
                return;
            }
            resolve(true);
        });
    });
}

function certModalInit(siteCode, update) {
    certModalReset(siteCode, update)
    isNxSetup().then(isSetup => {
        if (isSetup) {
            setCertList()
        }
    })
}

function certModalReset(siteCode, update) {
    certList = {};
    selectCert = null;
    $('#certModalSignPw').val('');
    $('#certModalTable tbody').empty();
    $('#certModalhometaxDiv, #certModal4insureDiv, #certModal4insureMessage, #certModalCancelBtn').hide();

    let title, certModalText;

    // 닫기 활성화
    if (update) {
        $('#certMainModal').removeAttr('data-backdrop data-keyboard');
        $('#certModalCancelBtn').show();
        $('#certConfirmBtn').text('수정');
    }

    switch (siteCode) {
        case 'hometax':
            title = '홈택스 로그인 정보';
            certModalText = '세무대리인 권한을 가진 인증서를 선택해 주세요';
            $('#certModalhometaxDiv').show();
            selectAgentInfo().then(res => $('#certModalAgentIdInput').val(res.agentId));
            break;
        case 'wetax':
            title = '위택스 로그인 정보';
            certModalText = '위택스 로그인 인증서를 선택해주세요';
            break;
        case '4insure':
            title = '4대보험 통합징수포털 로그인';
            certModalText = '인증서를 선택해 주세요';
            $('#certModal4insureMessage').show();
            $('#certModal4insureDiv').show();
            $('#certModalCancelBtn').show();
            break;
        case 'nhic':
        case 'nps':
        case 'kcomwel':
            title = `${insureCodes[siteCode]} 인증정보 수정`;
            certModalText = '인증서를 선택해 주세요';
            break;
    }

    $('#certModalTitle').text(title);
    $('#certModalText').text(certModalText);
    $('#certConfirmBtn').attr('onclick', `certInfo("${siteCode}", ${update});`);
}

let certList = {}; // 인증서 리스트
let selectCert = null; // 선택한 인증서 고유 키값

function setCertList() {
    let $tbody = $('#certModalTable tbody');
    loadDoc('certList', {}, function (res) {
        if (res && res.errYn === 'N' && res.hasOwnProperty('list') && Array.isArray(res.list)) {
            certList = res;
            $.each(res.list, function (i, item) {
                const $tr = $('<tr>')
                    .css('cursor', 'pointer')
                    .attr('onclick', 'highlightCertRow(this)')
                    .attr('data-sn', item.sn)
                    .append(`<td>${distingCert(item.oid)}</td>`)
                    .append(`<td>${item.pub}</td>`)
                    .append(`<td>${item.certName}</td>`)
                    .append(`<td>${item.toDt.replace(/-/g, '.')}</td>`);
                $tbody.append($tr);
            });
            $('#certMainModal').modal();
        } else {
            alert_error('시스템 오류', '관리자에게 문의하세요.');
        }
    })
}

function highlightCertRow(clickedRow) {
    $(clickedRow).closest('table').find('tr').removeClass('highlight');
    $(clickedRow).addClass('highlight');
    selectCert = $(clickedRow).data('sn').toString();
}

async function certInfo(orgCd, update) {
    if (!selectCert) {
        alert_basic('입력정보 확인', '인증서를 선택해주세요.');
        return false;
    }

    const signPw = $('#certModalSignPw').val();
    if (!signPw) {
        alert_error('입력정보 확인', '인증서비밀번호를 입력하세요.');
        return false;
    }

    if (orgCd === '4insure') {
        const mgmtNo = $('#mgmtNo').val();
        const socialNo = $('#socialNo').val();
        const loginGb = $('#loginGb').val();

        if (!mgmtNo) {
            alert_error('입력양식 확인', '사업장관리번호를 입력하시기 바랍니다.');
            return false;
        } else if (!loginGb) {
            alert_error('입력양식 확인', '고용산재 로그인구분을 확인하시기 바랍니다.');
            return false;
        } else if (loginGb === '개인' && !socialNo) {
            alert_error('입력양식 확인', '고용산재 로그인구분 = 대표자/소속직원 이면, 주민등록번호를 입력하시기 바랍니다.');
            return false;
        }

        if (mgmtNo.length !== 14) {
            alert_error('입력양식 확인', '사업장관리번호 11자리를 입력하세요');
            return false;
        } else if (loginGb === '개인' && socialNo.length !== 14) {
            alert_error('입력양식 확인', '주민등록번호 11자리를 입력하세요');
            return false;
        }
    }

    getCertInfo(signPw, orgCd, update);
}

function getCertInfo(certPw, orgCd, update) {
    showBlockUI('등록중입니다. 잠시만 기다려주세요.');

    let cert = certList.list.find(obj => obj.sn === selectCert.toString());
    let inJson = {
        orgCd: 'common',
        svcCd: 'getCertInfo',
        signCert: `${cert.path}\\signCert.der`,
        signPri: `${cert.path}\\signPri.key`,
        signPw: certPw
    };

    loadDoc('execute', JSON.stringify(inJson), function (res) {
        let data = res;
        if (data.errYn === 'N') {
            let certObj = {};

            certObj.signPri = data.KEY2PEM ? data.KEY2PEM.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|-----BEGIN ENCRYPTED PRIVATE KEY-----|-----END ENCRYPTED PRIVATE KEY-----|\r\n|\r|\n/g, '') : alert_error('오류', 'KEY IS NOT VALID');
            certObj.signCert = data.DER2PEM ? data.DER2PEM.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|-----BEGIN ENCRYPTED PRIVATE KEY-----|-----END ENCRYPTED PRIVATE KEY-----|\r\n|\r|\n/g, '') : alert_error('오류', 'DER IS NOT VALID');
            if (!certObj.signPri || !certObj.signCert) return false;

            let mDate = data.CERT_INFO.split('DATE2: ')[1].split('Z\n')[0].replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1$2$3');
            if (mDate === 'Invalid Date') {
                alert_error('오류', '만료일자 파싱 문제가 발생했습니다.');
                return;
            }

            certObj.certType = distingCert(cert.oid);
            certObj.certPub = cert.pub;
            certObj.certPwd = certPw;
            certObj.certName = cert.certName;
            certObj.expDate = mDate;

            // 4insure : 처음 인증서 등록 3곳
            // 나머지 각각 인증서 수정
            if (orgCd === '4insure' || orgCd === 'nhic' || orgCd === 'nps' || orgCd === 'kcomwel') {
                regUpCertInfo4insure(certObj, orgCd);
            } else {
                // 수정
                if (update) {
                    updateCertInfo(certObj, orgCd)
                } else {
                    regCertInfo(certObj, orgCd)
                }
            }

        } else {
            closeBlockUI();
            alert_error('시스템 오류', `관리자에게 문의하세요.\n${data.errMsg}`);
        }
    });
}

function selectAgentInfo() {
    return new Promise(function (resolve) {
        ajaxRequest('/user/getAgentId', 'POST', {}, (response) => {
            if (response) {
                resolve(response);
            } else {
                alert_error('서버 통신 에러', response.errMsg);
            }
        });
    });
}

function regCertInfo(certObj, orgCd) {
    showBlockUI(orgCd + ' 확인중입니다.');

    let orgInfo = {
        hometax: {
            orgCd: 'hometax',
            svcCd: 'Z0000',
            signCert: certObj.signCert,
            signPri: certObj.signPri,
            signPw: certObj.certPwd,
            agentId: $("#certModalAgentIdInput").val(),
            agentPw: $("#certModalAgentPwdInput").val()
        },
        wetax: {
            orgCd: 'wetax',
            svcCd: 'LOGIN',
            signCert: certObj.signCert,
            signPri: certObj.signPri,
            signPw: certObj.certPwd
        }
    };

    let obj = {
        certInfo: certObj,
        inJson: orgInfo[orgCd] || {}
    };

    ajaxRequest('/user/checkCorpNo', 'POST', obj, (response) => {
        closeBlockUI()
        if (response) {
            if (response.errYn === 'Y') {
                alert_error_after('오류', response.errMsg, function () {
                    window.location.reload();
                });
            } else {
                cerRegCheck().then(result => {
                    if (!result) {
                        return;
                    } else {
                        scrapingAfterRegCert();
                    }
                })
            }
        } else {
            alert_error_after('오류', '관리자에게 문의하세요.', function () {
                window.location.reload();
            });
        }
    })
}

function scrapingAfterRegCert() {
    ajaxRequest('/user/scrapingAfterRegCert', 'POST', {}, (response) => {
        if (response.errYn === 'N') {
            alert_basic_after('', '수임고객정보를 수집하고 있습니다.<br>2~3분 정도 소요될 예정이오니 잠시만 기다려주시기 바랍니다.', function () {
                location.reload();
            });
        } else {
            alert_error('시스템 오류', response.errMsg);
        }
    });
}

function updateCertInfo(certObj, orgCd) {

    certObj.serviceType = orgCd;
    let requsetBody = {
        cert: certObj,
        agentId: $("#certModalAgentIdInput").val(),
        agentPwd: $("#certModalAgentPwdInput").val()
    };

    ajaxRequest('/user/certUpdate', 'POST', requsetBody, (response) => {
        closeBlockUI();

        if (response.result === 'success') {
            alert_basic_after('완료', ` ${orgCd} 인증서를 수정하였습니다.`, () => {
                window.location.reload();
            });
        } else {
            alert_error('오류', '인증서 등록에 실패하였습니다.');
        }
    })
}

function regUpCertInfo4insure(certObj, orgCd) {
    // gateway 버그로 certInfo 안에 한번더 넣어줘야댐
    certObj.serviceType = orgCd;

    let data = {
        certInfo: certObj,
        serviceType: orgCd,
        loginGb: $("#loginGb").val(),
        mgmtNo: $("#mgmtNo").val().replace(/-/g, ''),
        socialNo: $("#socialNo").val().replace(/-/g, '')
    };

    ajaxRequest('/insure/certInfo', 'POST', data, (response) => {
        closeBlockUI();

        if (orgCd === '4insure') {
            if (response.count >= 3 && response.result === 'success') {
                scr4insureAll(response);
                alert_basic_after("완료", "4대보험 로그인정보를 등록하였습니다.", () => {
                    location.href = '/service/insurance/customerList'
                });
            }
        } else {
            if (response.count >= 1 && response.result === 'success') {
                alert_basic_after("완료", "인증정보를 수정하였습니다.", () => {
                    location.reload();
                });
            }
        }
    })
}

function scr4insureAll(certRegRes) {
    let requset = {
        yyyyMM: "000000",
        uuidList: certRegRes.scrMgmtNoRes.uuidList
    };
    ajaxRequest('/insure/scr4insureAll', 'POST', requset)
}

function distingCert(oid) {
    let divNm = '기타';
    let perArr = [
        '1.2.410.200005.1.1.1',
        '1.2.410.200004.5.1.1.5',
        '1.2.410.200004.5.2.1.2',
        '1.2.410.200004.5.4.1.1',
        '1.2.410.200012.1.1.1',
        '1.2.410.200005.1.1.4',
        '1.2.410.200012.1.1.101',
        '1.2.410.200004.5.2.1.7.1',
        '1.2.410.200004.5.4.1.101',
        '1.2.410.200004.5.1.1.9.2',
        '1.2.410.200004.5.2.1.7.3',
        '1.2.410.200004.5.4.1.103',
        '1.2.410.200012.1.1.105',
        '1.2.410.200012.1.1.103',
        '1.2.410.200004.5.1.1.9',
        '1.2.410.200004.5.2.1.7.1',
        '1.2.410.200004.5.4.1.101',
        '1.2.410.200012.1.1.101',
        '1.2.410.200004.5.1.1.9',
        '1.2.410.200004.5.2.1.7.2',
        '1.2.410.200004.5.4.1.102',
        '1.2.410.200012.1.1.103',
        '1.2.410.200004.5.4.1.104',
        '1.2.410.200004.5.5.1.3.1',
        '1.2.410.200004.5.5.1.4.1',
        '1.2.410.200004.5.5.1.4.2',
    ];
    let bizArr = [
        '1.2.410.200005.1.1.5',
        '1.2.410.200004.5.1.1.7',
        '1.2.410.200004.5.2.1.1',
        '1.2.410.200004.5.4.1.2',
        '1.2.410.200012.1.1.3',
        '1.2.410.200005.1.1.2',
        '1.2.410.200005.1.1.6.1',
        '1.2.410.200004.5.1.1.12.908',
        '1.2.410.200004.5.2.1.5001',
        '1.2.410.200004.5.2.1.6.257',
        '1.2.410.200005.1.1.6.8',
        '1.2.410.200005.1.1.6.3',
        '1.2.410.200005.1.1.6.5',
        '1.2.410.200005.1.1.6.4',
        '1.2.410.200005.1.1.7.1',
        '1.2.410.200004.5.5.1.2',
    ];

    if ($.inArray(oid, perArr) !== -1) {
        divNm = '개인';
    } else if ($.inArray(oid, bizArr) !== -1) {
        divNm = '법인';
    }

    return divNm;
}