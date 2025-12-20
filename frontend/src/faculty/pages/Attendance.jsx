import { useEffect, useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { API_BASE_URL } from "../../config/api";

/* MUI */
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  Avatar,
  IconButton,
  Divider,
  LinearProgress,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ClassIcon from "@mui/icons-material/Class";

/* Fix leaflet marker asset paths */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function FacultyAttendance() {
  const token = localStorage.getItem("token");

  /* ---------------- STATE ---------------- */
  const [qrCode, setQrCode] = useState("");
  const [expiresIn, setExpiresIn] = useState(30);
  const [className, setClassName] = useState("");
  const [periods, setPeriods] = useState([]);

  /* ---------------- LOCATION ---------------- */
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const locationWatcher = useRef(null);

  /* ---------------- FETCH QR ---------------- */
  const fetchQR = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/qr/current`);
      const data = await res.json();

      setQrCode(data?.qrCode || "");
      setExpiresIn(data?.expiresIn || 30);
    } catch (err) {
      console.error("QR fetch error:", err);
    }
  };

  /* ---------------- FETCH ATTENDANCE ---------------- */
  const fetchAttendanceData = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/faculty/attendance/day`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setClassName(data?.className || "");
      setPeriods(data?.periods || []);
    } catch (err) {
      console.error("Attendance fetch error:", err);
    }
  };

  /* ---------------- LOCATION HANDLER ---------------- */
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }

    setLocationStatus("loading");

    locationWatcher.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLocationStatus("success");
      },
      () => setLocationStatus("denied"),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  };

  /* ---------------- EFFECT ---------------- */
  useEffect(() => {
    fetchQR();
    fetchAttendanceData();

    const interval = setInterval(() => {
      fetchQR();
      fetchAttendanceData();
    }, 2000);

    return () => {
      clearInterval(interval);
      if (locationWatcher.current) {
        navigator.geolocation.clearWatch(locationWatcher.current);
      }
    };
  }, []);

  /* ---------------- STYLES ---------------- */
  const cardStyle = {
    background: "#ffffff",
    border: "1px solid rgba(15, 23, 42, 0.04)",
  };

  /* ---------------- UI ---------------- */
  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 4 }, bgcolor: "#f8fafc" }}>
      {/* HEADER */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Faculty Attendance
          </Typography>
          <Typography variant="body2" sx={{ color: "#334155", mt: 0.5 }}>
            Real-time classroom monitoring
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Paper sx={{ ...cardStyle, px: 2, py: 1, display: "flex" }}>
            <Avatar sx={{ mr: 1, bgcolor: "#eef2ff" }}>
              <QrCode2Icon />
            </Avatar>
            <Box>
              <Typography variant="caption">QR Refresh</Typography>
              <Typography sx={{ fontWeight: 700 }}>{expiresIn}s</Typography>
            </Box>
          </Paper>

          <Paper sx={{ ...cardStyle, px: 2, py: 1, display: "flex" }}>
            <Avatar sx={{ mr: 1, bgcolor: "#eef2ff" }}>
              <ClassIcon />
            </Avatar>
            <Box>
              <Typography variant="caption">Class</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {className || "Loading..."}
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Stack>

      {/* MAIN GRID */}
      <Grid container spacing={3}>
        {/* MAP + QR */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* MAP */}
            <Paper sx={{ p: 2, borderRadius: 3, ...cardStyle }}>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocationOnOutlined />
                  <Typography fontWeight={700}>Live Map</Typography>
                  <Chip
                    size="small"
                    label={
                      locationStatus === "success"
                        ? "Live"
                        : locationStatus === "loading"
                        ? "Locating"
                        : "Disabled"
                    }
                  />
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={requestLocation}
                  >
                    Enable Location
                  </Button>
                  <IconButton
                    onClick={() => {
                      fetchAttendanceData();
                      fetchQR();
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Stack>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              {locationStatus === "success" && location ? (
                <Box sx={{ height: 420 }}>
                  <MapContainer
                    center={[location.lat, location.lng]}
                    zoom={17}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Circle
                      center={[location.lat, location.lng]}
                      radius={30}
                      pathOptions={{
                        color: "#06b6d4",
                        fillOpacity: 0.12,
                      }}
                    />
                    <Marker position={[location.lat, location.lng]}>
                      <Popup>
                        Accuracy: {Math.round(location.accuracy)} m
                      </Popup>
                    </Marker>
                  </MapContainer>
                </Box>
              ) : (
                <Typography align="center" color="text.secondary">
                  Enable location to show map
                </Typography>
              )}
            </Paper>

            {/* QR */}
            <Paper sx={{ p: 2, borderRadius: 3, ...cardStyle }}>
              <Stack direction="row" justifyContent="space-between">
                <Stack>
                  <Typography fontWeight={700}>Live QR</Typography>
                  <Typography variant="body2">
                    Students scan to mark attendance
                  </Typography>
                </Stack>

                <Stack alignItems="center">
                  <QRCodeCanvas value={qrCode || "loading"} size={120} />
                  <LinearProgress
                    variant="determinate"
                    value={(expiresIn / 30) * 100}
                    sx={{ width: 140, mt: 1 }}
                  />
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* PERIOD LIST */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 3, ...cardStyle }}>
            <Typography fontWeight={700} mb={1}>
              Periods Today
            </Typography>

            {periods.length === 0 ? (
              <Typography color="text.secondary">
                No periods scheduled.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {periods.map((p, i) => (
                  <Paper key={i} sx={{ p: 2, borderRadius: 2 }}>
                    <Typography fontWeight={700}>
                      Period {p.period}: {p.subject}
                    </Typography>
                    <Typography variant="caption">
                      {p.start} - {p.end}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={1}>
                      <Chip label={`Present ${p.presentCount || 0}`} />
                      <Chip label={`Absent ${p.absentCount || 0}`} />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
