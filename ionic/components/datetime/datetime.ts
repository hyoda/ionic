import {Component, Optional, ElementRef, Renderer, Input, Output, Provider, forwardRef, EventEmitter, HostListener, ViewEncapsulation} from 'angular2/core';
import {NG_VALUE_ACCESSOR} from 'angular2/common';

import {Picker, PickerColumn} from '../picker/picker';
import {Form} from '../../util/form';
import {Item} from '../item/item';
import {merge, isBlank, isPresent, isTrueProperty} from '../../util/util';
import {dateValueRange, renderDateTime, renderTextFormat, convertFormatToDateKey, parseTemplate, parseDate, DateTimeData, convertDateTimeDataToDate} from '../../util/datetime-util';
import {NavController} from '../nav/nav-controller';

const DATETIME_VALUE_ACCESSOR = new Provider(
    NG_VALUE_ACCESSOR, {useExisting: forwardRef(() => DateTime), multi: true});


/**
 * @name DateTime
 * @description
 * The `ion-datetime` component is similar to an HTML `<input type="datetime-local">`
 * element, however, Ionic's datetime component makes it easier for developers to
 * display an exact datetime input format, and for users to easily scroll through
 * and individually select parts of date and time data.
 *
 *
 * ### Timezones
 *
 * Like HTML's `datetime-local` input, this component does not get involved with
 * timezone information, and it considers its data as local time. What this basically
 * means is that `ion-datetime` shows the value of the exact date that it was given,
 * rather than it automatically adjusting according to the timezone the browser is in,
 * and the timezone set within the data. Hidden magical timezone calcuations cause nothing
 * but unexpected data and headaches when the developer isn't in full control. If
 * timezones need to adjust according to the user's browser and the data given, then the
 * data should be updated appropriately before it is passed to this component.
 *
 *
 *
 * ```html
 * <ion-item>
 *   <ion-label>Date</ion-label>
 *   <ion-datetime displayFormat="MM/DD/YYYY" min="2013" max="2020" [(ngModel)]="date">
 *   </ion-datetime>
 * </ion-item>
 * ```
 *
 */
@Component({
  selector: 'ion-datetime',
  template:
    '<div class="datetime-text">{{_text}}</div>' +
    '<button aria-haspopup="true" ' +
            'type="button" ' +
            '[id]="id" ' +
            'category="item-cover" ' +
            '[attr.aria-labelledby]="_labelId" ' +
            '[attr.aria-disabled]="_disabled" ' +
            'class="item-cover">' +
    '</button>',
  host: {
    '[class.datetime-disabled]': '_disabled'
  },
  providers: [DATETIME_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None,
})
export class DateTime {
  private _disabled: any = false;
  private _labelId: string;
  private _text: string = '';
  private _fn: Function;
  private _isOpen: boolean = false;
  private _min: DateTimeData;
  private _max: DateTimeData;
  private _value: DateTimeData;

  /**
   * @private
   */
  id: string;

  /**
   * @input {string} The minimum datetime allowed. Value must be a date string
   * following the
   * [ISO 8601 datetime format standard](https://www.w3.org/TR/NOTE-datetime),
   * such as `1996-12-19T16:39`. Defaults to 100 years ago from today.
   */
  @Input() min: string;

  /**
   * @input {string} The maximum datetime allowed. Value must be a date string
   * following the
   * [ISO 8601 datetime format standard](https://www.w3.org/TR/NOTE-datetime),
   * `1996-12-19T16:39`. Defaults to the end of this year.
   */
  @Input() max: string;

  /**
   * @input {string} The display format of the date and time as text that shows
   * within the item. Defaults to `MMM D, YYYY`.
   */
  @Input() displayFormat: string;

  /**
   * @input {string} The format of the date and time picker columns the user selects.
   * A datetime input can have one or many datetime parts, each getting their
   * own column which allow individual selection of that datetime part. Each
   * column follows the string parse format, and is separated by a `|` character.
   * Defaults to `MMM|D|YYYY`.
   */
  @Input() pickerFormat: string;

  /**
   * @input {string} The text to display on the cancel button. Default: `Cancel`.
   */
  @Input() cancelText: string = 'Cancel';

  /**
   * @input {string} The text to display on the "Done" button. Default: `Done`.
   */
  @Input() doneText: string = 'Done';

  /**
   * @input {any} Any addition options that the picker interface can take.
   * See the [Picker API docs](../../picker/Picker) for the create options.
   */
  @Input() pickerOptions: any = {};

  /**
   * @output {any} Any expression you want to evaluate when the datetime selection has changed.
   */
  @Output() change: EventEmitter<any> = new EventEmitter();

  /**
   * @output {any} Any expression you want to evaluate when the datetime selection was cancelled.
   */
  @Output() cancel: EventEmitter<any> = new EventEmitter();

  constructor(
    private _form: Form,
    @Optional() private _item: Item,
    @Optional() private _nav: NavController
  ) {
    this._form.register(this);
    if (_item) {
      this.id = 'dt-' + _item.registerInput('datetime');
      this._labelId = 'lbl-' + _item.id;
      this._item.setCssClass('item-datetime', true);
    }

    if (!_nav) {
      console.error('parent <ion-nav> required for <ion-datetime>');
    }
  }

  @HostListener('click', ['$event'])
  private _click(ev) {
    if (ev.detail === 0) {
      // do not continue if the click event came from a form submit
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();
    this.open();
  }

  @HostListener('keyup.space', ['$event'])
  private _keyup(ev) {
    if (!this._isOpen) {
      this.open();
    }
  }

  /**
   * @private
   */
  open() {
    if (this._disabled) {
      return;
    }

    console.debug('datetime, open picker');

    // the user may have assigned some options specifically for the alert
    let pickerOptions = merge({}, this.pickerOptions);

    let picker = Picker.create(pickerOptions);
    pickerOptions.buttons = [
      {
        text: this.cancelText,
        role: 'cancel',
        handler: () => {
          this.cancel.emit(null);
        }
      },
      {
        text: this.doneText,
        handler: (data) => {
          console.log('datetime, done', data);
          this.onChange(data);
          this.change.emit(data);
        }
      }
    ];

    this.generateColumns(picker);

    this._nav.present(picker, pickerOptions);

    this._isOpen = true;
    picker.onDismiss(() => {
      this._isOpen = false;
    });
  }

  /**
   * @private
   */
  generateColumns(picker: Picker) {
    // if a picker format wasn't provided, then fallback
    // to use the display format
    let template = this.pickerFormat || this.displayFormat;

    if (isPresent(template)) {
      // make sure we've got up to date sizing information
      this.calcMinMax();

      // parse apart the given template into an array of "formats"
      parseTemplate(template).forEach(format => {
        // loop through each format in the template
        // create a new picker column to build up with data
        let column: PickerColumn = {
          name: convertFormatToDateKey(format),
          options: dateValueRange(format, this._min, this._max).map(val => {
            return {
              value: val,
              text: renderTextFormat(format, val),
            };
          }),
          columnWidth: getColumnWidth(format)
        };

        if (column.options.length) {
          // cool, we've loaded up the columns with options
          if (this._value && this._value.type) {
            // we've got a valid date value already
            // preselect the option for this column
            var selected = column.options.find(opt => {
              return opt.value === this._value[convertFormatToDateKey(format)];
            });
            if (selected) {
              // set the select index for this column's options
              column.selectedIndex = column.options.indexOf(selected);
            }
          }
          // add our newly created column to the picker
          picker.addColumn(column);
        }
      });
    }
  }

  /**
   * @private
   */
  setValue(data: any) {
    if (isBlank(data) || data === '') {
      // no data
      this._value = null;

    } else if (this._value && this._value.type && isPresent(data.year)) {
      // there is already a valid parsed DateTimeData value
      // and the value update has new DateTimeData values
      // update the existing DateTimeData data with the new values
      for (var k in data) {
        if (isPresent(data[k].value)) {
          this._value[k] = data[k].value;
        }
      }

    } else {
      // new data, parse it and create the DateTimeData value
      var parsedValue = parseDate(data);

      if (parsedValue.type) {
        // huzzah!
        this._value = parsedValue;

      } else {
        // eww, invalid data
        this._value = null;
        console.warn(`Error parsing date: "${data}". Please provide a Date object, or a valid ISO 8601 datetime format, such as "1994-12-15T13:47:20Z"`);
      }
    }
  }

  /**
   * @private
   */
  updateText() {
    // create the text of the formatted data
    this._text = renderDateTime(this.displayFormat, this._value);
  }

  /**
   * @private
   */
  calcMinMax() {
    let today = new Date();
    let defaultMin = (today.getFullYear() - 100) + '-01-01T00:00:00Z';
    let defaultMax = today.getFullYear() + '-12-31T23:59:59Z';

    if (isBlank(this.min)) {
      this.min = defaultMin;
    }

    if (isBlank(this.max)) {
      this.max = defaultMax;
    }

    this._min = parseDate(this.min);
    this._max = parseDate(this.max);
  }

  /**
   * @input {boolean} Whether or not the datetime component is disabled. Default `false`.
   */
  @Input()
  get disabled() {
    return this._disabled;
  }

  set disabled(val) {
    this._disabled = isTrueProperty(val);
    this._item && this._item.setCssClass('item-datetime-disabled', this._disabled);
  }

  /**
   * @private
   */
  writeValue(val: any) {
    console.debug('datetime, writeValue', val);
    this.setValue(val);
    this.updateText();
  }

  /**
   * @private
   */
  ngAfterContentInit() {
    this.updateText();
  }

  /**
   * @private
   */
  registerOnChange(fn: Function): void {
    this._fn = fn;
    this.onChange = (val: any) => {
      console.debug('datetime, onChange', val);
      this.setValue(val);
      this.updateText();

      // convert DateTimeData value to Date object
      fn(convertDateTimeDataToDate(this._value));

      this.onTouched();
    };
  }

  /**
   * @private
   */
  registerOnTouched(fn) { this.onTouched = fn; }

  /**
   * @private
   */
  onChange(val: any) {
    // onChange used when there is not an ngControl
    console.debug('datetime, onChange w/out ngControl', val);
    this.setValue(val);
    this.updateText();
    this.onTouched();
  }

  /**
   * @private
   */
  onTouched() { }

  /**
   * @private
   */
  ngOnDestroy() {
    this._form.deregister(this);
  }
}

function getColumnWidth(format: string): string {
  if (format === 'YYYY') {
    return '105px';
  }

  if (format.length < 3) {
    return '75px';
  }
}
