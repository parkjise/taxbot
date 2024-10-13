function extracted() {
    (Dropzone.options.dpzSingleFile = {
        url: '/customer/files',
        paramName: 'file',
        autoProcessQueue: false,
        addRemoveLinks: true,
        dictRemoveFile: ' 취소',
        maxFiles: 1,
        maxFilesize: 1000,
        timeout: 180000,
        init: function () {
            let dropZone = this;
            let removeBtn = document.querySelector('#remove-files');
            removeBtn.addEventListener('click', function () {
                dropZone.removeAllFiles();
            });

            let uploadBtn = document.querySelector('#upload-btn');
            uploadBtn.addEventListener('click', function () {
                if (dropZone.files.length <= 0) {
                    alert_error('첨부된 파일이 없습니다.', "수임목록 파일을 첨부해주세요.");
                } else if (dropZone.files[0].upload.filename.indexOf('xls') < 0 && dropZone.files[0].upload.filename.indexOf('xlsx') < 0) {
                    alert_error('파일형식 확인', "택스봇에서 내려받은 수임목록 엑셀파일을 첨부해주세요.");
                } else {
                    alert_basic('파일전송', '파일을 서버로 전송합니다');
                    dropZone.processQueue();
                }
            });

            this.on('maxfilesexceeded', function (e) {
                this.removeAllFiles(), this.addFile(e);
            });
        },
        sending: function (file, xhr, formData) {
            // formData.append('filePwd', $('#filePwd').val());
        },
        successmultiple: function (file, response) {
            if (response.result >= 1) {
                alert_success_after('파일전송완료', response.result + ' 건이 수정되었습니다.', function () {
                    location.reload();
                });
            } else {
                alert_error_after('파일전송실패', '', function () {
                    location.reload();
                });
            }
        },
        success: function (file, response) {
            if (response.result >= 1) {
                alert_success_after('파일전송완료', response.result + ' 건이 수정되었습니다.', function () {
                    location.reload();
                });
            } else {
                alert_error_after('파일전송실패', response.errMsg, function () {
                    location.reload();
                });
            }
        },
        errormultiple: function (file, res, xhr) {
            file = Array.isArray(file) ? file[0] : file
            console.log(file.name, res)
        },
        error: function (file, res, xhr) {
            file = Array.isArray(file) ? file[0] : file
            console.log(file.name, res)
        }
    }),
        (Dropzone.options.dpzSingleFile2 = {
            url: '/file/fileTaxReturn',
            paramName: 'file',
            autoProcessQueue: false,
            addRemoveLinks: true,
            dictRemoveFile: ' 취소',
            maxFiles: 1,
            maxFilesize: 1000,
            timeout: 180000,
            init: function () {
                let dropZone = this;
                let removeBtn = document.querySelector('#remove-files2');
                removeBtn.addEventListener('click', function () {
                    dropZone.removeAllFiles();
                });
                let submitBtn = document.querySelector('#submitBtn');
                submitBtn.addEventListener('click', function () {
                    let taxCode = $('[name=itrfCd_file]:checked').val();
                    if (dropZone.files.length <= 0) {
                        alert_error('입력양식 확인', '전자신고 파일을 업로드하세요');
                        return;
                    }
                    if (taxCode == '14' || taxCode == '41' || taxCode == '31' || taxCode == '31B' || taxCode == '10' || taxCode == '22') {
                        if (!$('#managerId').val()) {
                            alert_error('입력양식 확인', '담당자 아이디를 입력하세요');
                            return;
                        } else if (!$('#managerPwd').val()) {
                            alert_error('입력양식 확인', '담당자 비밀번호를 입력하세요');
                            return;
                        }
                    }
                    alert_confirm('신고 진행 확인', '해당 파일로 전자신고를 진행하시겠습니까?', '전자신고를 진행합니다.', '전자신고를 취소합니다.', function () {
                        dropZone.processQueue();
                        $('#fileModal').modal('hide');
                        document.getElementById('dpz-single-file2').setAttribute('class', 'dropzone dropzone-area dz-clickable');
                        document.getElementById('dpz-single-file2').innerHTML = '<div class="dz-default dz-message">여기를 클릭해서 첨부하거나, 파일을 끌어오세요</div>';
                        dropZone.files = new Array();
                    });
                });
                this.on('maxfilesexceeded', function (e) {
                    this.removeAllFiles(), this.addFile(e);
                });
            },
            sending: function (file, xhr, formData) {
                formData.append('managerId', $('#managerId').val());
                formData.append('managerPwd', $('#managerPwd').val());
                formData.append('filePwd', $('#filePwd').val());
                if ($('#txtnY').val() && $('#txtnM').val()) {
                    formData.append('txtnYm', $('#txtnY').val() + $('#txtnM').val());
                    if (!$("#mySelect").prop("disabled")) {
                        formData.append('rtnClDetailCd', $('#rtnClDetailCd').val());
                    }
                    formData.append('divisionCd', '제출');
                } else {
                    formData.append('divisionCd', '신고');
                }
                if ($('#hometaxYn').val()) {
                    formData.append('hometaxYn', $('#hometaxYn').val());
                }
                const taxCodes = $('[name=itrfCd_file]:checked').val();
                formData.append('itrfCd', taxCodes);
                let taxName = '';
                switch (taxCodes) {
                    case '14':
                        taxName = '홈택스(원천세)';
                        break;
                    case '41':
                        taxName = '홈택스(부가세)';
                        break;
                    case '31':
                        taxName = '홈택스(법인세 정기)';
                        break;
                    case '31B':
                        taxName = '홈택스(법인세 중간)';
                        break;
                    case '10':
                        taxName = '홈택스(종합소득세)';
                        break;
                    case '22':
                        taxName = '홈택스(양도소득세)';
                        break;
                    case '999':
                        taxName = '위택스(지방세 특별징수)';
                        break;
                    case '910':
                        taxName = '위택스(지방세 종합소득세)';
                        break;
                    case 'A0161':
                        taxName = '간이지급명세서 근로소득';
                        break;
                    case 'A0162':
                        taxName = '간이지급명세서 사업소득';
                        break;
                    case 'F0026':
                        taxName = '지급명세서 일용근로소득';
                        break;
                    case 'F1001':
                        taxName = '사업장현황신고';
                        break;
                    case 'A0165':
                        taxName = '간이지급명세서 기타소득';
                        break;
                    case 'A0051':
                        taxName = '지급명세서 근로소득';
                        break;
                    case 'A0056':
                        taxName = '지급명세서 의료비';
                        break;
                    case 'A0057':
                        taxName = '지급명세서 기부금';
                        break;
                    case 'A0053':
                        taxName = '지급명세서 퇴직소득';
                        break;
                    case 'A0086':
                        taxName = '지급명세서 사업소득';
                        break;
                    case 'A0085':
                        taxName = '지급명세서 사업소득(연말정산용)';
                        break;
                    case 'A0088':
                        taxName = '지급명세서 기타소득';
                        break;
                    case 'A0087':
                        taxName = '지급명세서 종교인소득(연말정산용)';
                        break;
                    case 'A0084':
                        taxName = '지급명세서 이자배당소득';
                        break;
                    case 'A0055':
                        taxName = '지급명세서 비거주자사업기타소득';
                        break;
                    default:
                        taxName = '';
                        break;
                }

                showBlockUI(taxName + ' 전자신고를 진행중입니다. 잠시만 기다려주세요');
            },
            successmultiple: function (file, response) {
                if (response.result == 'success') {
                    alert_success_after(response.result, '전자신고 완료', function () {
                        location.reload();
                    });
                    //openSendModal(response);
                    $.unblockUI();
                } else {
                    //alert_error(response.result);
                    $.unblockUI();
                    alert_error_after('전자신고 실패', response.output.errMsg, function () {
                        location.reload();
                    });
                }
            },
            success: function (file, response) {
                if (response.result == 'success') {
                    $.unblockUI();
                    alert_success_after(response.result, '전자신고 완료', function () {
                        location.reload();
                    });
                    //openSendModal(response);
                } else {
                    //alert_error(response.result);
                    $.unblockUI();
                    alert_error_after('전자신고 실패', response.output.errMsg, function () {
                        location.reload();
                    });
                }
            },
            error: function (file, response) {
                if (response == 'You can not upload any more files.') {
                    alert_error('신고파일은 한개씩만 가능합니다.');
                } else {
                    alert_error(response);
                }
                $.unblockUI();
            },
        }),
        (Dropzone.options.dpzSingleWetax = {
            url: '/file/wetaxReturn',
            paramName: 'file',
            autoProcessQueue: false,
            addRemoveLinks: true,
            dictRemoveFile: ' 취소',
            maxFiles: 1,
            maxFilesize: 1000,
            timeout: 180000,
            init: function () {
                let dropZone = this;
                let removeBtn = document.querySelector('#remove-files2');
                removeBtn.addEventListener('click', function () {
                    dropZone.removeAllFiles();
                });

                let submitBtn = document.querySelector('#submitBtn');
                submitBtn.addEventListener('click', function () {
                    if (dropZone.files.length <= 0) {
                        alert_error('입력양식 확인', '전자신고 파일을 업로드하세요');
                        return;
                    } else {
                        alert_confirm('신고 진행 확인', '해당 파일로 전자신고를 진행하시겠습니까?', '위택스 전자신고를 진행합니다.', '위택스 전자신고를 취소합니다.', function () {
                            dropZone.processQueue();
                            $('#fileModal').modal('hide');
                            document.getElementById('dpz-single-file2').setAttribute('class', 'dropzone dropzone-area dz-clickable');
                            document.getElementById('dpz-single-file2').innerHTML = '<div class="dz-default dz-message">내 PC에서 첨부하거나, 파일을 끌어오세요</div>';
                            dropZone.files = new Array();
                        });
                    }
                });
                this.on('maxfilesexceeded', function (e) {
                    this.removeAllFiles(), this.addFile(e);
                });
            },
            sending: function (file, xhr, formData) {
                formData.append('filePwd', $('#filePwd').val());
                console.log(JSON.stringify(file));

                showBlockUI('위택스 전자신고를 진행중입니다. 잠시만 기다려주세요');
            },
            successmultiple: function (file, response) {
                if (response.result == 'success') {
                    $.unblockUI();
                    alert_success_after(response.result, '전자신고 완료', function () {
                        location.reload();
                    });
                } else {
                    //alert_error(response.result);
                    alert_error('전자신고 실패', response.output.errMsg);
                    $.unblockUI();
                }
            },
            success: function (file, response) {
                if (response.result == 'success') {
                    alert_success(response.result, '전자신고 완료');
                    //openSendModal(response);
                    $.unblockUI();
                } else {
                    //alert_error(response.result);
                    $.unblockUI();
                    alert_error_after('전자신고 실패', response.output.errMsg, function () {
                        location.reload();
                    });
                }
            },
            error: function (file, response) {
                alert_error(response.result);
                $.unblockUI();
            },
        }),
        (Dropzone.options.dpzSingleFileAdd = {
            url: '/upload/attachedFile',
            paramName: 'file',
            autoProcessQueue: false,
            addRemoveLinks: true,
            maxFiles: 50,
            maxFilesize: 1000,
            uploadMultiple: true,
            parallelUploads: 50,
            timeout: 180000,
            init: function () {
                let dropZone = this;
                let removeBtn = document.querySelector('#remove-files');
                removeBtn.addEventListener('click', function () {
                    dropZone.removeAllFiles();
                });

                let uploadBtn = document.querySelector('#upload-btn');
                uploadBtn.addEventListener('click', function () {
                    dropZone.processQueue();
                });

                this.on('maxfilesexceeded', function (e) {
                    this.removeAllFiles(), this.addFile(e);
                });
            },
            sending: function (file, xhr, formData) {
                formData.append('rcatNo', $('#rcatNo').val());
            },
            successmultiple: function (file, response) {
                let fileList = response.fileList;
                if (response.result >= 1) {
                    this.removeAllFiles(true);
                    $('#cancel-btn').click();
                    $('#remove-files').click();
                    updateFileList(fileList);
                } else {
                    alert_error('시스템 오류', response);
                }
            },
            error: function (file, response) {
                errorCodeHandling(JSON.stringify(response));
                $.unblockUI();
            },
        }),
        (Dropzone.options.dpzSingleFileAdd2 = {
            url: '/upload/attachedFile',
            paramName: 'file',
            autoProcessQueue: false,
            addRemoveLinks: true,
            maxFiles: 50,
            maxFilesize: 1000,
            uploadMultiple: true,
            parallelUploads: 50,
            timeout: 180000,
            init: function () {
                let dropZone = this;
                let removeBtn = document.querySelector('#remove-files');
                removeBtn.addEventListener('click', function () {
                    dropZone.removeAllFiles();
                });

                let uploadBtn = document.querySelector('#upload-btn');
                uploadBtn.addEventListener('click', function () {
                    dropZone.processQueue();
                });

                this.on('maxfilesexceeded', function (e) {
                    alert_error('시스템 오류', '파일 크기가 너무 큽니다.');
                    this.removeAllFiles(), this.addFile(e);
                });
            },
            sending: function (file, xhr, formData) {
                if (!$('#rcatNo').val()) {
                    $('#cancel-btn').click();
                    return;
                }
                formData.append('rcatNo', $('#rcatNo').val());
            },
            successmultiple: function (file, response) {
                let fileList = response.fileList;
                if (response.result >= 1) {
                    fnMovePage($('#pageNoSet').val());
                    $('#cancel-btn').click();
                    this.removeAllFiles();
                    updateFileList(fileList);
                } else {
                    alert_error('시스템 오류', response);
                }

                // console.log(file);
                // console.log(response);
                // let fileList = {};
                // for(let i=0;i<response.fileList.length;i++){
                //     let fileObj = {
                //         fileList[i].
                //     }
                // }
                // if(response.result>=1){
                //     fnMovePage($("#pageNoSet").val());
                //     $("#cancel-btn").click();
                //     this.removeAllFiles();
                //     updateFileList(response.fileList);
                // }else{
                //     alert("error\n"+response);
                // }
            },
        }),
        (Dropzone.options.dpzAcceptanceRequest = {
            url: '/customer/acceptanceRequestFiles',
            paramName: 'file',
            autoProcessQueue: false,
            addRemoveLinks: true,
            dictRemoveFile: ' 취소',
            maxFiles: 1,
            maxFilesize: 1000,
            timeout: 180000,
            init: function () {
                dropZone = this;
                dropZone.removeAllFiles();
                let removeBtn = document.querySelector('#removeFilesAcceptanceRequestHometax');
                removeBtn.addEventListener('click', function () {
                    dropZone.removeAllFiles();
                });

                let uploadBtn = document.querySelector('#upload-acceptance-request');
                uploadBtn.addEventListener('click', function () {
                    if (dropZone.files.length <= 0) {
                        alert_error('첨부된 파일이 없습니다.', "수임납세자 등록양식을 첨부해주세요.");
                    } else if (dropZone.files[0].upload.filename.indexOf('xls') < 0 && dropZone.files[0].upload.filename.indexOf('xlsx') < 0) {
                        alert_error('파일형식 확인', "택스봇에서 내려받은 수임납세자 등록양식 엑셀파일을 첨부해주세요.");
                    } else {
                        dropZone.processQueue();
                    }
                });

                this.on('maxfilesexceeded', function (e) {
                    this.removeAllFiles(), this.addFile(e);
                });
            },
            sending: function (file, xhr, formData) {
            },
            successmultiple: function (file, response) {
                dropZone.removeAllFiles();
                if (response.errYn === 'Y') {
                    $('#modal_errorAlert').modal();
                    $('#modal_errorAlertContent').html(response.errMsg);
                } else {
                    alert_custom_modal_confirm_func('홈택스 기장대리수임납세자등록 요청', '현재 ' + response.count + '건의 기장대리수임납세자등록을 진행하고 있습니다.<br/>' +
                        '업무 환경에 따라 다소 시간이 소요됨을 안내 드리며,<br/>' +
                        '등록 여부는 [수집실행]을 통해 확인해주시기 바랍니다.', '확인', function () {
                        location.reload();
                    });
                }
            },
            success: function (file, response) {
                dropZone.removeAllFiles();
                if (response.errYn === 'Y') {
                    $('#modal_errorAlert').modal();
                    $('#modal_errorAlertContent').html(response.errMsg);
                } else {
                    alert_custom_modal_confirm_func('홈택스 기장대리수임납세자등록 요청', '현재 ' + response.count + '건의 기장대리수임납세자등록을 진행하고 있습니다.<br/>' +
                        '업무 환경에 따라 다소 시간이 소요됨을 안내 드리며,<br/>' +
                        '등록 여부는 [수집실행]을 통해 확인해주시기 바랍니다.', '확인', function () {
                        location.reload();
                    });
                }
            },
            errormultiple: function (file, res, xhr) {
                file = Array.isArray(file) ? file[0] : file
                console.log(file.name, res)
            },
            error: function (file, res, xhr) {
                file = Array.isArray(file) ? file[0] : file
                console.log(file.name, res)
            }
        }),
        // 급여대장발송 파일첨부하기
        (Dropzone.options.dpzSalarySendFileSave = {
            url: '/file/salarySendFileSave',
            paramName: 'file',
            autoProcessQueue: false,
            addRemoveLinks: true,
            maxFiles: 10,  // 10개
            maxFilesize: 10, // 10MB
            uploadMultiple: true,
            parallelUploads: 10,
            timeout: 180000, // 3분
            createImageThumbnails: true,
            maxThumbnailFilesize: 10,
            clickable: true,
            init: function () {
                let dropZone = this;
                let removeBtn = document.querySelector('#remove-files');
                removeBtn.addEventListener('click', function () {
                    dropZone.removeAllFiles();
                });

                let uploadBtn = document.querySelector('#upload-btn');
                uploadBtn.addEventListener('click', function () {
                    dropZone.processQueue();
                });

                this.on('maxfilesexceeded', function (e) {
                    alert_error('시스템 오류', '파일첨부는 최대 10개까지 가능합니다.');
                    let exceededFiles = dropZone.getRejectedFiles();
                    for (let i = 0; i < exceededFiles.length; i++) {
                        dropZone.removeFile(exceededFiles[i]);
                    }
                });
            },
            sending: function (file, xhr, formData) {
                formData.append('yearMonth', $('#sendYearMonth').val());
                formData.append('sendCustomerNo', $('#sendCustomerNo').val());
            },
            successmultiple: function (file, response) {
                if (response.resultCnt >= 1) {
                    $('#cancel-btn').click();
                    this.removeAllFiles();
                    searchSalaryTable($('#sendYearMonth').val());
                } else {
                    alert_error('시스템 오류', response);
                }
            },
        }),

        (Dropzone.options.dpzHometaxAttachedDocs = {
            url: '/file/hometaxAttachedDocs',
            paramName: 'file',
            autoProcessQueue: false,
            addRemoveLinks: true,
            dictRemoveFile: ' 취소',
            maxFiles: 50,
            maxFilesize: 50,
            timeout: 180000,
            uploadMultiple: true,
            init: function () {
                let dropZone = this;
                let removeBtn = document.querySelector('#remove-attachedDocs');
                removeBtn.addEventListener('click', function () {
                    dropZone.removeAllFiles();
                });

                let uploadBtn = document.querySelector('#upload-attachedDocs');
                uploadBtn.addEventListener('click', function () {
                    dropZone.processQueue();
                });

                this.on('maxfilesexceeded', function (e) {
                    alert_error('시스템 오류', '파일 크기가 너무 큽니다.');
                    this.removeAllFiles(), this.addFile(e);
                });
            },
            sending: function (file, xhr, formData) {
                if (!$('#rcatNo').val()) {
                    $('#cancel-btn').click();
                    return;
                }
                formData.append('rcatNo', $('#rcatNo').val());

                showBlockUI('진행중입니다. 잠시만 기다려주세요.');
            },
            successmultiple: function (file, response) {
                if (response.errYn == 'N') {
                    this.removeAllFiles();
                    $('#attachedDocsSuccessModal').modal();
                } else {
                    alert_error('시스템 오류', response.errMsg);
                }
                $('#cancel-btn').click();
                $.unblockUI();
            },
            success: function (file, response) {
                if (response.errYn == 'N') {
                    this.removeAllFiles();
                    $('#attachedDocsSuccessModal').modal();
                } else {
                    alert_error('시스템 오류', response.errMsg);
                }
                $('#cancel-btn').click();
                $.unblockUI();
            },
            error: function (file, response) {
                errorCodeHandling(JSON.stringify(response));
                $.unblockUI();
            },
        }),

        // 민원증명 파일첨부
        (Dropzone.options.dpzHometaxCertAddFiles = {
            url: '/addons/addFiles',
            paramName: 'file',
            autoProcessQueue: false,
            addRemoveLinks: true,
            dictRemoveFile: ' 취소',
            maxFiles: 10, // 10개
            maxFilesize: 10, // 10MB
            timeout: 180000,
            uploadMultiple: true,
            init: function () {
                let dropZone = this;
                let removeBtn = document.querySelector('#remove-files');
                removeBtn.addEventListener('click', function () {
                    dropZone.removeAllFiles();
                });

                let uploadBtn = document.querySelector('#upload-btn');
                uploadBtn.addEventListener('click', function () {
                    dropZone.processQueue();
                });

                // 기능 확인 필요
                this.on('maxfilesexceeded', function (e) {
                    alert_error('시스템 오류', '파일 크기가 너무 큽니다.');
                    this.removeAllFiles(), this.addFile(e);
                });
            },
            sending: function (file, xhr, formData) {
                let idx = $('#sendModalIdx').val();

                formData.append('corpName', modalData[idx]['상호_성명']);
                showBlockUI('진행중입니다. 잠시만 기다려주세요.');
            },
            successmultiple: function (file, response) {
                if (response.result >= 1) {
                    $('#cancel-btn').click();
                    this.removeAllFiles();
                    updateFileList(response);
                    console.log('successmultiple');
                } else {
                    alert_error('시스템 오류', response);
                }

                $.unblockUI();
            },
            error: function (file, response) {
                errorCodeHandling(JSON.stringify(response));
                $.unblockUI();
            },
        }),

        // 온라인매출 계정등록
        (Dropzone.options.dpzOnlineSales = {
            url: '/file/onlineSalesFile',
            paramName: 'file',
            autoProcessQueue: false,
            addRemoveLinks: true,
            dictRemoveFile: ' 취소',
            maxFiles: 1,
            maxFilesize: 1000,
            timeout: 180000,
            init: function () {
                dropZone = this;
                dropZone.removeAllFiles();
                let removeBtn = document.querySelector('#removeFilesOnlineSales');
                removeBtn.addEventListener('click', function () {
                    dropZone.removeAllFiles();
                });

                let uploadBtn = document.querySelector('#reqFilesOnlineSales');
                uploadBtn.addEventListener('click', function () {
                    if (dropZone.files.length <= 0) {
                        alert_error('첨부된 파일이 없습니다.', "온라인매출 등록양식을 첨부해주세요.");
                    } else if (dropZone.files[0].upload.filename.indexOf('xlsx') < 0) {
                        alert_error('파일형식 확인', "택스봇에서 내려받은 온라인매출 등록양식 엑셀파일을 첨부해주세요.");
                    } else {
                        dropZone.processQueue();
                    }
                });

                this.on('maxfilesexceeded', function (e) {
                    this.removeAllFiles(), this.addFile(e);
                });
            },
            sending: function (file, xhr, formData) {
                showBlockUI('진행중입니다. 잠시만 기다려주세요.');
            },
            success: function (file, response) {
                if (response.errYn == 'N') {
                    this.removeAllFiles();
                    $('#multiRgstrModal').modal('hide');
                    searchOnlineSalActTable();
                } else {
                    alert_error('시스템 오류', response.errMsg);
                }
                $.unblockUI();
            },
            error: function (file, response) {
                if (response.errYn == 'N') {
                    this.removeAllFiles();
                    $('#multiRgstrModal').modal('hide');
                    searchOnlineSalActTable();
                } else {
                    alert_error('시스템 오류', response.errMsg);
                }
                $.unblockUI();
            },
        }),
        
        (Dropzone.options.dpzMultipleFiles = {
            paramName: 'file',
            maxFilesize: 1000,
            clickable: !0,
        }),
        (Dropzone.options.dpzFileLimits = {
            paramName: 'file',
            maxFilesize: 1000,
            maxFiles: 5,
            maxThumbnailFilesize: 1,
        }),
        (Dropzone.options.dpAcceptFiles = {
            paramName: 'file',
            maxFilesize: 1000,
            acceptedFiles: 'image/*',
        }),
        (Dropzone.options.dpzRemoveThumb = {
            paramName: 'file',
            maxFilesize: 1000,
            addRemoveLinks: !0,
            dictRemoveFile: ' 취소',
        }),
        (Dropzone.options.dpzRemoveAllThumb = {
            paramName: 'file',
            maxFilesize: 1000,
            init: function () {
                var e = this;
                $('#clear-dropzone').on('click', function () {
                    e.removeAllFiles();
                });
            },
        });
}

extracted();
