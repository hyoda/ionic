import {Component, Optional, ElementRef, Renderer, Input, Output, Provider, forwardRef, EventEmitter, HostListener, ViewEncapsulation} from 'angular2/core';
import {NG_VALUE_ACCESSOR} from 'angular2/common';

import {Picker, PickerColumn} from '../picker/picker';
import {Form} from '../../util/form';
import {Item} from '../item/item';
import {merge, isBlank, isString, isFunction, isDate, isTrueProperty, parseDate, DateParse} from '../../util/util';
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
  private _valueType: string;
  private _min: DateParse;
  private _max: DateParse;
  private _value: DateParse;

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
   * @input {string} The display format of the date and time input selections.
   * A datetime input can have one or many datetime parts, each getting their
   * own column which allow individual selection of that datetime part. Each
   * column follows the string parse format, and is separated by a `|` character.
   * Defaults to `MMM|D|YYYY`.
   */
  @Input() displayFormat: string;

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

  /**
   * @private
   */
  ngAfterViewInit() {

    //this._updOpts();
  }

  @HostListener('click', ['$event'])
  private _click(ev) {
    if (ev.detail === 0) {
      // do not continue if the click event came from a form submit
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();
    this._open();
  }

  @HostListener('keyup.space', ['$event'])
  private _keyup(ev) {
    if (!this._isOpen) {
      this._open();
    }
  }

  private _open() {
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
          this.onChange(null);
          this.change.emit(null);
        }
      }
    ];

    this.parseDisplay(picker);

    this._nav.present(picker, pickerOptions);

    this._isOpen = true;
    picker.onDismiss(() => {
      this._isOpen = false;
    });
  }

  setValue(val: any) {
    if (isBlank(val) || val === '') {
      this._value = null;

    } else {
      this._value = parseDate(val);

      if (!this._value.isValid) {
        printErrorMsg('input', val);
      }
    }
  }

  calcMinMax() {
    var today = new Date();
    var defaultMin = (today.getFullYear() - 100) + '-01-01T00:00:00Z';
    var defaultMax = today.getFullYear() + '-12-31T23:59:59Z';

    if (isBlank(this.min)) {
      this.min = defaultMin;
    }

    if (isBlank(this.max)) {
      this.max = defaultMax;
    }

    this._min = parseDate(this.min);
    this._max = parseDate(this.max);
  }

  parseDisplay(picker: Picker) {
    if (!isBlank(this.displayFormat)) {

      this.calcMinMax();

      this.displayFormat.split('|').forEach(columnFormat => {
        columnFormat = columnFormat.trim();
        if (columnFormat !== '') {
          this.parseColumn(picker, columnFormat);
        }
      });
    }
  }

  parseColumn(picker: Picker, columnFormat: string) {
    var column: PickerColumn = {
      options: []
    };

    columnFormat.match(FORMATTING_TOKENS).forEach(part => {
      part = part.trim();
      if (part !== '') {
        this.parsePart(part, column);
      }
    });

    if (column.options.length) {
      picker.addColumn(column);
    }
  }


  parsePart(part: string, column: PickerColumn) {
    var opts = column.options;

    if (part === 'YYYY' || part === 'YY') {
      // year
      var yr = this._max.year;
      while (yr >= this._min.year) {
        opts.push(part === 'YY' ? yr.toString().substr(2, 2) : yr);
        yr--;
      }

    } else if (part === 'MMMM' || part === 'MMM') {
      // month, full name
      for (var i = 0; i < 12; i++) {
        opts.push(part === 'MMM' ? MONTH_SHORT[i] : MONTH_FULL[i]);
      }

    } else if (part === 'MM' || part === 'M') {
      // month, numeric
      for (var i = 1; i <= 12; i++) {
        opts.push(part === 'MM' ? ('0' + i).slice(-2) : i);
      }

    } else if (part === 'DD' || part === 'D') {
      // date, numeric
      for (var i = 1; i <= 31; i++) {
        opts.push(part === 'DD' ? ('0' + i).slice(-2) : i);
      }

    } else if (part === 'HH' || part === 'H') {
      // 24-hour
      for (var i = 0; i < 24; i++) {
        opts.push(part === 'HH' ? ('0' + i).slice(-2) : i);
      }

    } else if (part === 'hh' || part === 'h') {
      // 12-hour
      for (var i = 1; i <= 12; i++) {
        opts.push(part === 'hh' ? ('0' + i).slice(-2) : i);
      }

    } else if (part === 'mm' || part === 'm') {
      // minutes
      for (var i = 0; i < 60; i++) {
        opts.push(part === 'mm' ? ('0' + i).slice(-2) : i);
      }

    } else if (part === 'A') {
      // AM/PM
      opts.push('AM', 'PM');

    } else if (part === 'a') {
      // am/pm
      opts.push('am', 'pm');

    }

  }

  /**
   * @private
   */
  get text() {
    return '';
  }

  /**
   * @private
   */
  private _updOpts() {

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
    //this._updOpts();
  }

  /**
   * @private
   */
  registerOnChange(fn: Function): void {
    this._fn = fn;
    this.onChange = (val: any) => {
      console.debug('datetime, onChange', val);
      fn(val);
      this.setValue(val);
      this._updOpts();
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
    this._updOpts();
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


const FORMATTING_TOKENS = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

function printErrorMsg(dateLabel: string, dateObj: any) {
  console.error(`Error parsing ${dateLabel} date: "${dateObj}". Please provide a valid Date object, or an ISO 8601 datetime format, such as "1994-12-15T13:47:20Z"`);
}


const DAY_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const DAY_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat"
];

const MONTH_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
