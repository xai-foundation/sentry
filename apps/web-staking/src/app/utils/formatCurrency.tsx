export const formatCurrency = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

export const formatCurrencyNoDecimals = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatCurrencyWithDecimals = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 18,
});

export const formatCurrencyCompact = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  notation: "compact",
});

export const hideDecimals = (value: string) => {
  if (value && value.includes(".")) {
    return value.slice(0, value.indexOf("."));
  }
  return value;
};

export const showUpToFourDecimals = (value: string) => {
  if (value && Number(value) < 0.0001) { 
     return "<0.0001";
  }

  if (value && value.includes(".")) {
    return value.slice(0, value.indexOf(".")+5);
  }
  return value;
};