export interface EmulateTrade {
  type: number,
  day: number,
  stock: number,
  tradeType: number,
  price: number,
  volume: number
};

export interface EmulateShare {
  type: number,
  day: number,
  stock: number,
  price: number,
  volume: number
};

export interface EmulateResult {
  type: number,
  day: number,
  money: number,
  share: number,
  gain: number
}

export interface EmulateStockResultItem {
    stock: number,
    priceBegin: number,
    dayBegin: number,
    priceEnd: number,
    dayEnd: number,
    rate: number,
    bonus: number
}