let sendList = [];
let modalData = [];
let selectCount = 0;

$(window).ready(function() {
    let searchMap = returnSearchMap();

    let sdate;
    let edate;

    if (searchMap.sdate) {
        sdate = Formatter.toYYYYMMDD(searchMap.sdate);
        edate = Formatter.toYYYYMMDD(searchMap.edate);
    } else {
        sdate = Formatter.toYYYYMMDD(Util.getDateYYYMMDD('week'));
        edate = Formatter.toYYYYMMDD(Util.getDateYYYMMDD());
    }

    if(defaultTaxCode === '42') $('#searchOptTaxCode').val('14').prop('selected', true);

    let taxCodeSelected = $("#taxCodeSelected").val();
    if ('' === taxCodeSelected || null === taxCodeSelected) taxCodeSelected = defaultTaxCode;

    let searchOptTaxCode = $('#searchOptTaxCode').find('option[value="' + taxCodeSelected + '"]').length > 0 ? taxCodeSelected : defaultTaxCode;
    $('#searchOptTaxCode').val(searchOptTaxCode);

    if(searchMap.taxCode) $('#searchOptTaxCode').val(searchMap.taxCode).prop('selected', true);

    $('#searchOptSdate').val(sdate);
    $('#searchOptEdate').val(edate);
    $('#searchOptTxnrmYm').val(Formatter.toYYYYMM(Util.getDateYYYMM()));

    setManagerList().then(() => {
        if (searchMap.managerId) $('#searchOptManager').val(searchMap.managerId).prop('selected', true);
        fnSearch();
    });

    // 첨부파일 취소 시 초기화
    $('button[name="uploadPopupClose"]').on('click', function () {
        $('#remove-files').click();
    })

    // 빌송하기 모달 전체
    $('#fileCheckAll').on('click', function () {
        selectAll(this);
    })

    // 발송하기 모달 취소 시
    $('#sendModalCancelBtn').on('click', function () {
        fnSearch($('#pageNoSet').val());
    })
});

// 발송하기 모달 전체선택
function selectAll(selectAll) {
    let pdfIdList = '/';

    $('input[name="pdfInfoCheck"]').each((i, checkbox) => {
        checkbox.checked = selectAll.checked;
        if ($(checkbox).siblings('a').length > 0) pdfIdList += $(checkbox).siblings('a').attr("data-pdfid") + '/';
    })

    let inJson = {
        pdfId: null,
        pdfIdList: pdfIdList,
        checked: selectAll.checked,
    };

    ajaxRequest('/gwPost/cancelFile', 'POST', inJson, (response) => {
        let idx = $('#sendModalIdx').val();
        if (selectAll.checked) {
            modalData[idx]['pdfSelect'] = modalData[idx]['pdfList'];
        } else {
            modalData[idx]['pdfSelect'] = [];
        }
        updateMessage();
    })
}

function searchOptBizNoKeyUp() {
    if (window.event.keyCode === 13) {
        fnSearch();
    }
}

// 검색
function fnSearch(pageNo) {
    let searchOptions = {
        managerSelect: $('#searchOptManagerSelect option:selected').val(),
        manager: $('#searchOptManager option:selected').val(),
        txnrmYm: $('#searchOptTxnrmYm').val().replaceAll('-', '') || '',
        bizNo: $('#searchOptBizNo').val().trim() || '',
        sndYn: $('#searchOptSndYn option:selected').val(),
        taxCode: $('#searchOptTaxCode option:selected').val(),
        sdate: $('#searchOptSdate').val() || '',
        edate: $('#searchOptEdate').val() || '',
        dateType: $('#searchOptDateType option:selected').val(),
        pmtYn: $('#searchOptPmtYn option:selected').val(),
        pagingCount: $('#pagingCount').val(),
        pageNo: pageNo ? pageNo : '1',
    };
    if (/[0-9]{3}-[0-9]{2}-[0-9]{5}/.test(searchOptions.bizNo)) {
        searchOptions.bizNo = searchOptions.bizNo.replaceAll('-', '');
    }
    $('#certTable tbody').empty();
    fnListCert(searchOptions);
}

function fnChangeDateTypeToRprtDate() {
    const taxCode = $('#searchOptTaxCode option:selected').val();

    if ('31' == taxCode || '10' == taxCode) {
        $('#searchOptDateType').val('rprtDate');

        $('#rprtDateTd').css('display', '');
        $('#txnrmYmTd').css('display', 'none');
    }
}

function fnChangeDateType() {
    const taxCode = $('#searchOptTaxCode option:selected').val();

    if ($('#searchOptDateType option:selected').val() === 'txnrmYm') {

        if ('31' == taxCode || '10' == taxCode) {
            $('#searchOptDateType').val('rprtDate');
            alert_basic('', '법인세, 종합소득세는 과세년월로 조회할 수 없습니다.');
            return;
        }

        $('#rprtDateTd').css('display', 'none');
        $('#txnrmYmTd').css('display', '');

    } else if ($('#searchOptDateType option:selected').val() === 'rprtDate') {

        $('#rprtDateTd').css('display', '');
        $('#txnrmYmTd').css('display', 'none');
    }
}

function fnMovePage(pageNo) {
    fnSearch(pageNo);

    selectCount = 0;
    $('#selectCount').text(0);
    $('#pageNoSet').val(pageNo);
}

function fnListCert(searchOptions) {
    showBlockUI('조회중입니다.');

    if (searchOptions === undefined) {
        searchOptions = {};
    }

    if (searchOptions.manager === 'all' || !searchOptions.manager) {
        $('#searchOptManager').css('color', 'black');
    } else {
        $('#searchOptManager').css('color', 'blue');
    }

    ajaxRequest('/gwPost/selectST14', 'POST', searchOptions, (response) => {
        closeBlockUI();

        if (response.errYn == 'Y') {
            alert_error('오류', '' + response.errMsg);
            return;
        }

        $('#certTable tbody').empty();

        let data = response.list;

        //페이징처리
        let page = response.page;
        $('#totalCount').text(page.totalcount);
        setPagination(page);

        if (data == null || data.length === 0) {
            $('#certTable tbody').append(`<tr><td colspan="13">검색결과가 없습니다.</td></tr>`);
            return;
        }

        for (let i = 0; i < data.length; i++) {
            //지방세 여부
            let wetaxYn = false;

            let tr = document.createElement('tr');
            let tr2 = document.createElement('tr');
            let td = document.createElement('td');
            let rtn = '';
            let rtn2 = '';

            if (data[i]['전자납부번호'] != null && data[i]['전자납부번호'] !== '' && data[i]['stmnKndNm'].indexOf('부가가치세') < 0) wetaxYn = true;
            rtn += '<div class="">';
            rtn += '<input onclick="countSelected(this, \'rcatNoCheck\');" type="checkbox" name="rcatNoCheck" id="' + data[i].rcatNo + '" class="checkbox">';
            if (wetaxYn) rtn += '<input type="hidden" class="epayNo" value=' + data[i]['epayNo'] + '>';
            rtn += '<input type="hidden" class="pmtDdt" value=' + data[i].pmtDdt + '>';
            rtn += '<input type="hidden" class="ogntxSbtrPmtTxamt" value=' + data[i].ogntxSbtrPmtTxamt + '>';
            rtn += '<input type="hidden" name="bizNo" value="' + data[i].bizNo + '"/>';
            rtn += '<input type="hidden" name="rcatNo" value="' + data[i].rcatNo + '"/>';
            rtn += '<input type="hidden" name="cvaAplnDtm" value="' + data[i].cvaAplnDtm.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1$2$3') + '"/>';
            rtn += '<input type="hidden" name="taxFirmNo" value="' + data[i].taxFrimNo + '"/>';
            rtn += '<input type="hidden" name="managerId" value="' + data[i].taxFirmManager + '"/>';
            rtn += '<input type="hidden" class="taxCode" name="taxCode" value="' + data[i].taxCd + '"/>';
            rtn += '</div>';
            td.innerHTML = rtn;
            if (wetaxYn) td.setAttribute('rowspan', '2');
            tr.appendChild(td);
            // 홈택스 부서사용자ID
            td = document.createElement('td');
            td.innerHTML = data[i].managerName;
            if (wetaxYn) td.setAttribute('rowspan', '2');
            tr.appendChild(td);
            // 제출자ID
            td = document.createElement('td');
            td.innerHTML = data[i].taxFirmManager;
            if (wetaxYn) td.setAttribute('rowspan', '2');
            tr.appendChild(td);
            // 상호(사업자번호)
            td = document.createElement('td');
            td.innerHTML = data[i].corpName + '<br>' + Formatter.toCorpNo(data[i].bizNo);
            if (wetaxYn) td.setAttribute('rowspan', '2');
            tr.appendChild(td);
            // 과세년월
            td = document.createElement('td');
            td.setAttribute('onMouseOver', 'this.style.color="#2D5BFF"');
            td.setAttribute('onMouseOut', 'this.style.color="#5A5C69"');
            td.innerHTML = Formatter.toGojiYyyymm(data[i].txnrmYm || searchOptions.txnrmYm);
            if (wetaxYn) td.setAttribute('rowspan', '2');
            tr.appendChild(td);
            // 신고일자
            td = document.createElement('td');
            td.innerHTML = Formatter.toDateWithTagBr(data[i].cvaAplnDtm);
            tr.appendChild(td);
            if (wetaxYn) {
                let td2 = document.createElement('td');
                td2.innerHTML = Formatter.toYYYYMMDD(data[i]['신고일자']);
                tr2.appendChild(td2);
            }
            // 세무구분
            td = document.createElement('td');
            td.setAttribute('onMouseOver', 'this.style.color="#2D5BFF"');
            td.setAttribute('onMouseOut', 'this.style.color="#5A5C69"');
            if (data[i].stmnKndNm == null || data[i].stmnKndNm === '') {
                td.innerHTML = '';
            } else {
                td.innerHTML = data[i].stmnKndNm; //;data[i].orgNm;
                if (wetaxYn) {
                    let td2 = document.createElement('td');
                    td2.innerHTML = data[i]['신고세목'];
                    tr2.appendChild(td2);
                }
            }
            tr.appendChild(td);

            // 신고유형
            td = document.createElement('td');
            if (data[i].rtnClDetailNm == null || data[i].rtnClDetailNm === '') {
                td.innerHTML = '';
            } else {
                td.innerHTML = data[i].rtnClDetailNm; //;data[i].orgNm;
                if (wetaxYn) {
                    let td2 = document.createElement('td');
                    td2.innerHTML = '';
                    tr2.appendChild(td2);
                }
            }
            tr.appendChild(td);


            // 납부여부
            td = document.createElement('td');
            let pmtYn = data[i]['납부여부_홈택스'] || '';
            if (pmtYn === 'Y') td.innerHTML = '납부'
            else if (pmtYn === 'N') td.innerHTML = '미납'
            else td.innerHTML = ''
            tr.appendChild(td);

            // 위택스 납부상태 리스트
            let wetaxStatusArr = [];

            // 첨부서류
            td = document.createElement('td');
            td.setAttribute('style', 'text-align:left;');

            if (response[data[i].rcatNo]) {

                let pdfData = response[data[i].rcatNo];

                rtn = '';
                rtn2 = '';
                let etcRtn = '';

                rtn += '<div class="">';

                let wetaxPdfCnt = 0;
                for (let pdfIdx = 0; pdfIdx < pdfData.length; pdfIdx++) {
                    let pdfId = pdfData[pdfIdx]['PDF_ID'];
                    let pdfEnc = pdfData[pdfIdx]['PDF_ID_enc'];
                    let docCd = pdfData[pdfIdx]['문서코드'];
                    let sendYn = pdfData[pdfIdx]['발송여부'];
                    let orgCd = pdfData[pdfIdx]['기관코드'];

                    let fileName = '';

                    if ('hometax' === orgCd) {
                        if (pdfData[pdfIdx]['문서코드'].indexOf('etc') >= 0) {
                            fileName = pdfId.substring(pdfId.indexOf('_') + 1);

                            //기타 신고서파일명
                            if (pdfData[pdfIdx]['문서코드'] == 'etc_retrn') {
                                if (fileName.indexOf('_') >= 0) {
                                    fileName = fileName.substring(fileName.indexOf('_') + 1);
                                }
                            }

                            etcRtn += '<div class="d-flex"><div class="pr-05">' + '<input onclick="removeUploadFile(this)" type="checkbox" name="pdfSelect' + data[i].rcatNo + '" id="' + pdfId + '" class="checkbox" value="' + docCd + '_' + pdfEnc + '" ';
                            if (sendYn === 'Y') etcRtn += 'checked';
                            etcRtn += '></div>' + '<div class=""><a href="/pdfViewer/' + pdfEnc + '" target="_blank">' + fileName + '.' + pdfData[pdfIdx]['확장자'] + '</a></div></div>';
                        } else {
                            fileName = pdfId.substring(pdfId.indexOf('_') + 1);
                            fileName = fileName.substring(fileName.indexOf('_') + 1);
                            rtn += '<div class="d-flex"><div class="pr-05">' + '<input onclick="removeUploadFile(this)" type="checkbox" name="pdfSelect' + data[i].rcatNo + '" id="' + pdfId + '" class="checkbox" value="' + docCd + '_' + pdfEnc + '" ';
                            if (sendYn === 'Y') rtn += 'checked';
                            rtn += '></div>' + '<div class=""><a href="/pdfViewer/' + pdfEnc + '" target="_blank">' + fileName + '.' + pdfData[pdfIdx]['확장자'] + '</a></div></div>';
                        }
                    }

                    // DB에서 doc07 사라지면 관련 코드 정리해도 됨
                    if ('wetax' === orgCd) {
                        if (null !== pdfId) {
                            fileName = pdfId.substring(pdfId.indexOf('_') + 1);
                            if ('doc07' !== docCd) fileName = fileName.substring(fileName.indexOf('_') + 1);

                            rtn2 += '<div class="d-flex"><div class="pr-05">' + '<input onclick="removeUploadFile(this)" type="checkbox" name="pdfSelect' + data[i].rcatNo + '" id="' + pdfId + '" class="checkbox" value="' + docCd + '_' + pdfEnc + '" ';
                            if (sendYn === 'Y') rtn2 += 'checked';
                            rtn2 += '></div>' + '<div class=""><a href="/pdfViewer/' + pdfEnc + '" target="_blank">' + fileName + '.' + pdfData[pdfIdx]['확장자'] + '</a></div></div>';

                            wetaxPdfCnt++;
                        }

                        // 위택스 납부여부
                        wetaxStatusArr.push(pdfData[pdfIdx]['납부상태']);
                    }
                }

                // 위택스 납부여부
                if (wetaxYn) {
                    let td2 = document.createElement('td');
                    if (wetaxStatusArr.length == 0) {
                        if (null !== data[i].epayStatus2) wetaxStatusArr.push(data[i].epayStatus2);
                        if (null !== data[i].epayStatus1) wetaxStatusArr.push(data[i].epayStatus1);
                    }

                    td2.innerHTML = wetaxStatusArr.join('<br/>');
                    tr2.appendChild(td2);
                }

                if (wetaxPdfCnt === 0) {
                    let paymentY = wetaxStatusArr.includes('납부');
                    let paymentN = wetaxStatusArr.includes('미납');

                    if (paymentY && !paymentN) rtn2 = '납부가 완료되어 납부서를 수집할 수 없습니다.';
                    if (paymentN) rtn2 = '납부서 미수집 (신고현황 > 위택스조회 > 납부서수집실행)';
                }

                if (etcRtn !== '') {
                    rtn += '<hr class="mt-05 mb-05">' + etcRtn;
                }

                //홈택스 pdf 수집여부
                let hometaxPdfScrYn = false;
                pdfData.forEach(function (item) {
                    if ('hometax' === item['기관코드'] && (item['문서코드'] == "doc01" || item['문서코드'] == "doc02" || item['문서코드'] == "doc03" || item['문서코드'] == "doc04" || item['문서코드'] == "doc05" || item['문서코드'] == "doc06" || item['문서코드'] == "etc" || item['문서코드'] == "recpt" || item['문서코드'] == "paymt" || item['문서코드'] == "retrn")) {
                        hometaxPdfScrYn = true;
                    }
                });
                if (!hometaxPdfScrYn) {
                    rtn += '<button type="button" id="target_' + data[i].rcatNo + '" class="cm-btn-type positive-btn1-1 medium" onClick="openManagerInfoModal(this);">첨부서류수집</button>';
                    rtn += '<input type="hidden" name="bizNo" value="' + data[i].bizNo + '"/>';
                    rtn += '<input type="hidden" name="rcatNo" value="' + data[i].rcatNo + '"/>';
                    rtn += '<input type="hidden" name="cvaAplnDtm" value="' + data[i].cvaAplnDtm.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1$2$3') + '"/>';
                    rtn += '<input type="hidden" name="taxFirmNo" value="' + data[i].taxFrimNo + '"/>';
                    rtn += '<input type="hidden" name="managerId" value="' + data[i].taxFirmManager + '"/>';
                    rtn += '<input type="hidden" class="taxCode" name="taxCode" value="' + data[i].taxCd + '"/>';
                }

                rtn += '</div>';
                td.innerHTML = rtn;

                let input = document.createElement('input');
                Object.assign(input, {
                    type : 'hidden',
                    id : 'input_' + data[i].rcatNo,
                    value : JSON.stringify(pdfData)
                })
                td.appendChild(input);

            } else {
                td.innerHTML = '';
            }

            if (wetaxYn) {
                let td2 = document.createElement('td');
                td2.setAttribute('style', 'text-align:left;');
                td2.innerHTML = rtn2;
                tr2.appendChild(td2);
            }
            tr.appendChild(td);

            // 발송채널
            td = document.createElement('td');
            td.innerHTML = data[i].sendChannel || '';
            tr.appendChild(td);
            if (wetaxYn) td.setAttribute('rowspan', '2');
            // 발송상태
            td = document.createElement('td');
            if (data[i].rcatNo == null || data[i].rcatNo === '') {
                td.innerHTML = '미수집(미신고)';
            } else {
                if (data[i].sendState === 'Y') {
                    td.innerHTML = '발송완료';
                } else {
                    td.innerHTML = '미발송(신고)';
                }
            }
            tr.appendChild(td);
            if (wetaxYn) td.setAttribute('rowspan', '2');
            // 발송일시
            td = document.createElement('td');
            if (data[i].sendDate == null || data[i].sendDate === '') {
                td.innerHTML = '';
            } else {
                td.innerHTML = data[i].sendDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') + '<br>' + data[i].sendTime.replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2:$3');
            }
            tr.appendChild(td);
            if (wetaxYn) td.setAttribute('rowspan', '2');

            document.querySelector('#certTable tbody').appendChild(tr);
            if (wetaxYn) document.querySelector('#certTable tbody').appendChild(tr2);
        }
    })
}

// 발송하기
async function fnSendPdfWithScraping() {
    sendList = [];
    let rcatNoList = $('input[name="rcatNoCheck"]');
    let notClctdSndList = [];
    for (let i = 0; i < rcatNoList.length; i++) {
        if (rcatNoList[i].checked) {
            let obj = {
                rcatNo: '',
                bizNo: '',
                epayNo: '',
                ogntxSbtrPmtTxamt: '',
                pdfList: [],
                pdfSelect: [],
                pdfInfo: []
            };

            if (rcatNoList[i].getAttribute('id') !== 'null') {
                obj.rcatNo = rcatNoList[i].getAttribute('id');
                obj.epayNo = rcatNoList[i].parentNode.getElementsByClassName('epayNo')[0] ? rcatNoList[i].parentNode.getElementsByClassName('epayNo')[0].value : '';
                obj.bizNo = rcatNoList[i].parentNode.parentNode.parentNode.getElementsByTagName('td')[3].innerHTML.split('<br>')[1].replaceAll('-', '');
                obj.bizNm = rcatNoList[i].parentNode.parentNode.parentNode.getElementsByTagName('td')[3].innerHTML.split('<br>')[0];
                obj.pmtDdt = rcatNoList[i].parentNode.getElementsByClassName('pmtDdt')[0].value;
                obj.ogntxSbtrPmtTxamt = rcatNoList[i].parentNode.getElementsByClassName('ogntxSbtrPmtTxamt')[0].value;
                obj.taxType = rcatNoList[i].parentNode.parentNode.parentNode.getElementsByTagName('td')[6].innerHTML;
                obj.txnrmYm = rcatNoList[i].parentNode.parentNode.parentNode.getElementsByTagName('td')[4].innerHTML;
                obj.taxCode = rcatNoList[i].parentNode.getElementsByClassName('taxCode')[0].value;
                let pdfSelectList = $("input[name='pdfSelect" + obj.rcatNo + "']:checked");
                let pdfList = $("input[name='pdfSelect" + obj.rcatNo + "']");
                let pdfInfoList = JSON.parse(document.getElementById('input_' + obj.rcatNo).getAttribute('value'));
                pdfSelectList.each(function (idx, item) {
                    obj.pdfSelect.push(item.getAttribute('id'));
                });
                pdfList.each(function (idx, item) {
                    obj.pdfList.push(item.getAttribute('id'));
                    for (let pdfInfoListIdx = 0; pdfInfoListIdx < pdfInfoList.length; pdfInfoListIdx++) {
                        if (item.getAttribute('id') === pdfInfoList[pdfInfoListIdx]['PDF_ID']) {
                            obj.pdfInfo.push(pdfInfoList[pdfInfoListIdx]);
                            break;
                        }
                    }
                });
                if (obj.pdfInfo.length === 0) {
                    let bizNo = rcatNoList[i].parentNode.parentNode.parentNode.getElementsByTagName('td')[3].innerHTML.split('<br>')[1].replaceAll('-', '');
                    let inJson = {
                        txnrmYm: '',
                        taxCode: 'all',
                        bizNo: bizNo,
                        rcatNo: rcatNoList[i].getAttribute('id'),
                        sdate: $(rcatNoList[i].parentNode).children('input[name="cvaAplnDtm"]').val(),
                        edate: $(rcatNoList[i].parentNode).children('input[name="cvaAplnDtm"]').val()
                    };

                    notClctdSndList.push(inJson);
                } else {
                    sendList.push(obj);
                }
            } else {
                let bizNo = rcatNoList[i].parentNode.parentNode.parentNode.getElementsByTagName('td')[3].innerHTML.split('<br>')[1].replaceAll('-', '');
                let inJson = {
                    txnrmYm: '',
                    taxCode: 'all',
                    bizNo: bizNo,
                    rcatNo: rcatNoList[i].getAttribute('id'),
                    sdate: $(rcatNoList[i].parentNode).children('input[name="cvaAplnDtm"]').val(),
                    edate: $(rcatNoList[i].parentNode).children('input[name="cvaAplnDtm"]').val()
                };

                notClctdSndList.push(inJson);
            }
        }
    }

    //담당자 정보 확인 후 pdf 수집요청
    openManagerInfoListModal('sendY');
}

function isEmptyObj(obj) {

    if (obj.constructor === Object
        && _.isEmpty(obj)) {
        return true;
    }
    return false;
}

function sendModalExecution() {
    alert_confirm2('발송 진행 확인', '전송하시겠습니까?', '발송진행중입니다.', '발송을 취소합니다.', function () {
        let customerInfo = [];
        let sendList = [];
        let managerInfo = [];
        for (let i = 0; i < modalData.length; i++) {
            let customer = {};
            customer['customerNo'] = modalData[i]['수임고객번호'];
            customer['serviceType'] = modalData[i]['과세유형'];
            customer['corpNo'] = modalData[i]['사업자번호'];
            customer['corpName'] = modalData[i]['상호'];
            customer['repName'] = modalData[i]['대표자명'];
            customer['taxFirmManager'] = modalData[i]['세무담당자'];
            customer['customerPhoneNo'] = modalData[i]['휴대폰'];
            customer['customerEmail'] = modalData[i]['이메일'];
            customer['phoneReception'] = modalData[i]['휴대폰수신여부'];
            customer['emailReception'] = modalData[i]['이메일수신여부'];
            customer['lmsReception'] = modalData[i]['LMS수신여부'];
            customer['withholdUsage'] = modalData[i]['원천세여부'];
            customer['vatUsage'] = modalData[i]['부가세여부'];
            customer['managerName'] = modalData[i]['담당자명'];
            customer['userId'] = modalData[i][''];
            customer['taxFirmNo'] = modalData[i]['세무사무소번호'];
            customer['modDate'] = modalData[i]['수정일자'];
            customer['modTime'] = modalData[i]['수정시간'];
            customer['taxCode'] = modalData[i]['taxCode'];
            customerInfo.push(customer);

            let sendInfo = {
                rcatNo: modalData[i]['rcatNo'],
                epayNo: modalData[i]['epayNo'],
                taxFirmNo: modalData[i]['세무사무소번호'],
                customerNo: modalData[i]['수임고객번호'],
                bizNo: modalData[i]['사업자번호'],
                bizNm: modalData[i]['상호'],
                pdfSelect: modalData[i]['pdfSelect'],
                taxCode: modalData[i]['taxCode']
            };

            sendList.push(sendInfo);

            let manager = {};
            manager['managerPhoneNo'] = modalData[i]['담당자대표번호'];
            manager['managerMail'] = modalData[i]['담당자이메일'];
            manager['managerId'] = modalData[i]['담당자아이디'];
            managerInfo.push(manager);
        }

        let sendOptions = {
            sendList: JSON.stringify(sendList),
            managerInfo: JSON.stringify(managerInfo),
            taxType: 'hometax',
            customerInfo: JSON.stringify(customerInfo),
            isIndiv: 'N',
            isCheck: 'Y',
        };


        sendTaxReturnWithCustomerInfo(sendOptions).then((resolve) => {
            if (resolve.list != null) {
                let list = resolve.list;
                let message = '';
                for (let i = 0; i < list.length; i++) {
                    message += list[i]['name'] + ' - ' + list[i]['contact'] + '<br>';
                }
                alert_confirm2('중복 연락처정보가 있습니다.', message + '<br>이대로 전송하시겠습니까?', '발송진행중입니다.', '발송을 취소합니다.', function () {
                    sendOptions['isCheck'] = 'N';
                    sendTaxReturnWithCustomerInfo(sendOptions);
                })
            }
        })
    });
}

function sendTaxReturnWithCustomerInfo(sendOptions) {
    return new Promise(function (resolve) {
        showBlockUI('발송 중입니다. 잠시만 기다려주세요.');

        ajaxRequest('/send/sendTaxReturnWithCustomerInfo', 'POST', sendOptions, (response) => {
            $.unblockUI();

            if ('Y' === sendOptions.isCheck && response.list) {
                resolve(response);
                return;
            }

            if (response['resultList'] != null) {
                let errYn = false;
                let errMsg = '';
                let ppurio = false;
                response['resultList'].forEach((val, key) => {
                    if ('{}' !== JSON.stringify(val)) {
                        if ('Y' != val['sendStatus']) {
                            errYn = true;
                            errMsg += val['sendType'] + ' - ' + val['contactInfo'] + '<br/>';
                        }
                        if (val['ppurio'] && 'Y' == val['ppurio']) {
                            ppurio = true;
                        }
                    }
                });
                if (errYn) {
                    alert_error('오류', errMsg);
                } else {
                    if (ppurio) {
                        alert_success('발송요청완료', '발송요청이 완료되었습니다.<br/>발송결과는 발송내역에서 확인해주시기 바랍니다.<br/><br/>* 발송내역에서 열람여부 = 미열람인 건은<br/>수임처의 수신여부를 확인하시기 바랍니다.');
                    } else {
                        alert_success('완료', '납부서 발송 완료');
                    }
                }
            } else {
                alert_error('오류', '납부서발송에 실패하였습니다.');
            }
            modalCancel();
        })
    })
}


//수임고객정보확인
function fnCustomerInfoConfirm(sendList) {
    return new Promise(function (resolve, reject) {
        let inJson = { sendList: sendList };

        ajaxRequest('/customer/customerInfoForSend', 'POST', inJson, (response) => {
            let list = response.list;
            if (list == null || list.length === 0 || list[0] === null) {
                resolve(false);
            } else {
                modalData = [];

                let j = 0
                for (; j < sendList.length; j++) {
                    for (let i = 0; i < list.length; i++) {
                        if (list[i]['사업자번호'] === sendList[j].bizNo) {
                            let obj = Object.assign({}, list[i]);
                            Object.assign(obj, sendList[j]);
                            modalData.push(obj);
                            break;
                        }
                    }
                }
                sendModalSet(0);
                $('#sendModal').modal();
                resolve(false);
            }
        })
    });
}

//발송하기모달
function sendModalSet(index) {
    sendModalSetCommon(index, modalData);

    let data = modalData[index];

    $('#sendModalDocType').html(data['taxType']);
    $('#uploadPopup #rcatNo').val(data['rcatNo']);

    //법인일 때만 replace
    let bizNo = Formatter.toCorpNo(data['사업자번호']);
    $('#sendModalCorpName').html(data['상호'] + (data['상호'] === '' ? bizNo : ' (' + bizNo + ')'));

    if (data['taxType'].includes('부가가치세')) {
        let txnrmYmTemp = data['txnrmYm'].split(' ')[0];
        if (data['txnrmYm'].includes('01월')) {
            txnrmYmTemp += ' 1기 '
        } else if (data['txnrmYm'].includes('07월')) {
            txnrmYmTemp += ' 2기 '
        }
        txnrmYmTemp += data['taxType'].split(' ')[1];
        $('#sendModalTxnrmYm').html(txnrmYmTemp);
    } else {
        $('#sendModalTxnrmYm').html(data['txnrmYm']);
    }

    let fileList = $('#sendModalFiles');
    fileList.empty();

    let doc07Check = false;
    for (let i = 0; i < data['pdfInfo'].length; i++) {
        let pdfId = data['pdfInfo'][i]['PDF_ID'].toString();
        let fileName = pdfId.substring(pdfId.indexOf('_') + 1);

        if (data['pdfInfo'][i]['문서코드'].indexOf('etc') >= 0) {
            //기타 신고서파일명
            if (data['pdfInfo'][i]['문서코드'] == 'etc_retrn') fileName = fileName.substring(fileName.indexOf('_') + 1);

        } else if (data['pdfInfo'][i]['문서코드'] === 'doc07') {
        } else {
            fileName = fileName.substring(fileName.indexOf('_') + 1);
        }

        let file = $('<lable>');
        if (data['pdfSelect'].includes(pdfId))
            file.html('<input name="pdfInfoCheck" type="checkbox" onclick="removeUploadFileModal(this);" checked/><a href="/pdfViewer/' + data['pdfInfo'][i]['PDF_ID_enc'] + '" target="_blank" data-pdfid="' + pdfId + '">   ' + fileName + '</a>');
        else
            file.html('<input name="pdfInfoCheck" type="checkbox" onclick="removeUploadFileModal(this);" /><a href="/pdfViewer/' + data['pdfInfo'][i]['PDF_ID_enc'] + '" target="_blank" data-pdfid="' + pdfId + '">   ' + fileName + '</a>');
        fileList.append(file);

        // 지방세
        if (data['pdfInfo'][i]['기관코드'] === 'wetax') {
            doc07Check = true;
        }
    }

    // 부가세가 아니면서 지방세가 없을경우 보여주기
    if ($('#searchOptTaxCode').val() == '41' || doc07Check) {
        $('#wetaxFileButton').addClass('d-none');
    } else {
        $('#wetaxFileButton').removeClass('d-none');
    }

    updateMessage();
}

function updateFileList(uploadList) {
    let fileList = $('#sendModalFiles');
    let idx = $('#sendModalIdx').val();
    for (let i = 0; i < uploadList.length; i++) {
        let obj = {};
        obj['수정일자'] = uploadList[i]['modDate'];
        obj['문서코드'] = uploadList[i]['docCode'];
        obj['수정시간'] = uploadList[i]['modTime'];
        obj['홈택스_접수번호'] = uploadList[i]['hometaxRecNo'];
        obj['위택스_전자납부번호'] = uploadList[i]['wetaxEpayNo'] || '';
        obj['PDF_ID'] = uploadList[i]['pdfId'];
        obj['PDF_ID_enc'] = uploadList[i]['pdfIdEnc'];
        obj['PDF경로'] = uploadList[i]['pdfPath'];
        obj['확장자'] = uploadList[i]['suffix'];
        modalData[idx]['pdfInfo'].push(obj);
        modalData[idx]['pdfSelect'].push(uploadList[i]['pdfId']);
    }
    let data = modalData[idx];
    fileList.empty();

    for (let i = 0; i < data['pdfInfo'].length; i++) {
        let pdfId = data['pdfInfo'][i]['PDF_ID'];
        let fileName = pdfId.substring(pdfId.indexOf('_') + 1);
        if (fileName.indexOf('원천') >= 0 || fileName.indexOf('부가') >= 0) {
            fileName = fileName.substring(fileName.indexOf('_') + 1);
        }

        let input = $(`<input name="pdfInfoCheck" type="checkbox" onclick="removeUploadFileModal(this);" />`);
        let a = $(`<a href="/pdfViewer/${data['pdfInfo'][i]['PDF_ID_enc']}" target="_blank" data-pdfid="${pdfId}"> ${fileName}</a>`);

        if (data['pdfSelect'].includes(pdfId)) input.prop('checked', true);
        let file = $('<lable>').append(input).append(a);

        fileList.append(file);
    }
}

// 발송하기 모달 닫기
function modalCancel() {
    fnMovePage($('#pageNoSet').val());
    $('#sendModal').modal('hide');
}

function sendModalCancel() {
    fnMovePage($('#pageNoSet').val());
    $('#collectPdfSuccess').modal('hide');
}

function removeUploadFile(node) {
    let inJson = {
        pdfId: node.id,
        checked: node.checked,
    };

    ajaxRequest('/gwPost/cancelFile', 'POST', inJson, (response) => {});
}

function removeUploadFileModal(node) {
    let li = node.parentNode;
    let pdfId = li.children[1].getAttribute("data-pdfid");
    let inJson = {
        pdfId: pdfId,
        checked: node.checked,
    };

    ajaxRequest('/gwPost/cancelFile', 'POST', inJson, (response) => {
        let idx = $('#sendModalIdx').val();
        for (let i = 0; i < modalData[idx]['pdfSelect'].length; i++) {
            if (modalData[idx]['pdfSelect'][i] === pdfId) {
                if (i > -1) {
                    modalData[idx]['pdfSelect'].splice(i, 1);
                }
                break;
            }
        }
        updateMessage();
    });
}

function updateMessage() {
    $('#sendModalMessageArea').empty();

    let idx = $('#sendModalIdx').val();
    let data = modalData[idx];

    let inJson = {
        rcatNo: data.rcatNo,
        epayNo: data.epayNo,
        customerNo: data['수임고객번호'],
        taxCode: data.taxCode,
        request: 'getSendMessage',
        bizNo: data.bizNo
    };

    ajaxRequest('/gwPost/getSendMessage', 'POST', inJson, (response) => {
        let url = '/pdfListView?rcatNoHometax=' + data.rcatNo + '&rcatNoWetax=' + data.epayNo;
        let message = response.message.replaceAll('<start>', '').replaceAll('<end>', '<br>').replaceAll('<wrap>', '<br>');
        let taxFirmPhone = '';
        let taxFrimEmail = '';
        if (data['담당자대표번호']) {
            taxFirmPhone = data['담당자대표번호'];
        } else {
            taxFirmPhone = response.taxFirmPhone;
        }
        if (data['담당자이메일']) {
            taxFrimEmail = data['담당자이메일'];
        } else {
            taxFrimEmail = response.taxFrimEmail;
        }

        let inputPhone = '<input type="text" class="form-control medium" id="sendModalManagerPhoneNo" value="' + taxFirmPhone + '"/>';
        let inputMail = '<input type="text" class="form-control medium" id="sendModalManagerMail"  value="' + taxFrimEmail + '"/>';
        let managerId = '<input type="hidden" id="sendModalManagerId" value="' + response.managerId + '" />';
        message += inputPhone;
        message += inputMail + managerId;
        $('#sendModalMessageArea').html(message);
        $('#sendModalButton').attr('onclick', `window.open('${url}')`);
    })
}

function openPopup(url) {
    var _width = '500';
    var _height = '700';

    // 팝업을 가운데 위치시키기 위해 아래와 같이 값 구하기
    var _left = Math.ceil((window.screen.width - _width) / 2);
    var _top = Math.ceil((window.screen.height - _height) / 2);

    window.open(url, 'popup-test', 'width=' + _width + ', height=' + _height + ', left=' + _left + ', top=' + _top);
}

//첨부서류 다운로드
function downloadAllFile(selectType) {
    let checkYn = false;
    let rcatNoList = $('input[name="rcatNoCheck"]');
    let rcatNoLength = $('input[name="rcatNoCheck"]:checked').length;
    let list = [];
    let arr = [];
    let stmnKndNm = '';
    let typeStr = '';
    if (selectType === 'all')
        arr = ['doc01', 'doc02', 'doc03', 'doc04', 'doc05', 'doc06', 'doc07', 'recpt', 'paymt', 'retrn', 'etc'];
    if (selectType === 'recpt') {
        arr = ['doc01', 'doc04', 'recpt'];
        typeStr = '접수증';
    }
    if (selectType === 'paymt') {
        arr = ['doc02', 'doc05', 'doc07', 'paymt'];
        typeStr = '납부서';
    }
    if (selectType === 'retrn') {
        arr = ['doc03', 'doc06', 'retrn', 'etc_retrn']
        typeStr = '신고서';
    }

    if (rcatNoLength === 0) {
        alert_error("대상 선택", "다운로드할 업체를 선택해주세요.");
        return;
    }

    for (let i = 0; i < rcatNoList.length; i++) {
        if (rcatNoList[i].checked) {
            let downloadList = {'name': '', 'list': []};

            let obj = [];
            let rcatNo = rcatNoList[i].getAttribute('id');
            let pdfSelectList = $("input[name='pdfSelect" + rcatNo + "']:checked");
            if (selectType !== 'all')
                pdfSelectList = $("input[name='pdfSelect" + rcatNo + "']");
            let pdfInfoList = JSON.parse($('#input_' + rcatNo).val());
            pdfSelectList.each(function (idx, item) {
                for (let pdfInfoListIdx = 0; pdfInfoListIdx < pdfInfoList.length; pdfInfoListIdx++) {
                    if (item.getAttribute('id') === pdfInfoList[pdfInfoListIdx]['PDF_ID'] && arr.includes(pdfInfoList[pdfInfoListIdx]['문서코드'])) {
                        obj.push(pdfInfoList[pdfInfoListIdx]);
                        checkYn = true;
                        break;
                    }
                }
            });
            let bizNo = rcatNoList[i].parentNode.parentNode.parentNode.getElementsByTagName('td')[3].innerHTML.split('<br>')[1].replaceAll('-', '');
            let bizNm = rcatNoList[i].parentNode.parentNode.parentNode.getElementsByTagName('td')[3].innerHTML.split('<br>')[0].replaceAll('.', '');
            let txnrmYm = rcatNoList[i].parentNode.parentNode.parentNode.getElementsByTagName('td')[4].innerHTML.replaceAll(' ', '');
            stmnKndNm = rcatNoList[i].parentNode.parentNode.parentNode.getElementsByTagName('td')[6].innerHTML.replaceAll(' ', ''); // 신고서종류
            let rtnClDetailNm = rcatNoList[i].parentNode.parentNode.parentNode.getElementsByTagName('td')[7].innerHTML.replaceAll(' ', ''); // 신고유형
            let date = Util.getDateYYYMMDD();
            let name = bizNm + '_' + bizNo + '_' + txnrmYm + '_' + rtnClDetailNm;

            downloadList['name'] = name;
            downloadList['bizNm'] = bizNm;
            downloadList['bizNo'] = bizNo;
            downloadList['txnrmYm'] = txnrmYm;
            downloadList['rtnClDetailNm'] = rtnClDetailNm;
            downloadList['list'] = obj;

            list.push(downloadList);
        }
    }

    if (!checkYn) { // 다운 받을 파일 없을 시 리턴 (기존에는 다운 받고 알림창)
        alert_error("수집 확인", "수집된 서류가 없습니다.");
        return false;
    }

    if (list.length > 0) {

        let url = '/file/downloadZip/' + selectType;

        $.ajax({
            url: url,
            data : JSON.stringify(list), // stringify 확인 필요
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            xhrFields: {
                responseType: 'blob'
            },
            success: function(data) {
                let today = new Date();
                let date = today.getFullYear() + addZero(today.getMonth() + 1, 2) + addZero(today.getDate(), 2)
                    + addZero(today.getHours(), 2) + addZero(today.getMinutes(), 2) + addZero(today.getSeconds(), 2)

                let link = document.createElement('a');
                if (selectType === 'all') {
                    link.download = date + "_첨부파일리스트 (총 " + list.length + " 업체)";
                } else {
                    link.download = typeStr + "_" + stmnKndNm + "_" + date; // 다운로드 파일 이름
                }
                link.href = URL.createObjectURL(data);
                link.click();
                delete link;
            },
            error: function(xhr, status, error) {
                console.error("Error during file download:", status, error);
                errorCodeHandling(JSON.stringify(xhr));
            }
        });
    }
}

//단건 수집 요청 시 담당자 비밀번호 여부 확인
function openManagerInfoModal(element) {

    //수집된 pdf 파일이 있고 체크박스 체크 되어 있을 때, 해당 정보 sendList 에 세팅
    sendList = [];

    let e = $(element);
    let taxFirmNo = e.parent().find('[name="taxFirmNo"]').val();
    let managerId = e.parent().find('[name="managerId"]').val();
    let rcatNo = e.parent().find('[name="rcatNo"]').val();

    let managerName = managerId;
    let managerNo = taxFirmNo + '_' + managerId;
    let inJson = {managerNo: managerNo};

    let pdfInfoList = JSON.parse($('#input_' + rcatNo).val());
    if (pdfInfoList.length !== 0) {

        let rcatNoElement = document.getElementById(rcatNo);

        let obj = {rcatNo: '', bizNo: '', epayNo: '', ogntxSbtrPmtTxamt: '', pdfList: [], pdfSelect: [], pdfInfo: []};

        obj.rcatNo = rcatNo;
        obj.epayNo = rcatNoElement.parentNode.getElementsByClassName('epayNo')[0] ? rcatNoElement.parentNode.getElementsByClassName('epayNo')[0].value : '';
        obj.bizNo = rcatNoElement.parentNode.parentNode.parentNode.getElementsByTagName('td')[3].innerHTML.split('<br>')[1].replaceAll('-', '');
        obj.bizNm = rcatNoElement.parentNode.parentNode.parentNode.getElementsByTagName('td')[2].innerHTML.split('<br>')[0];
        obj.pmtDdt = rcatNoElement.parentNode.getElementsByClassName('pmtDdt')[0].value3
        obj.ogntxSbtrPmtTxamt = rcatNoElement.parentNode.getElementsByClassName('ogntxSbtrPmtTxamt')[0].value;
        obj.taxType = rcatNoElement.parentNode.parentNode.parentNode.getElementsByTagName('td')[6].innerHTML;
        obj.txnrmYm = rcatNoElement.parentNode.parentNode.parentNode.getElementsByTagName('td')[4].innerHTML;
        obj.taxCode = rcatNoElement.parentNode.getElementsByClassName('taxCode')[0].value;

        let pdfSelectList = $("input[name='pdfSelect" + obj.rcatNo + "']:checked");
        let pdfList = $("input[name='pdfSelect" + obj.rcatNo + "']");

        pdfSelectList.each(function (idx, item) {
            obj.pdfSelect.push(item.getAttribute('id'));
            for (let pdfInfoListIdx = 0; pdfInfoListIdx < pdfInfoList.length; pdfInfoListIdx++) {
                if (item.getAttribute('id') === pdfInfoList[pdfInfoListIdx]['PDF_ID']) {
                    obj.pdfInfo.push(pdfInfoList[pdfInfoListIdx]);
                    break;
                }
            }
        });
        pdfList.each(function (idx, item) {
            obj.pdfList.push(item.getAttribute('id'));
        });

        if (obj.pdfInfo.length !== 0) sendList.push(obj);
    }

    ajaxRequest('/gwPost/checkManagerPw', 'POST', inJson, (response) => {
        //담당자 비밀번호 여부 확인 후 없으면 담당자 정보 모달 창 띄우기
        if (response.managerPwYn === 'N') {
            $('#managerNo').val(managerNo);
            $('#managerLoginInfoID').val(managerName);
            $('#selectScrapingTarget').val('target_' + rcatNo);
            $('#managerLoginInfoPw').val('');

            $('#managerIdTag').text('담당자 아이디');
            $('#updateLoginInfoBtn').css('display', 'block');
            $('#updateLoginInfoListBtn').css('display', 'none');

            $('#managerLoginInfo').modal();

        } else {

            let obj = makeScrapingJson(e);

            let list = [];
            list.push(obj);

            //담당자 비밀번호 있으면 pdf 수집요청
            hometaxPdfScrapingBySelectModal('sync', list)
        }
    })
}

//단건 수집 요청 담당자 정보 입력 모달, 담당자 비밀번호 update
function updateManagerLoginInfo() {

    let managerNo = $("#managerNo").val();
    let managerLoginInfoID = $("#managerLoginInfoID").val();
    let managerLoginInfoPw = $("#managerLoginInfoPw").val();
    let selectScrapingTarget = $('#selectScrapingTarget').val();

    if (managerLoginInfoPw == null || managerLoginInfoPw == '') {
        //비밀번호 입력 안 할경우 DB 저장 없이 수집 실행
        let e = $('#' + selectScrapingTarget);
        let obj = makeScrapingJson(e);

        let list = [];
        list.push(obj);

        $('#managerLoginInfo').modal('hide');
        hometaxPdfScrapingBySelectModal('sync', list)

        return;
    }

    let inJson = {
        "managerId": managerLoginInfoID,
        "managerPw": managerLoginInfoPw,
        "managerNo": managerNo,
        "pwYn": "N"
    }

    ajaxRequest('/setManager', 'POST', inJson, (response) => {
        let message = response['errYn'];
        if (message === "N") {
            alert_basic_after("완료", "변경되었습니다.", function () {
                let e = $('#' + selectScrapingTarget);
                let obj = makeScrapingJson(e);

                let list = [];
                list.push(obj);

                $('#managerLoginInfo').modal('hide');

                //pdf 수집요청
                hometaxPdfScrapingBySelectModal('sync', list)
            });
        } else {
            alert_error_after('시스템 오류', response['errMsg'], function () {
            });
        }
    })
}

function makeScrapingJson(e) {
    //bizNo 변수명 확인
    return {
        "bizNo": e.parent().find('[name="bizNo"]').val()
        , "rcatNo": e.parent().find('[name="rcatNo"]').val()
        , "cvaAplnDtm": e.parent().find('[name="cvaAplnDtm"]').val()
        , "taxFirmNo": e.parent().find('[name="taxFirmNo"]').val()
        , "managerId": e.parent().find('[name="managerId"]').val()
        , "taxCode": e.parent().find('[name="taxCode"]').val()
        , "jsPdfYn": $("#jsPdfYn").prop("checked") ? "Y" : "N"
        , "sgPdfYn": $("#sgPdfYn").prop("checked") ? "Y" : "N"
        , "nbPdfYn": $("#nbPdfYn").prop("checked") ? "Y" : "N"
    }
}

//단건 pdf 수집 스크래핑 요청
function hometaxPdfScrapingSync(list) {
    for (let i = 0; i < list.length; i++) {
        list[i].jsPdfYn = $("#jsPdfYn").prop("checked") ? "Y" : "N"
        list[i].sgPdfYn = $("#sgPdfYn").prop("checked") ? "Y" : "N"
        list[i].nbPdfYn = $("#nbPdfYn").prop("checked") ? "Y" : "N"
    }

    $('#loading').modal();
    $('#loading').on('shown.bs.modal', function () {
        ajaxRequest('/gwPost/taxReturnSearchPdf', 'POST',  {"rcatNoList": JSON.stringify(list)}, (response) => {

            if (response.errYn === 'Y') {
                $('#loading').modal('hide');
                alert_error('시스템 오류', '' + response.errMsg);
            } else if (response.errYn === 'S') {
                $('#loading').modal('hide');
                alert_basic('수집진행중', '' + response.errMsg);
            } else if (response.errYn === 'N') {

                let obj = {
                    "notClctdSndList": JSON.stringify(list),
                    "uuidList": JSON.stringify(response.uuidList)
                };

                //수집 상태 체크 및 수집 결과(sendList) set
                checkSingleTaxReturnSearchPdfByUuidList(obj);
            }
        }, (xhr, status, error) => {
            $('#loading').modal('hide');
        })
    })
}

//첨부서류 수집하기(단건) 버튼 > pdf 수집 확인 및 발송하기
function checkSingleTaxReturnSearchPdfByUuidList(obj) {

    let checkInterval = setInterval(function () {
        console.log("수집 check");

        ajaxRequest('/gwPost/checkTaxReturnSearchPdfByUuidList', 'POST',  obj, (response) => {
            console.log(response.finished);

            if (response.finished) {

                clearInterval(checkInterval);
                $('#loading').modal('hide');

                const scrapingList = response.list;
                if (scrapingList.length > 0) {

                    $('#collectPdfSuccess').modal();
                    $('#SendSinglePdfBtn').off('click').on('click', async function () {

                        $('#collectPdfSuccess').modal('hide');
                        let addList = [];

                        if (sendList.length === 0) {
                            sendList = sendList.concat(scrapingList);
                        } else {
                            scrapingList.forEach(function (scrapingData) {
                                sendList.forEach(function (sendListData) {
                                    if (scrapingData.rcatNo === sendListData.rcatNo) {
                                        // console.log('일치');
                                        sendListData.pdfInfo = sendListData.pdfInfo.concat(scrapingData.pdfInfo);
                                        sendListData.pdfList = sendListData.pdfList.concat(scrapingData.pdfList);
                                        sendListData.pdfSelect = sendListData.pdfSelect.concat(scrapingData.pdfSelect);
                                    } else {
                                        // console.log('불일치');
                                        addList.push(scrapingData);
                                    }
                                })
                            })
                            sendList = sendList.concat(addList);
                        }

                        await checkSendPdfList();
                        return false;

                    })

                } else {
                    alert_basic('수집 결과', '내역이 존재하지 않습니다.');
                }
            }
        }, () => {
            $('#loading').modal('hide');
            clearInterval(checkInterval);
        })

    }, 2000);

}

let managerList = null;
let index = 0;

//체크박스 수집 요청 담당자 정보 여부 확인
function openManagerInfoListModal(sendYn) {
    let rcatNoCheckList = $('input[name="rcatNoCheck"]');
    let checkedManagerList = [];

    for (let i = 0; i < rcatNoCheckList.length; i++) {
        if (rcatNoCheckList[i].checked) {
            checkedManagerList.push($(rcatNoCheckList[i].parentElement).find('[name="managerId"]').val());
        }
    }

    if (checkedManagerList.length == 0) {
        alert_basic("신고내역 선택", "PDF파일을 수집할 신고내역을 선택해주세요.");
        return;
    }

    let managerInjson = {"checkedManagerList": Array.from(new Set(checkedManagerList))};

    ajaxRequest('/gwPost/managerListWithoutPw', 'POST',  managerInjson, (response) => {
        if (response.result === 'success') {
            if (response.managers) {

                index = 0;
                let count = index + 1;
                managerList = response.managers;

                $('#managerNo').val(managerList[index]['managerNo']);
                $('#managerLoginInfoID').val(managerList[index]['managerName']);
                $('#selectScrapingTarget').val('');
                $("#managerLoginInfoPw").val('');
                $('#managerIdTag').text('담당자 아이디 (' + count + '/' + managerList.length + ')');

                $('#updateLoginInfoBtn').css('display', 'none');
                $('#updateLoginInfoListBtn').attr('onclick', 'updateManagerLoginInfoList(\'' + sendYn + '\'); return false;');
                $('#updateLoginInfoListBtn').css('display', 'block');

                $('#managerLoginInfo').modal();
            } else {

                if (sendYn === 'sendY') sendHometaxPdfScrapingBySelectedList(sendYn);
                else hometaxPdfScrapingBySelectModal(sendYn, '');
            }
        } else {
            alert_error('시스템 오류', '세무담당자 목록을 불러오는 데 실패했습니다. 담당자에게 문의하세요');
        }
    })
}

//체크박스 담당자 정보 입력 모달, 담당자 정보 update
function updateManagerLoginInfoList(sendYn) {

    let managerNo = $("#managerNo").val();
    let managerLoginInfoID = $("#managerLoginInfoID").val();
    let managerLoginInfoPw = $("#managerLoginInfoPw").val();

    if (managerLoginInfoPw === null || managerLoginInfoPw === '') {
        //비밀번호 입력 안 할경우 DB 저장 없이 수집 실행
        managerInfoCheck(sendYn);
        return;
    }

    let  inJson = {
        "managerId": managerLoginInfoID,
        "managerPw": managerLoginInfoPw,
        "managerNo": managerNo,
        "pwYn": "N"
    };

    ajaxRequest('/setManager', 'POST',  inJson, (response) => {
        let message = response['errYn'];
        if (message === "N") {
            alert_basic_after("완료", "변경되었습니다.", function () {
                managerInfoCheck(sendYn);
            });
        } else {
            alert_error_after('시스템 오류', response['errMsg'], function () {
            });
        }

    })
}

function managerInfoCheck(sendYn) {
    index++;
    let count = index + 1;

    //입력받을 관리자 비밀번호가 없을 경우 pdf 수집 진행
    if (managerList.length === index) {
        $('#managerLoginInfo').modal('hide');

        if (sendYn === 'sendY') sendHometaxPdfScrapingBySelectedList(sendYn);
        else hometaxPdfScrapingBySelectModal(sendYn, '');

        return;
    }
    $('#managerNo').val(managerList[index]['managerNo']);
    $('#managerLoginInfoID').val(managerList[index]['managerName']);
    $("#managerLoginInfoPw").val('');
    $('#managerIdTag').text('담당자 아이디 (' + count + '/' + managerList.length + ')');
    $('#updateLoginInfoBtn').css('display', 'none');
    $('#updateLoginInfoListBtn').attr('onclick', 'updateManagerLoginInfoList(\'' + sendYn + '\'); return false;');
    $('#updateLoginInfoListBtn').css('display', 'block');
}

//체크박스 수집 요청(수집하기 버튼)
function hometaxPdfScrapingBySelectedList() {
    let rcatNoCheckList = $('input[name="rcatNoCheck"]:checked');
    let rcatNoList = [];

    rcatNoCheckList.each((i, e) => {
        let obj= makeScrapingJson($(e));
        rcatNoList.push(obj);
    });

    let inJson = {"rcatNoList": JSON.stringify(rcatNoList)};

    ajaxRequest('/gwPost/taxReturnSearchPdf', 'POST',  inJson, (response) => {
        if (response.errYn === 'Y') {
            alert_error('시스템 오류', '' + response.errMsg);
        } else if (response.errYn === 'S') {
            alert_basic('수집진행중', '' + response.errMsg);
        } else if (response.errYn === 'N') {
            alert_basic('수집요청완료', '수집요청이 완료되었습니다.');
        }
    })
}

//체크박스 미수집 건 수집 요청 및 발송(발송하기 버튼)
async function sendHometaxPdfScrapingBySelectedList(sendYn) {

    let rcatNoList = $('input[name="rcatNoCheck"]:checked');
    let notClctdSndList = [];

    rcatNoList.each((i, e) => {
        if ('null' !== e.id) {
            let rcatNo = e.id;
            let pdfInfoList = JSON.parse($('#input_' + rcatNo).val());
            let targetRcatNo = $('#target_' + rcatNo);

            if (pdfInfoList.length === 0 || targetRcatNo.length > 0) {
                let obj = makeScrapingJson($(e));
                notClctdSndList.push(obj);
            }
        }
    })

    if (notClctdSndList.length > 0) {
        hometaxPdfScrapingBySelectModal(sendYn, notClctdSndList);
    } else {
        await checkSendPdfList();
    }
}

function sendHometaxPdfScrapingBySelectedListNext(list) {
    for (let i = 0; i < list.length; i++) {
        list[i].jsPdfYn = $("#jsPdfYn").prop("checked") ? "Y" : "N"
        list[i].sgPdfYn = $("#sgPdfYn").prop("checked") ? "Y" : "N"
        list[i].nbPdfYn = $("#nbPdfYn").prop("checked") ? "Y" : "N"
    }

    let inJson = {"rcatNoList": JSON.stringify(list)};

    ajaxRequest('/gwPost/taxReturnSearchPdf', 'POST',  inJson, (response) => {
        if (response.errYn === 'Y') {
            alert_error('시스템 오류', '' + response.errMsg);
        } else if (response.errYn === 'S') {
            alert_basic('수집진행중', '' + response.errMsg);
        } else if (response.errYn === 'N') {
            alert_basic_after('수집실행', '납부서발송을 위해 미수집된<br/>첨부서류를 홈택스로부터 수집합니다.<br/>잠시만 기다려주세요 ^^', function () {
               $('#loading').modal();

                let obj = {
                    "notClctdSndList": JSON.stringify(list),
                    "uuidList": JSON.stringify(response.uuidList)
                };

                checkTaxReturnSearchPdfByUuidList(obj);
            });
        }
    })
}

//수집 완료 상태 체크, 수집 완료 시 수집 pdf 정보(list) set
function checkTaxReturnSearchPdfByUuidList(obj) {

    let checkInterval = setInterval(function () {
        console.log("수집 check");

        ajaxRequest('/gwPost/checkTaxReturnSearchPdfByUuidList', 'POST',  obj, async function(response) {
            console.log(response.finished);

            if (response.finished) {

                clearInterval(checkInterval);
                $('#loading').modal('hide');

                if (response.list.length > 0) {

                    let addList = [];

                    if (sendList.length === 0) {
                        sendList = sendList.concat(response.list);
                    } else {

                        response.list.forEach(function (scrapingData) {

                            let containsCount = 0;

                            sendList.forEach(function (sendListData) {
                                if (scrapingData.rcatNo === sendListData.rcatNo) {
                                    // console.log('일치');
                                    sendListData.pdfInfo = sendListData.pdfInfo.concat(scrapingData.pdfInfo);
                                    sendListData.pdfList = sendListData.pdfList.concat(scrapingData.pdfList);
                                    sendListData.pdfSelect = sendListData.pdfSelect.concat(scrapingData.pdfSelect);
                                    containsCount++;
                                }
                            })

                            if (containsCount === 0) {
                                // console.log('일치 안함 리스트 추가');
                                addList.push(scrapingData);
                            }

                        })
                        sendList = sendList.concat(addList);
                    }

                    await checkSendPdfList();
                    return false;

                } else {
                    alert_basic('수집 결과', '내역이 존재하지 않습니다.');
                }
            }
        }, () => {
            $('#loading').modal('hide');
            clearInterval(checkInterval);
        })

    }, 2000);

}

async function checkSendPdfList() {

    if (sendList.length === 0) {
        alert_error('오류', '전송할 신고내역이 없습니다.');
        return;
    }

    let notSendList = fnConfirmPdf(sendList);
    if (notSendList.length !== 0) {
        let notSend = '';
        for (let i = 0; i < notSendList.length; i++) {
            notSend += notSendList[i];
            if (notSendList.length - 1 !== i) {
                notSend += ', ';
            }
        }
        alert_basic('', '<b style="font-weight: bold; font-size: 19px;">납부서 미선택, 납부기한 경과 여부를 확인 바랍니다.</b><br><br>' + '수임고객 : <b>' + notSend + '</b>');
    }
    if (sendList.length === 0) {
        alert_basic('입력정보 확인', '전송할 신고내역을 선택해주세요.');
        return;
    }

    //수임고객정보확인
    await fnCustomerInfoConfirm(sendList);
}

// 납부서유무 검증
function fnConfirmPdf(sendList) {
    let result = [];
    let today = Util.getDateYYYMMDD();

    for (let i = 0; i < sendList.length; i++) {
        let pdfInfo = sendList[i]['pdfInfo'];
        let pmtDdt = sendList[i]['pmtDdt'];
        if (!pmtDdt || pmtDdt < today) {
            result.push(sendList[i].bizNm);
        } else {
            let doc02Flag = false;
            let doc05Flag = false;
            let doc07Flag = false;
            let paymt = false;
            for (let j = 0; j < pdfInfo.length; j++) {
                if (pdfInfo[j]['문서코드'] === 'doc02') {
                    doc02Flag = true;
                } else if (pdfInfo[j]['문서코드'] === 'doc05') {
                    doc05Flag = true;
                } else if (pdfInfo[j]['문서코드'] === 'doc07') {
                    doc07Flag = true;
                } else if (pdfInfo[j]['문서코드'] === 'paymt') {
                    paymt = true;
                }
            }
            if (doc02Flag) {
            } else if (doc05Flag) {
            } else if (paymt) {
            } else {
                result.push(sendList[i].bizNm);
            }
        }
    }
    return result;
}

function setWetaxFileSelectPopup() {
    let idx = $('#sendModalIdx').val();
    let data = modalData[idx];

    $('#wetaxFileSelectTitle').text($('#sendModalCorpName').text());
    $('#wetaxFileSelectPopupTable tbody').empty();

    showBlockUI('조회중입니다. 잠시만 기다려 주세요.');

    let inJson = {
        bizNo: data.bizNo,
        taxCode: data.taxCode,
        epayNo: data.epayNo
    };

    ajaxRequest('/gwPost/setWetaxFileSelectPopup', 'POST',  inJson, async function(response) {
        $.unblockUI();

        if (!response.list || response.list.length === 0) {
            alert_basic('', '조회된 지방소득세 납부서가 없습니다.');
            return;
        }

        let data = response.list;
        for (let i = 0; i < data.length; i++) {

            let tr = $('<tr>')
                .append(`<td><div class=""><input type="checkbox" name="wetaxFileCheck" data-value="${data[i]['전자납부번호']}" data-pdfIdEnc="${data[i]['PDF_ID_enc']}" class="checkbox"></div></td>`)
                .append(`<td>${data[i]['서류구분'] || ''}</td>`)
                .append(`<td>${Formatter.toYYYYMMDD(data[i]['신고일자'])}</td>`)
                .append(`<td>${Formatter.toGojiYyyymm(data[i]['과세년월'])}</td>`)
                .append(`<td>${data[i]['주민_법인_등록번호'] || ''}</td>`)
                .append(`<td>${data[i]['성명_법인_명'] || ''}</td>`)
                .append(`<td>${Formatter.toCorpNo(data[i]['사업자등록번호'])}</td>`)
                .append(`<td class="text-right">${Formatter.toComma(data[i]['납부세액'])}</td>`)
                .append(`<td>${Formatter.toYYYYMMDD(data[i]['납기일자'])}</td>`)

            $('#wetaxFileSelectPopupTable tbody').append(tr);
        }

        $('#wetaxFileSelectPopup').modal();
    })
}

// TODO 위택스 납부서 수집 후 테스트 및 jquery 변경 필요
function checkAll_wetaxFile(node) {
    let tableRows = document.querySelector('#wetaxFileSelectPopupTable tbody').children;
    let value = !!node.checked;
    for (let i = 0; i < tableRows.length; i++) {
        if (tableRows[i].children[0].children[0] === undefined) continue;
        tableRows[i].children[0].children[0].children[0].checked = value;
    }
}

function wetaxFileAdd() {
    let checkedValues = [];
    let checkedPdf = [];
    let checkboxes = $('input[type="checkbox"][name="wetaxFileCheck"]:checked');

    checkboxes.each(function (i, checkbox) {
        checkedValues.push($(checkbox).attr('data-value'));
        checkedPdf.push($(checkbox).attr('data-pdfIdEnc'));
    });

    if (checkboxes.length === 0) {
        alert_basic("파일선택 선택", "추가하실 지방소득세납부서을 선택해주세요.");
        return;
    }

    let idx = $('#sendModalIdx').val();
    let data = modalData[idx];

    let getData = {
        rcatNo: data.rcatNo,
        list: JSON.stringify(checkedValues),
        pdfList: JSON.stringify(checkedPdf),
        customerNo: data['수임고객번호'],
        taxCode: data.taxCode,
        txnrmYm: data.txnrmYm,
    };

    ajaxRequest('/gwPost/setWetaxFileAdd', 'POST',  getData, async function(response) {
        if ('N' === response.errYn) {
            updateFileList(response.fileList);

            // 위택스 전자납부번호 전역변수에 추가
            let idx = $('#sendModalIdx').val();

            let epayNoList = new Set();
            if (modalData[idx]['epayNo']) epayNoList.add(modalData[idx]['epayNo']);

            response.fileList.forEach(function (data) {
                epayNoList.add(data.wetaxEpayNo);
            })

            modalData[idx]['epayNo'] = Array.from(epayNoList).join(',');

            $('#wetaxFileSelectPopupClose').click();
            updateMessage();
        } else {
            alert_error('서버 통신 에러', response.errMsg);
        }
    })
}

let s_sendYn
let s_list;
function hometaxPdfScrapingBySelectModal(sendYn, list) {
    $('#pdfScrpaingSelectModal').modal();
    s_sendYn = sendYn;
    s_list = list;
}

function hometaxPdfScraping() {
    if (!$("#sgPdfYn").prop("checked") && !$("#jsPdfYn").prop("checked") && !$("#nbPdfYn").prop("checked")) {
        alert_basic('', '수집서류는 1개이상 선택되어야합니다.');
        return;
    }

    $("#pdfScrpaingSelectModal").modal('hide');

    if (s_sendYn === 'sendY') sendHometaxPdfScrapingBySelectedListNext(s_list);
    else if (s_sendYn === 'sendN') hometaxPdfScrapingBySelectedList();
    else if (s_sendYn === 'sync') hometaxPdfScrapingSync(s_list);
}