import * as datetime from '../../../ionic/util/datetime-util';

export function run() {

describe('convertDataToDate', () => {

  it('should convert DateTimeData to Date object, Z time zone', () => {
    var data: datetime.DateTimeData = {
      type: 'dateobj',
      year: 1994,
      month: 12,
      day: 15,
      hour: 13,
      minute: 47,
      second: 20,
      millisecond: 789,
      tzOffset: 330,
    };

    var d = datetime.convertDataToDate(data);
    expect(d.getFullYear()).toEqual(1994);
    expect(d.getMonth()).toEqual(11);
    expect(d.getDate()).toEqual(15);
    expect(d.getHours()).toEqual(13);
    expect(d.getMinutes()).toEqual(47);
    expect(d.getSeconds()).toEqual(20);
    expect(d.getMilliseconds()).toEqual(789);
  });

  it('should convert DateTimeData to datetime string, +330 tz offset', () => {
    var data: datetime.DateTimeData = {
      type: 'datestr',
      year: 1994,
      month: 12,
      day: 15,
      hour: 13,
      minute: 47,
      second: 20,
      millisecond: 789,
      tzOffset: 330,
    };

    var str = datetime.convertDataToDate(data);
    expect(str).toEqual('1994-12-15T13:47:20.789+05:30');
  });

  it('should convert DateTimeData to datetime string, Z timezone', () => {
    var data: datetime.DateTimeData = {
      type: 'datestr',
      year: 1994,
      month: 12,
      day: 15,
      hour: 13,
      minute: 47,
      second: 20,
      millisecond: 789,
      tzOffset: 0,
    };

    var str = datetime.convertDataToDate(data);
    expect(str).toEqual('1994-12-15T13:47:20.789Z');
  });

  it('should convert DateTimeData to time string, with milliseconds', () => {
    var data: datetime.DateTimeData = {
      type: 'timestr',
      year: 1994,
      month: 12,
      day: 15,
      hour: 13,
      minute: 47,
      second: 20,
      millisecond: 789,
      tzOffset: 0,
    };

    var str = datetime.convertDataToDate(data);
    expect(str).toEqual('13:47:20.789');
  });

  it('should convert DateTimeData to time string', () => {
    var data: datetime.DateTimeData = {
      type: 'timestr',
      year: 1994,
      month: 12,
      day: 15,
      hour: 13,
      minute: 47,
      second: 20,
      millisecond: 0,
      tzOffset: 0,
    };

    var str = datetime.convertDataToDate(data);
    expect(str).toEqual('13:47:20');
  });

});


describe('convertFormatToKey', () => {

  it('should convert year formats to their DateParse key', () => {
    expect(datetime.convertFormatToKey('YYYY')).toEqual('year');
    expect(datetime.convertFormatToKey('YY')).toEqual('year');
  });

  it('should convert month formats to their DateParse key', () => {
    expect(datetime.convertFormatToKey('MMMM')).toEqual('month');
    expect(datetime.convertFormatToKey('MMM')).toEqual('month');
    expect(datetime.convertFormatToKey('MM')).toEqual('month');
    expect(datetime.convertFormatToKey('M')).toEqual('month');
  });

  it('should convert day formats to their DateParse key', () => {
    expect(datetime.convertFormatToKey('DDDD')).toEqual('day');
    expect(datetime.convertFormatToKey('DDD')).toEqual('day');
    expect(datetime.convertFormatToKey('DD')).toEqual('day');
    expect(datetime.convertFormatToKey('D')).toEqual('day');
  });

  it('should convert hour formats to their DateParse key', () => {
    expect(datetime.convertFormatToKey('HH')).toEqual('hour');
    expect(datetime.convertFormatToKey('H')).toEqual('hour');
    expect(datetime.convertFormatToKey('hh')).toEqual('hour');
    expect(datetime.convertFormatToKey('h')).toEqual('hour');
  });

  it('should convert minute formats to their DateParse key', () => {
    expect(datetime.convertFormatToKey('mm')).toEqual('minute');
    expect(datetime.convertFormatToKey('m')).toEqual('minute');
  });

  it('should convert am/pm formats to their DateParse key', () => {
    expect(datetime.convertFormatToKey('A')).toEqual('hour');
    expect(datetime.convertFormatToKey('a')).toEqual('hour');
  });

});

describe('parseTemplate', () => {

  it('should get formats from template "a A m mm h hh H HH D DD DDD DDDD M MM MMM MMMM YY YYYY"', () => {
    var formats = datetime.parseTemplate('a A m mm h hh H HH D DD DDD DDDD M MM MMM MMMM YY YYYY');
    expect(formats[0]).toEqual('a');
    expect(formats[1]).toEqual('A');
    expect(formats[2]).toEqual('m');
    expect(formats[3]).toEqual('mm');
    expect(formats[4]).toEqual('h');
    expect(formats[5]).toEqual('hh');
    expect(formats[6]).toEqual('H');
    expect(formats[7]).toEqual('HH');
    expect(formats[8]).toEqual('D');
    expect(formats[9]).toEqual('DD');
    expect(formats[10]).toEqual('DDD');
    expect(formats[11]).toEqual('DDDD');
    expect(formats[12]).toEqual('M');
    expect(formats[13]).toEqual('MM');
    expect(formats[14]).toEqual('MMM');
    expect(formats[15]).toEqual('MMMM');
    expect(formats[16]).toEqual('YY');
    expect(formats[17]).toEqual('YYYY');
  });

  it('should get formats from template YYMMMMDDHma', () => {
    var formats = datetime.parseTemplate('YYMMMMDDHma');
    expect(formats[0]).toEqual('YY');
    expect(formats[1]).toEqual('MMMM');
    expect(formats[2]).toEqual('DD');
    expect(formats[3]).toEqual('H');
    expect(formats[4]).toEqual('m');
    expect(formats[5]).toEqual('a');
  });

  it('should get formats from template MM/DD/YYYY', () => {
    var formats = datetime.parseTemplate('MM/DD/YYYY');
    expect(formats[0]).toEqual('MM');
    expect(formats[1]).toEqual('DD');
    expect(formats[2]).toEqual('YYYY');
  });

});

describe('renderDateTime', () => {

  it('should format h:mm a', () => {
    var d = datetime.parseDate('1994-12-15T13:47:20.789Z');
    expect(datetime.renderDateTime('h:mm a', d)).toEqual('1:47 pm');
  });

  it('should format HH:mm', () => {
    var d = datetime.parseDate('1994-12-15T13:47:20.789Z');
    expect(datetime.renderDateTime('HH:mm', d)).toEqual('13:47');
  });

  it('should format MMMM D, YYYY', () => {
    var d = datetime.parseDate('1994-12-15T13:47:20.789Z');
    expect(datetime.renderDateTime('MMMM D, YYYY', d)).toEqual('December 15, 1994');
  });

  it('should format MM/DD/YYYY', () => {
    var d = datetime.parseDate('1994-12-15T13:47:20.789Z');
    expect(datetime.renderDateTime('MM/DD/YYYY', d)).toEqual('12/15/1994');
  });

  it('should format DD-MM-YY', () => {
    var d = datetime.parseDate('1994-12-15T13:47:20.789Z');
    expect(datetime.renderDateTime('DD-MM-YY', d)).toEqual('15-12-94');
  });

  it('should format YYYY', () => {
    var d = datetime.parseDate('1994-12-15T13:47:20.789Z');
    expect(datetime.renderDateTime('DD-MM-YY', d)).toEqual('15-12-94');
  });

  it('should format YYYY$MM.DD*HH?mm', () => {
    var d = datetime.parseDate('1994-12-15T13:47:20.789Z');
    expect(datetime.renderDateTime('YYYY$MM.DD*HH?mm', d)).toEqual('1994$12.15*13?47');
  });

  it('should return empty when template invalid', () => {
    var d = datetime.parseDate('1994-12-15T13:47:20.789Z');
    expect(datetime.renderDateTime('', d)).toEqual('');
  });

  it('should return empty when date invalid', () => {
    var d = datetime.parseDate(null);
    expect(datetime.renderDateTime('YYYY', d)).toEqual('');
  });

});

describe('renderTextFormat', () => {

  it('should return a', () => {
    expect(datetime.renderTextFormat('a', 0)).toEqual('am');
    expect(datetime.renderTextFormat('a', 1)).toEqual('am');
    expect(datetime.renderTextFormat('a', 11)).toEqual('am');
    expect(datetime.renderTextFormat('a', 12)).toEqual('pm');
    expect(datetime.renderTextFormat('a', 13)).toEqual('pm');
    expect(datetime.renderTextFormat('a', 21)).toEqual('pm');
    expect(datetime.renderTextFormat('a', 23)).toEqual('pm');
  });

  it('should return A', () => {
    expect(datetime.renderTextFormat('A', 0)).toEqual('AM');
    expect(datetime.renderTextFormat('A', 1)).toEqual('AM');
    expect(datetime.renderTextFormat('A', 11)).toEqual('AM');
    expect(datetime.renderTextFormat('A', 12)).toEqual('PM');
    expect(datetime.renderTextFormat('A', 13)).toEqual('PM');
    expect(datetime.renderTextFormat('A', 21)).toEqual('PM');
    expect(datetime.renderTextFormat('A', 23)).toEqual('PM');
  });

  it('should return m', () => {
    expect(datetime.renderTextFormat('m', 1)).toEqual('1');
    expect(datetime.renderTextFormat('m', 12)).toEqual('12');
  });

  it('should return mm', () => {
    expect(datetime.renderTextFormat('mm', 1)).toEqual('01');
    expect(datetime.renderTextFormat('mm', 12)).toEqual('12');
  });

  it('should return hh', () => {
    expect(datetime.renderTextFormat('hh', 0)).toEqual('12');
    expect(datetime.renderTextFormat('hh', 1)).toEqual('01');
    expect(datetime.renderTextFormat('hh', 11)).toEqual('11');
    expect(datetime.renderTextFormat('hh', 12)).toEqual('12');
    expect(datetime.renderTextFormat('hh', 13)).toEqual('01');
    expect(datetime.renderTextFormat('hh', 21)).toEqual('09');
    expect(datetime.renderTextFormat('hh', 23)).toEqual('11');
  });

  it('should return h', () => {
    expect(datetime.renderTextFormat('h', 0)).toEqual('12');
    expect(datetime.renderTextFormat('h', 1)).toEqual('1');
    expect(datetime.renderTextFormat('h', 11)).toEqual('11');
    expect(datetime.renderTextFormat('h', 12)).toEqual('12');
    expect(datetime.renderTextFormat('h', 13)).toEqual('1');
    expect(datetime.renderTextFormat('h', 21)).toEqual('9');
    expect(datetime.renderTextFormat('h', 23)).toEqual('11');
  });

  it('should return hh', () => {
    expect(datetime.renderTextFormat('hh', 1)).toEqual('01');
    expect(datetime.renderTextFormat('hh', 12)).toEqual('12');
  });

  it('should return H', () => {
    expect(datetime.renderTextFormat('H', 1)).toEqual('1');
    expect(datetime.renderTextFormat('H', 12)).toEqual('12');
  });

  it('should return HH', () => {
    expect(datetime.renderTextFormat('HH', 1)).toEqual('01');
    expect(datetime.renderTextFormat('HH', 12)).toEqual('12');
  });

  it('should return D', () => {
    expect(datetime.renderTextFormat('D', 1)).toEqual('1');
    expect(datetime.renderTextFormat('D', 12)).toEqual('12');
  });

  it('should return DD', () => {
    expect(datetime.renderTextFormat('DD', 1)).toEqual('01');
    expect(datetime.renderTextFormat('DD', 12)).toEqual('12');
  });

  it('should return DDD', () => {
    expect(datetime.renderTextFormat('DDD', 1)).toEqual('Sun');
    expect(datetime.renderTextFormat('DDD', 7)).toEqual('Sat');
  });

  it('should return DDDD', () => {
    expect(datetime.renderTextFormat('DDDD', 1)).toEqual('Sunday');
    expect(datetime.renderTextFormat('DDDD', 7)).toEqual('Saturday');
  });

  it('should return M', () => {
    expect(datetime.renderTextFormat('M', 1)).toEqual('1');
    expect(datetime.renderTextFormat('M', 12)).toEqual('12');
  });

  it('should return MM', () => {
    expect(datetime.renderTextFormat('MM', 1)).toEqual('01');
    expect(datetime.renderTextFormat('MM', 12)).toEqual('12');
  });

  it('should return MMM', () => {
    expect(datetime.renderTextFormat('MMM', 1)).toEqual('Jan');
    expect(datetime.renderTextFormat('MMM', 12)).toEqual('Dec');
  });

  it('should return MMMM', () => {
    expect(datetime.renderTextFormat('MMMM', 1)).toEqual('January');
    expect(datetime.renderTextFormat('MMMM', 12)).toEqual('December');
  });

  it('should return YY', () => {
    expect(datetime.renderTextFormat('YY', 1994)).toEqual('94');
    expect(datetime.renderTextFormat('YY', 94)).toEqual('94');
  });

  it('should return YYYY', () => {
    expect(datetime.renderTextFormat('YYYY', 1994)).toEqual('1994');
    expect(datetime.renderTextFormat('YYYY', 0)).toEqual('0000');
  });

  it('should return empty when blank', () => {
    expect(datetime.renderTextFormat(null, null)).toEqual('');
    expect(datetime.renderTextFormat(null, 1994)).toEqual('1994');
  });

});

describe('parseISODate', () => {

  it('should get HH:MM:SS.SSS+HH:MM', () => {
    var parsed = datetime.parseDate('13:47:20.789+05:30');
    expect(parsed.type).toEqual('timestr');
    expect(parsed.year).toEqual(1970);
    expect(parsed.month).toEqual(1);
    expect(parsed.day).toEqual(1);
    expect(parsed.hour).toEqual(13);
    expect(parsed.minute).toEqual(47);
    expect(parsed.second).toEqual(20);
    expect(parsed.millisecond).toEqual(789);
    expect(parsed.tzOffset).toEqual(330);
  });

  it('should get HH:MM:SS.SSS', () => {
    var parsed = datetime.parseDate('13:47:20.789');
    expect(parsed.type).toEqual('timestr');
    expect(parsed.year).toEqual(1970);
    expect(parsed.month).toEqual(1);
    expect(parsed.day).toEqual(1);
    expect(parsed.hour).toEqual(13);
    expect(parsed.minute).toEqual(47);
    expect(parsed.second).toEqual(20);
    expect(parsed.millisecond).toEqual(789);
    expect(parsed.tzOffset).toEqual(0);
  });

  it('should get HH:MM:SS', () => {
    var parsed = datetime.parseDate('13:47:20');
    expect(parsed.type).toEqual('timestr');
    expect(parsed.year).toEqual(1970);
    expect(parsed.month).toEqual(1);
    expect(parsed.day).toEqual(1);
    expect(parsed.hour).toEqual(13);
    expect(parsed.minute).toEqual(47);
    expect(parsed.second).toEqual(20);
    expect(parsed.millisecond).toEqual(0);
    expect(parsed.tzOffset).toEqual(0);
  });

  it('should get HH:MM', () => {
    var parsed = datetime.parseDate('13:47');
    expect(parsed.type).toEqual('timestr');
    expect(parsed.year).toEqual(1970);
    expect(parsed.month).toEqual(1);
    expect(parsed.day).toEqual(1);
    expect(parsed.hour).toEqual(13);
    expect(parsed.minute).toEqual(47);
    expect(parsed.second).toEqual(0);
    expect(parsed.millisecond).toEqual(0);
    expect(parsed.tzOffset).toEqual(0);
  });

  it('should get YYYY-MM-DDTHH:MM:SS.SSS+HH:MM', () => {
    var parsed = datetime.parseDate('1994-12-15T13:47:20.789+05:30');
    expect(parsed.type).toEqual('datestr');
    expect(parsed.year).toEqual(1994);
    expect(parsed.month).toEqual(12);
    expect(parsed.day).toEqual(15);
    expect(parsed.hour).toEqual(13);
    expect(parsed.minute).toEqual(47);
    expect(parsed.second).toEqual(20);
    expect(parsed.millisecond).toEqual(789);
    expect(parsed.tzOffset).toEqual(330);
  });

  it('should get YYYY-MM-DDTHH:MM:SS.SSS-HH:MM', () => {
    var parsed = datetime.parseDate('1994-12-15T13:47:20.789-11:45');
    expect(parsed.type).toEqual('datestr');
    expect(parsed.year).toEqual(1994);
    expect(parsed.month).toEqual(12);
    expect(parsed.day).toEqual(15);
    expect(parsed.hour).toEqual(13);
    expect(parsed.minute).toEqual(47);
    expect(parsed.second).toEqual(20);
    expect(parsed.millisecond).toEqual(789);
    expect(parsed.tzOffset).toEqual(-705);
  });

  it('should get YYYY-MM-DDTHH:MM:SS.SSS-HH', () => {
    var parsed = datetime.parseDate('1994-12-15T13:47:20.789-02');
    expect(parsed.type).toEqual('datestr');
    expect(parsed.year).toEqual(1994);
    expect(parsed.month).toEqual(12);
    expect(parsed.day).toEqual(15);
    expect(parsed.hour).toEqual(13);
    expect(parsed.minute).toEqual(47);
    expect(parsed.second).toEqual(20);
    expect(parsed.millisecond).toEqual(789);
    expect(parsed.tzOffset).toEqual(-120);
  });

  it('should get YYYY-MM-DDTHH:MM:SS.SSSZ and set UTC offset', () => {
    var parsed = datetime.parseDate('1994-12-15T13:47:20.789Z');
    expect(parsed.type).toEqual('datestr');
    expect(parsed.year).toEqual(1994);
    expect(parsed.month).toEqual(12);
    expect(parsed.day).toEqual(15);
    expect(parsed.hour).toEqual(13);
    expect(parsed.minute).toEqual(47);
    expect(parsed.second).toEqual(20);
    expect(parsed.millisecond).toEqual(789);
    expect(parsed.tzOffset).toEqual(0);
  });

  it('should get YYYY-MM-DDTHH:MM:SS', () => {
    var parsed = datetime.parseDate('1994-12-15T13:47:20');
    expect(parsed.type).toEqual('datestr');
    expect(parsed.year).toEqual(1994);
    expect(parsed.month).toEqual(12);
    expect(parsed.day).toEqual(15);
    expect(parsed.hour).toEqual(13);
    expect(parsed.minute).toEqual(47);
    expect(parsed.second).toEqual(20);
    expect(parsed.millisecond).toEqual(0);
    expect(parsed.tzOffset).toEqual(0);
  });

  it('should get YYYY-MM-DDTHH:MM', () => {
    var parsed = datetime.parseDate('1994-12-15T13:47');
    expect(parsed.type).toEqual('datestr');
    expect(parsed.year).toEqual(1994);
    expect(parsed.month).toEqual(12);
    expect(parsed.day).toEqual(15);
    expect(parsed.hour).toEqual(13);
    expect(parsed.minute).toEqual(47);
    expect(parsed.second).toEqual(0);
    expect(parsed.millisecond).toEqual(0);
    expect(parsed.tzOffset).toEqual(0);
  });

  it('should NOT work with YYYY-MM-DDTHH', () => {
    var parsed = datetime.parseDate('1994-12-15T13');
    expect(parsed.type).toEqual(null);
    expect(parsed.year).toEqual(1970);
    expect(parsed.month).toEqual(1);
    expect(parsed.day).toEqual(1);
    expect(parsed.hour).toEqual(0);
    expect(parsed.minute).toEqual(0);
    expect(parsed.second).toEqual(0);
    expect(parsed.millisecond).toEqual(0);
    expect(parsed.tzOffset).toEqual(0);
  });

  it('should get YYYY-MM-DD', () => {
    var parsed = datetime.parseDate('1994-12-15');
    expect(parsed.type).toEqual('datestr');
    expect(parsed.year).toEqual(1994);
    expect(parsed.month).toEqual(12);
    expect(parsed.day).toEqual(15);
    expect(parsed.hour).toEqual(0);
    expect(parsed.minute).toEqual(0);
    expect(parsed.second).toEqual(0);
    expect(parsed.millisecond).toEqual(0);
    expect(parsed.tzOffset).toEqual(0);
  });

  it('should get YYYY-MM', () => {
    var parsed = datetime.parseDate('1994-12');
    expect(parsed.type).toEqual('datestr');
    expect(parsed.year).toEqual(1994);
    expect(parsed.month).toEqual(12);
    expect(parsed.day).toEqual(1);
    expect(parsed.hour).toEqual(0);
    expect(parsed.minute).toEqual(0);
    expect(parsed.second).toEqual(0);
    expect(parsed.millisecond).toEqual(0);
    expect(parsed.tzOffset).toEqual(0);
  });

  it('should get YYYY', () => {
    var parsed = datetime.parseDate('1994');
    expect(parsed.type).toEqual('datestr');
    expect(parsed.year).toEqual(1994);
    expect(parsed.month).toEqual(1);
    expect(parsed.day).toEqual(1);
    expect(parsed.hour).toEqual(0);
    expect(parsed.minute).toEqual(0);
    expect(parsed.second).toEqual(0);
    expect(parsed.millisecond).toEqual(0);
    expect(parsed.tzOffset).toEqual(0);
  });

  it('should handle bad date formats', () => {
    var parsed = datetime.parseDate('12/15/1994');
    expect(parsed.type).toEqual(null);
    expect(parsed.year).toEqual(1970);
    expect(parsed.month).toEqual(1);
    expect(parsed.day).toEqual(1);
    expect(parsed.hour).toEqual(0);
    expect(parsed.minute).toEqual(0);
    expect(parsed.second).toEqual(0);
    expect(parsed.millisecond).toEqual(0);
    expect(parsed.tzOffset).toEqual(0);

    var parsed = datetime.parseDate('12-15-1994');
    expect(parsed.type).toEqual(null);

    var parsed = datetime.parseDate('1994-1994');
    expect(parsed.type).toEqual(null);

    var parsed = datetime.parseDate('1994 12 15');
    expect(parsed.type).toEqual(null);

    var parsed = datetime.parseDate('12.15.1994');
    expect(parsed.type).toEqual(null);

    var parsed = datetime.parseDate('12\\15\\1994');
    expect(parsed.type).toEqual(null);

    var parsed = datetime.parseDate('200');
    expect(parsed.type).toEqual(null);
    expect(parsed.year).toEqual(1970);

    var parsed = datetime.parseDate('holla');
    expect(parsed.type).toEqual(null);
    expect(parsed.year).toEqual(1970);
  });

  it('should get nothing with null date', () => {
    var parsed = datetime.parseDate(null);
    expect(parsed.type).toEqual(null);
    expect(parsed.year).toEqual(1970);
    expect(parsed.month).toEqual(1);
    expect(parsed.day).toEqual(1);
    expect(parsed.hour).toEqual(0);
    expect(parsed.minute).toEqual(0);
    expect(parsed.second).toEqual(0);
    expect(parsed.millisecond).toEqual(0);
    expect(parsed.tzOffset).toEqual(0);

    var parsed = datetime.parseDate(undefined);
    expect(parsed.type).toEqual(null);
    expect(parsed.year).toEqual(1970);

    var parsed = datetime.parseDate('');
    expect(parsed.type).toEqual(null);
    expect(parsed.year).toEqual(1970);
  });

});

}
