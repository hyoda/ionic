import {DateTime, Form, Picker, Config} from '../../../../ionic';

export function run() {

describe('DateTime', () => {

  describe('setValue', () => {

    it('should update existing DateTimeData value with new DateTimeData value', () => {
      var d = '1994-12-15T13:47:20.789Z';
      datetime.setValue(d);

      expect(datetime._value.year).toEqual(1994);

      var dateTimeData = {
        year: {
          text: '1995',
          value: 1995,
        },
        month: {
          text: 'December',
          value: 12,
        },
        day: {
          text: '20',
          value: 20
        },
        whatevaIDoWhatIWant: -99,
      };
      datetime.setValue(dateTimeData);

      expect(datetime._value.year).toEqual(1995);
      expect(datetime._value.month).toEqual(12);
      expect(datetime._value.day).toEqual(20);
      expect(datetime._value.hour).toEqual(13);
      expect(datetime._value.minute).toEqual(47);
    });

    it('should parse a ISO date string with no existing DateTimeData value', () => {
      var d = '1994-12-15T13:47:20.789Z';
      datetime.setValue(d);
      expect(datetime._value.year).toEqual(1994);
      expect(datetime._value.month).toEqual(12);
      expect(datetime._value.day).toEqual(15);
    });

    it('should parse a Date object with no existing DateTimeData value', () => {
      var d = new Date(1994, 11, 15);
      datetime.setValue(d);
      expect(datetime._value.year).toEqual(1994);
      expect(datetime._value.month).toEqual(12);
      expect(datetime._value.day).toEqual(15);
    });

    it('should not parse a value with bad data', () => {
      var d = 'umm 1994 i think';
      datetime.setValue(d);
      expect(datetime._value).toEqual(null);
    });

    it('should not parse a value with blank value', () => {
      datetime.setValue(null);
      expect(datetime._value).toEqual(null);

      datetime.setValue(undefined);
      expect(datetime._value).toEqual(null);

      datetime.setValue('');
      expect(datetime._value).toEqual(null);
    });

  });

  var datetime: DateTime;

  beforeEach(() => {
    datetime = mockDateTime();
  });

  function mockDateTime(): DateTime {
    return new DateTime(new Form(), null, {});
  }

  console.warn = function(){};

});

}
