import {DateTime, Form, Picker, Config} from '../../../../ionic';

export function run() {

describe('DateTime', () => {

  describe('setValue', () => {

    it('should set date with valid date', () => {
      var d = new Date(1994, 11, 15, 13, 47, 20, 789);
      datetime.setValue(d);

      expect(datetime._value.getFullYear()).toEqual(1994);
      expect(datetime._value.getMonth()).toEqual(11);
      expect(datetime._value.getDate()).toEqual(15);
      expect(datetime._value.getHours()).toEqual(13);
      expect(datetime._value.getMinutes()).toEqual(47);
      expect(datetime._value.getSeconds()).toEqual(20);
      expect(datetime._value.getMilliseconds()).toEqual(789);
    });

    it('should set null with null or undefined value', () => {
      datetime.setValue(null);
      expect(datetime._value).toBeNull();

      datetime.setValue(undefined);
      expect(datetime._value).toBeNull();

      datetime.setValue('');
      expect(datetime._value).toBeNull();
    });

  });

  describe('parseColumn', () => {

    it('should set YYYY', () => {
      datetime.calcMinMax();
      datetime.setValue(new Date(1994, 11, 15, 13, 47, 20, 789));
      var picker = Picker.create();

      datetime.parseColumn(picker, 'YYYY');
      expect(picker.data.columns.length).toEqual(1);
      expect(picker.data.columns[0].options.length >= 100).toEqual(true);
    });

    it('should not add a column with an empty format', () => {
      datetime.calcMinMax();
      datetime.setValue(new Date(1994, 11, 15, 13, 47, 20, 789));
      var picker = Picker.create();

      datetime.parseDisplay(picker);
      expect(picker.data.columns.length).toEqual(0);
    });

  });

  var datetime: DateTime;

  beforeEach(() => {
    datetime = mockDateTime();
  });

  function mockDateTime(): DateTime {
    return new DateTime(new Form(), null, {});
  }

});

}
