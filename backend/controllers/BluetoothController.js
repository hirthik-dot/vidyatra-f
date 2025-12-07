import { exec } from "child_process";

export const checkBluetoothAuth = (req, res) => {
  const targetDevice = "OPPO Reno14 5G";

  exec(
    `powershell -Command "Get-PnpDevice -Class Bluetooth | Select-Object -ExpandProperty FriendlyName"`,
    (err, stdout, stderr) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Bluetooth scan failed",
        });
      }

      const devices = stdout
        .split("\n")
        .map((d) => d.trim())
        .filter((d) => d.length > 0);

      console.log("=== BLUETOOTH DEBUG START ===");
      console.log("RAW OUTPUT:", stdout);
      console.log("PARSED DEVICES:", devices);
      console.log("=== BLUETOOTH DEBUG END ===");

      const found = devices.some((d) => d.includes(targetDevice));

      if (!found) {
        return res.status(403).json({
          success: false,
          message: "Required Bluetooth device not detected",
          detectedDevices: devices,
        });
      }

      return res.json({
        success: true,
        message: "Bluetooth Verified ✔ OPPO device detected",
      });
    }
  );
};
