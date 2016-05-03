import {isDate, isBlank, isPresent} from './util';


export function renderDateTime(template: string, value: DateTimeData) {
  if (!value || !value.type) {
    return '';
  }

  var tokens = [];
  FORMAT_KEYS.forEach((format, index) => {
    if (template.indexOf(format.f) > -1) {
      var token = '{~' + index + '~}';

      tokens.push(token, renderTextFormat(format.f, value[format.k]));

      template = template.replace(format.f, token);
    }
  });

  for (var i = 0; i < tokens.length; i += 2) {
    template = template.replace(tokens[i], tokens[i + 1]);
  }

  return template;
}


export function renderTextFormat(format: string, value: number): string {
  if (isBlank(value)) {
    return '';
  }

  if (format === FORMAT_YY || format === FORMAT_MM ||
      format === FORMAT_DD || format === FORMAT_HH ||
      format === FORMAT_mm) {
    return twoDigit(value);
  }

  if (format === FORMAT_YYYY) {
    return fourDigit(value);
  }

  if (format === FORMAT_MMMM) {
    return MONTH_MMMM[value - 1];
  }

  if (format === FORMAT_MMM) {
    return MONTH_MMM[value - 1];
  }

  if (format === FORMAT_DDDD) {
    return DAY_DDDD[value - 1];
  }

  if (format === FORMAT_DDD) {
    return DAY_DDD[value - 1];
  }

  if (format === FORMAT_a) {
    return (value < 12) ? 'am' : 'pm';
  }

  if (format === FORMAT_A) {
    return (value < 12) ? 'AM' : 'PM';
  }

  if (format === FORMAT_hh || format === FORMAT_h) {
    if (value === 0) {
      return '12';
    }
    if (value > 12) {
      value -= 12;
    }
    if (format === FORMAT_hh && value < 10) {
      return ('0' + value);
    }
  }

  return value.toString();
}


export function dateValueRange(format: string, min: DateTimeData, max: DateTimeData): any[] {
  let opts: any[] = [];
  let i: number;

  if (format === FORMAT_YYYY || format === FORMAT_YY) {
    // year
    i = max.year;
    while (i >= min.year) {
      opts.push(i--);
    }

  } else if (format === FORMAT_MMMM || format === FORMAT_MMM) {
    // month, full name
    for (i = 0; i < 12; i++) {
      opts.push(i + 1);
    }

  } else if (format === FORMAT_MM || format === FORMAT_M) {
    // month, numeric
    for (i = 1; i <= 12; i++) {
      opts.push(i);
    }

  } else if (format === FORMAT_DD || format === FORMAT_D) {
    // day, numeric
    for (i = 1; i <= 31; i++) {
      opts.push(i);
    }

  } else if (format === FORMAT_HH || format === FORMAT_H) {
    // 24-hour
    for (i = 0; i < 24; i++) {
      opts.push(i);
    }

  } else if (format === FORMAT_hh || format === FORMAT_h) {
    // 12-hour
    for (i = 1; i <= 12; i++) {
      opts.push(i);
    }

  } else if (format === FORMAT_mm || format === FORMAT_m) {
    // minutes
    for (i = 0; i < 60; i++) {
      opts.push(i);
    }

  } else if (format === FORMAT_A || format === FORMAT_a) {
    // AM/PM
    opts.push(0, 12);
  }

  return opts;
}


const ISO_8601_REGEXP = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/;
const TIME_REGEXP = /^((\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/;

export function parseDate(val: any): DateTimeData {
  // manually parse IS0 cuz Date.parse cannot be trusted
  // ISO 8601 format: 1994-12-15T13:47:20Z

  if (isDate(val)) {
    return {
      type: TYPE_DATE_OBJ,
      year: val.getFullYear(),
      month: val.getMonth() + 1,
      day: val.getDate(),
      hour: val.getHours(),
      minute: val.getMinutes(),
      second: val.getSeconds(),
      millisecond: val.getMilliseconds(),
      tzOffset: 0,
    }
  }

  let parse: any[];

  if (isPresent(val) && val !== '') {
    // parse for time first, HH:MM
    parse = TIME_REGEXP.exec(val);
    if (isPresent(parse)) {
      // adjust the array so it fits nicely with the datetime parse
      parse.unshift(TYPE_TIME_STR, 0);
      parse[2] = parse[3] = 0;

    } else {
      // try parsing for full ISO datetime
      parse = ISO_8601_REGEXP.exec(val);
      if (isPresent(parse)) {
        parse[0] = TYPE_DATE_STR;
      }
    }
  }

  if (isBlank(parse)) {
    parse = [null];
  }

  // ensure all values exist with at least null
  for (var i = 1; i < 8; i++) {
    parse[i] = (parse[i] !== undefined ? parseInt(parse[i], 10) : 0);
  }

  var tzOffset: number = 0;
  if (isPresent(parse[9]) && isPresent(parse[10])) {
    tzOffset += parseInt(parse[10], 10) * 60;
    if (isPresent(parse[11])) {
      tzOffset += parseInt(parse[11], 10);
    }
    if (parse[9] === '-') {
      tzOffset *= -1;
    }
  }

  return {
    type: parse[0],
    year: parse[1] === 0 ? 1970 : parse[1],
    month: parse[2] === 0 ? 1 : parse[2],
    day: parse[3] === 0 ? 1 : parse[3],
    hour: parse[4],
    minute: parse[5],
    second: parse[6],
    millisecond: parse[7],
    tzOffset: tzOffset,
  };
}


export function parseTemplate(template: string): string[] {
  var formats: string[] = [];

  var foundFormats: {index: number; format: string}[] = [];
  FORMAT_KEYS.forEach(format => {
    var index = template.indexOf(format.f);
    if (index > -1) {
      template = template.replace(format.f, replacer(format.f));
      foundFormats.push({
        index: index,
        format: format.f,
      });
    }
  });

  // sort the found formats back to their original order
  foundFormats.sort((a, b) => (a.index > b.index) ? 1 : (a.index < b.index) ? -1 : 0);

  return foundFormats.map(val => val.format);
}

function replacer(originalStr: string) {
  let r = '';
  for (var i = 0; i < originalStr.length; i++) {
    r += '^'
  }
  return r;
}


export function convertFormatToKey(format: string): string {
  for (var k in FORMAT_KEYS) {
    if (FORMAT_KEYS[k].f === format) {
      return FORMAT_KEYS[k].k;
    }
  }
  return null;
}


export function convertDataToDate(data: DateTimeData) {
  var rtn = null;

  if (data) {
    if (data.type === TYPE_TIME_STR) {
      // HH:mm:SS.SSS
      rtn = `${twoDigit(data.hour)}:${twoDigit(data.minute)}:${twoDigit(data.second)}`;
      if (data.millisecond > 0) {
        rtn += '.' + data.millisecond;
      }

    } else if (data.type === TYPE_DATE_STR) {
      // YYYY-MM-DDTHH:MM:SS.SSS+HH:MM
      rtn = `${fourDigit(data.year)}-${twoDigit(data.month)}-${twoDigit(data.day)}T${twoDigit(data.hour)}:${twoDigit(data.minute)}:${twoDigit(data.second)}`;
      if (data.millisecond > 0) {
        rtn += '.' + data.millisecond;
      }
      if (data.tzOffset === 0) {
        rtn += 'Z';

      } else {
        rtn += (data.tzOffset > 0 ? '+' : '-') + twoDigit(Math.floor(data.tzOffset / 60)) + ':' + twoDigit(data.tzOffset % 60);
      }

    } else if (data.type === TYPE_DATE_OBJ) {
      // new Date()
      rtn = new Date(data.year, data.month - 1, data.day, data.hour, data.minute, data.second, data.millisecond);
      var userTzOffsetMS = rtn.getTimezoneOffset() * 60000;
      var dateTsOffsetMS = data.tzOffset * 60000;
      rtn = new Date(rtn.getTime() - userTzOffsetMS + dateTsOffsetMS);

    }
  }
  return rtn;
}


function twoDigit(val: number): string {
  return ('0' + val).slice(-2);
}

function fourDigit(val: number): string {
  return ('000' + val).slice(-4);
}


export interface DateTimeData {
  type: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  tzOffset: number;
}


const TYPE_DATE_OBJ = 'dateobj';
const TYPE_TIME_STR = 'timestr';
const TYPE_DATE_STR = 'datestr';

const FORMAT_YYYY = 'YYYY';
const FORMAT_YY = 'YY';
const FORMAT_MMMM = 'MMMM';
const FORMAT_MMM = 'MMM';
const FORMAT_MM = 'MM';
const FORMAT_M = 'M';
const FORMAT_DDDD = 'DDDD';
const FORMAT_DDD = 'DDD';
const FORMAT_DD = 'DD';
const FORMAT_D = 'D';
const FORMAT_HH = 'HH';
const FORMAT_H = 'H';
const FORMAT_hh = 'hh';
const FORMAT_h = 'h';
const FORMAT_mm = 'mm';
const FORMAT_m = 'm';
const FORMAT_A = 'A';
const FORMAT_a = 'a';

const FORMAT_KEYS = [
  { f: FORMAT_YYYY, k: 'year' },
  { f: FORMAT_MMMM, k: 'month' },
  { f: FORMAT_DDDD, k: 'day' },
  { f: FORMAT_MMM, k: 'month' },
  { f: FORMAT_DDD, k: 'day' },
  { f: FORMAT_YY, k: 'year' },
  { f: FORMAT_MM, k: 'month' },
  { f: FORMAT_DD, k: 'day' },
  { f: FORMAT_HH, k: 'hour' },
  { f: FORMAT_hh, k: 'hour' },
  { f: FORMAT_mm, k: 'minute' },
  { f: FORMAT_M, k: 'month' },
  { f: FORMAT_D, k: 'day' },
  { f: FORMAT_H, k: 'hour' },
  { f: FORMAT_h, k: 'hour' },
  { f: FORMAT_m, k: 'minute' },
  { f: FORMAT_A, k: 'hour' },
  { f: FORMAT_a, k: 'hour' },
];

const FORMAT_REGEX = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|DD?D?D?|ddd?d?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|.)/g;

const DAY_DDDD = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const DAY_DDD = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];

const MONTH_MMMM = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const MONTH_MMM = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];
