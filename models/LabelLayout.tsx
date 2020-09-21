export declare type LabelLayoutType = 'round_32mm_1up' | 'round_32mm_2up';

export interface LayoutOptions {
  units?: string;
  pointsPerUnit?: number;
  labelSize?: number;
  marginSize?: number;
  numCols?: number;
  columnGap?: number;
  sideTextWidth?: number;
  sideTextTop?: number;
  sideTextMargin?: number;
  topTextMargin?: number;
  bottomTextMargin?: number;
  fontSizePt?: number;
  numCopies?: number;
}

export class LabelLayout {
  units = 'mm';
  pointsPerUnit = 0.3528;
  labelSize = 28.6;
  marginSize = 1.7;
  numCols = 2;
  columnGap = 4;
  sideTextWidth = 4;
  sideTextTop = 11;
  sideTextMargin = 1.5;
  topTextMargin = 3;
  bottomTextMargin = 2.5;
  fontSizePt = 6;
  numCopies = 1;

  constructor(private options: LayoutOptions) {
    this.units = options.units || this.units;
    this.pointsPerUnit = options.pointsPerUnit || this.pointsPerUnit;
    this.marginSize = options.marginSize || this.marginSize;
    this.labelSize = options.labelSize || this.labelSize;
    this.numCols = options.numCols || this.numCols;
    this.columnGap = options.columnGap || this.columnGap;
    this.sideTextWidth = options.sideTextWidth || this.sideTextWidth;
    this.sideTextTop = options.sideTextTop || this.sideTextTop;
    this.sideTextMargin = options.sideTextMargin || this.sideTextMargin;
    this.topTextMargin = options.topTextMargin || this.topTextMargin;
    this.bottomTextMargin = options.bottomTextMargin || this.bottomTextMargin;
    this.fontSizePt = options.fontSizePt || this.fontSizePt;
  }

  get dimensions() {
    return {
      columnGap: this._toUnits(this.columnGap),
      sideTextWidth: this._toUnits(this.sideTextWidth),
      sideTextTop: this._toUnits(this.sideTextTop),
      sideTextMargin: this._toUnits(this.sideTextMargin),
      topTextMargin: this._toUnits(this.topTextMargin),
      bottomTextMargin: this._toUnits(this.bottomTextMargin),
      columnGapWidth: this._toUnits(this.columnGapWidth),
      marginWidth: this._toUnits(this.marginSize),
      labelSize: this._toUnits(this.labelSize),
      labelSizeWithMargins: this._toUnits(this.labelSizeWithMargins),
      pageWidth: this._toUnits(this.pageWidth),
      pageHeight: this._toUnits(this.pageHeight),
      fontSize: this._toUnits(this.fontSize),
    };
  }

  get columnGapWidth(): number {
    return this.columnGap;
  }

  get labelSizeWithMargins(): number {
    return (this.labelSize + (this.marginSize * 2));
  }

  get pageWidth(): number {
    return (this.labelSizeWithMargins * this.numCols) + (this.columnGap * this.numCols - 1);
  }

  get pageHeight(): number {
    return (this.labelSizeWithMargins * this.numCopies);
  }

  get fontSize(): number {
    return this.fontSizePt * this.pointsPerUnit;
  }

  private _toUnits(num: number) {
    return `${num}${this.units}`;
  }
}

export const labelLayouts = {
  round_32mm_1up: new LabelLayout({
    numCols: 1,
    columnGap: 0,
  }),
  round_32mm_2up: new LabelLayout({
    numCols: 2,
    columnGap: 1.3,
  }),
};
