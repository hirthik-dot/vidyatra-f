const AP_ORDER = [
  "AA:BB:CC:01",
  "AA:BB:CC:02",
  "AA:BB:CC:03",
  "AA:BB:CC:04",
  "AA:BB:CC:05"
];

exports.toVector = (wifiScan) =>
  AP_ORDER.map(ap => {
    const found = wifiScan.find(w => w.bssid === ap);
    return found ? found.rssi : -100;
  });
