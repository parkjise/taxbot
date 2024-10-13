function excelDownload(searchOptions, fileName, url) {
    let queryString = getQueryString(searchOptions);
    let reqUrl = url + (queryString === '?' ? '' : queryString);

    $.ajax({
        url: reqUrl,
        type: 'GET',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        xhrFields: {
            responseType: 'blob'
        },
        success: function(data) {
            let link = document.createElement('a');
            link.download = fileName + ".xlsx";
            link.href = URL.createObjectURL(data);
            document.body.appendChild(link); // 필요한 경우, 링크를 DOM에 추가
            link.click();
            document.body.removeChild(link); // 다운로드 후 링크 삭제
        },
        error: function(xhr, status, error) {
            console.error("Error during file download:", status, error);
        }
    });
}

function getQueryString(searchOptions) {
    let queryString = $.param(searchOptions).replaceAll('sDate=', 'sDate=').replaceAll('-', '').replaceAll('eDate=', 'eDate=').replaceAll('-', '');
    return queryString ? '?' + queryString : '';
}

function exportToExcel(tableName, fileName) {
    let excelHandler = {
        getExcelFileName : function(){
            return fileName + '.xlsx';	//파일명
        },
        getSheetName : function(){
            return fileName;	//시트명
        },
        getExcelData : function(){
            return document.getElementById(tableName); 	//TABLE id
        },
        getWorksheet : function(){
            return XLSX.utils.table_to_sheet(this.getExcelData());
        }
    }

    let wb = XLSX.utils.book_new();
    let newWorksheet = excelHandler.getWorksheet();
    XLSX.utils.book_append_sheet(wb, newWorksheet, excelHandler.getSheetName());
    let wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
    saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), excelHandler.getExcelFileName());
}

function s2ab(s) {
    let buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    let view = new Uint8Array(buf);  //create uint8array as viewer
    for (let i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;
}

// hometaxScrapingModal.js 로 옮기기
async function setHometaxScrapingStatus() {
    $('#hometaxStatusIcon').attr('class', 'circle-badge');

    let content = '';
    let addClass = '';
    let data = await hometaxScrapingStatusCheck();

    switch (data.status) {
        case 'delay' :
            content = '지연';
            addClass = 'bg-red';
            break;
        case 'warn' :
            content = '다소지연';
            addClass = 'bg-warning';
            break;
        case 'good' :
            content = '원활';
            addClass = 'bg-success';
            break;
    }

    $('#hometaxStatus').text(content);
    $('#hometaxStatusIcon').addClass(addClass);
}

function hometaxScrapingStatusCheck() {
    return new Promise(function (resolve) {
        ajaxRequest('/gwPost/hometaxScrapingStatusCheck', 'POST', {}, (response) => {
            let data = response;
            if (data) {
                resolve(data);
            } else {
                alert_error('시스템 오류', '홈택스 수집상태 조회오류');
            }
        });
    })
}

//닫기 버튼 클릭시
function closeWin(key) {
    if ('certValidModal' === key && $("#certValidCheck").prop("checked")) {
        setCookie('certValidModal', 'Y', 1);
    } else if ($("#endDateCheck_" + key).prop("checked")) {
        setCookie('endDateCheckCookie_' + key, 'Y', 1);
    }
}
function checkAll(source, name) {
    if(!name) name = 'inputSelect';
    const $table = $(source).closest('table');
    const checkboxes = $table.find('input[type="checkbox"][name="'+name+'"]');
    checkboxes.prop('checked', source.checked);
    countSelected($table, name);
}
function countSelected(source, name) {
    if(!name) name = 'inputSelect';
    const $table = $(source).closest('table');
    const selectedCount = $table.find('input[type="checkbox"][name="'+name+'"]:checked').length;
    $('#selectCount').text(selectedCount);
}

function setPagination(page) {
    $('.pagination').empty();

    if (page.totalcount === 0) return;
    if (!page.totalcount) page.endPage = 1;

    let $ul = $('.pagination');
    let $li = $(`<li class="page-item prev">`)
        .append(`<a class="page-link" onclick="fnMovePage('${(page.startPage - 1)}')"><i class="feather" data-feather="chevron-left"></i></a>`)
        .addClass(page.prev ? '' : 'disabled');
    $ul.append($li);

    for (let i = page.startPage; i < page.endPage + 1; i++) {
        let $li = $(`<li class="page-item">`)
            .append(`<a class="page-link" onclick="fnMovePage('${i}')">${i}</a>`)
            .addClass(page.pagenum === i - 1 ? 'active' : '');
        $ul.append($li);
    }

    $li = $(`<li class="page-item next">`)
        .append(`<a class="page-link" onclick="fnMovePage('${(page.endPage + 1)}')"><i class="feather" data-feather="chevron-right"></i></a>`)
        .addClass(page.next ? '' : 'disabled');
    $ul.append($li);

    feather.replace();
}

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

function seTtxnrmYr(selectId) {
    const dropdown = $(`#${selectId}`);
    dropdown.empty();
    for (let i = 0; i < 5; i++) {
        const year = currentYear - i;
        dropdown.append(new Option(String(year), String(year)));
    }
}

function setSelectedYear(selectId) {
    const yearToSelect = (currentMonth >= 1 && currentMonth <= 3) ? currentYear - 1 : currentYear;
    $(`#${selectId}`).val(yearToSelect).prop('selected', true);
}

function setSelectedPeriod(selectId) {
    const periodToSelect = (currentMonth >= 4 && currentMonth <= 9) ? 1 : 2;
    $(`#${selectId}`).val(periodToSelect).prop('selected', true);
}

function returnSearchMap() {
    let searchMap = {};
    if (location.search.length >= 1) {
        let params = location.search.substring(location.search.indexOf('?') + 1);
        params = params.split('&');

        for (let i = 0; i < params.length; i++) {
            let key = params[i].split('=');
            searchMap[key[0]] = key[1];
        }
    }
    return searchMap;
}