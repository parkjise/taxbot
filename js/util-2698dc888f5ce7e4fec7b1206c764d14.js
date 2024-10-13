class Util {
    // yyyMMdd return
    static getDateYYYMMDD(period) {
        const today = new Date();
        let targetDate = new Date();

        switch (period) {
            case 'month':
                targetDate.setMonth(today.getMonth() - 1);
                break;
            case 'twoWeeks':
                targetDate.setDate(today.getDate() - 14);
                break;
            case 'week':
                targetDate.setDate(today.getDate() - 7);
                break;
            case 'yesterday':
                targetDate.setDate(today.getDate() - 1);
                break;
            default:
                break;
        }

        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더해주고, 두 자리로 맞춤
        const day = String(targetDate.getDate()).padStart(2, '0'); // 일자를 두 자리로 맞춤

        return `${year}${month}${day}`;
    }

    static getDateYYYMM(period) {
        const today = new Date();
        let targetDate = new Date();

        switch (period) {
            case 'month':
                targetDate.setMonth(today.getMonth() - 1);
                break;
            default:
                break;
        }

        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더해주고, 두 자리로 맞춤

        return `${year}${month}`;
    }

    static getParamValue(paramName) {
        return new URLSearchParams(window.location.search).get(paramName)
    }
}

class Formatter {

    static toDateWithTagBr(str) {
        let regex = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/;
        return str ? str.replace(regex, "$1-$2-$3<br>$4:$5:$6") : '';
    }

    static toYYYYMMDD(str) {
        return str ? str.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') : '';
    }

    static toYYYYMM(str) {
        return str ? str.replace(/(\d{4})(\d{2})/, '$1-$2') : '';
    }

    static toHHmmss(str) {
        return str ? str.replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2:$3') : '';
    }

    static toCorpNo(str) {
        return str ? str.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3') : '';
    }

    static toJuminNo(str) {
         str = str ? str : '';
         if (str.indexOf('*') > -1) {
             str = str.replace(/([\d|*]{6})([\d|*]+)/, '$1-$2');
         } else {
             str = str.replace(/(\d{6})(\d{7})/, '$1-$2');
         }
        return str;
    }

    static toHomeNumber1(str) {
        return str ? str.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3') : '';
    }

    static toHomeNumber2(str) {
        return str ? str.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3') : '';
    }

    static toHomeNumber3(str) {
        return str ? str.replace(/[^0-9]/g, '').replace(/(^02|^\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3") : '';
    }

    static toPhoneNumber1(str) {
        return str ? str.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : '';
    }

    static toPhoneNumber2(str) {
        return str ? str.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') : '';
    }

    static toGojiYyyymm(str) {
        return str ? str.replace(/(\d{4})(\d{2})/, '$1년 $2월') : '';
    }

    static toComma(str) {
        return str ? str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '';
    }

    static toMgmtNo2(str) {
        return str ? str.replace(/\D/g, '').replace(/(\d{3})(\d{2})(\d{5})(\d+)/, '$1-$2-$3-$4').slice(0, 14) : '';
    }

    static toSocialNoMasking(str) {
        return str ? str.replace(/\D/g, '').replace(/(\d{6})(\d)/, '$1-$2******').slice(0, 14) : '';
    }

    // 전자납부번호
    static toElctPmtNo(str) {
        return str ? str.replace(/(\d{4})(\d{4})(\d)(\d{2})(\d{8})/, '$1-$2-$3-$4-$5') : '';
    }

    static toEpayNo(str) {
        return str ? str.replace(/(\d{5})(\d{1})(\d{2})(\d{2})(\d{1})(\d{7})(\d{1})/, '$1-$2-$3-$4-$5-$6-$7') : '';
    }

    // input
    static toMgmtNo(str) {
        str.value = str.value.replace(/\D/g, '').replace(/(\d{3})(\d{2})(\d{5})(\d+)/, '$1-$2-$3-$4').slice(0, 14);
    }

    // input
    static toSocialNo(str) {
        str.value = str.value.replace(/\D/g, '').replace(/(\d{6})(\d{7})/, '$1-$2').slice(0, 14);
    }

    static toSocialNo2(str) {
        return str ? str.replace(/\D/g, '').replace(/(\d{6})(\d{7})/, '$1-$2').slice(0, 14) : '';
    }

    static toHometaxNo(str) {
        return str ? str.replace(/(\d{3})(\d{4})(\d{1})(\d{12})/, '$1-$2-$3-$4') : '';
    }

    static toWetaxNo(str) {
        return str ? str.replace(/(\d{5})(\d{1})(\d{2})(\d{2})(\d{1})(\d{7})(\d{1})/, '$1-$2-$3-$4-$5-$6-$7') : '';
    }
}

class Regex {
    static biznoToNum(str) {
        return /[0-9]{3}-[0-9]{2}-[0-9]{5}/.test(str) ? str.replaceAll('-', '') : str;
    }
}

function convertTelNo(number) {
    let tmp = '';
    let returnNumber = '';
    if (!number) return returnNumber;

    if (number.length < 4) {
    } else if (number.length < 7) {
        tmp += number.substring(0, 3);
        tmp += '-';
        tmp += number.substring(3);
        returnNumber = tmp;
    } else if (number.length < 10) {
        tmp += number.substring(0, 2);
        tmp += '-';
        tmp += number.substring(2, 5);
        tmp += '-';
        tmp += number.substring(5);
        returnNumber = tmp;
    } else if (number.length < 11) {
        tmp += number.substring(0, 3);
        tmp += '-';
        tmp += number.substring(3, 6);
        tmp += '-';
        tmp += number.substring(6);
        returnNumber = tmp;
    } else {
        tmp += number.substring(0, 3);
        tmp += '-';
        tmp += number.substring(3, 7);
        tmp += '-';
        tmp += number.substring(7);
        returnNumber = tmp;
    }
    return returnNumber;
}

function getYyyyMM (baseDate) {
    const today = new Date();
    const yyyyMM = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const formatDate = (date) => date.getFullYear() + '-' + addZero(date.getMonth() + 1, 2);
    return today.getDate() < Number(baseDate) ? formatDate(yyyyMM) : formatDate(today);
}

function addZero(num, length) {
    let numStr = num.toString();
    while (numStr.length < length) {
        numStr = "0" + numStr;
    }
    return numStr;
}

// 사업자번호 숫자입력 / 하이픈 적용
function autoHyphen(e) {
    let str = $(e).val();
    str = str.replace(/[^0-9]/g, '');

    if (str.length < 10) {
        str = str ? str.replace(/(\d{3})(\d{2})/, '$1-$2') : '';
    } else {
        str = str ? str.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3') : '';
    }
    $(e).val(str);
}
