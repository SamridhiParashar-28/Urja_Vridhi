#include <SoftwareSerial.h>
SoftwareSerial esp(10, 11);  // RX=10, TX=11

// ── Pin definitions ───────────────────────────────────
const int RELAY[4]  = {4, 5, 6, 7};      // Relay IN1–IN4
const int SENSOR[4] = {A0, A1, A2, A3};  // ACS712 OUT pins

// ── ACS712 calibration ────────────────────────────────
// ACS712-05B = 185 mV/A  (5A  version — most common blue module)
// ACS712-20A = 100 mV/A  (20A version)
// ACS712-30A =  66 mV/A  (30A version)
// Check the chip marking on your IC to confirm version
const float SENSITIVITY = 185.0;  // mV per Amp — change if needed
const float VCC         = 5000.0; // Arduino supply mV
const float MV_PER_STEP = VCC / 1024.0;
const int   SAMPLES     = 150;    // samples per RMS calculation
                                  // 150 × ~133µs ≈ 20ms = 1 AC cycle at 50Hz

// Zero offset — run calibration first (see calibrateZero below)
// Default is 512 but real value may drift slightly
int zeroOffset[4] = {512, 512, 512, 512};

// ── Timing ────────────────────────────────────────────
unsigned long lastSensorSend = 0;
const unsigned long SENSOR_INTERVAL = 1000;

String buf = "";
int activeConnectionId = 0;

// ── AT helpers ────────────────────────────────────────
void sendAT(String cmd, int waitMs = 2000) {
  esp.println(cmd);
  unsigned long start = millis();
  while (millis() - start < waitMs) {
    while (esp.available()) Serial.write(esp.read());
  }
}

String sendATgetReply(String cmd, int waitMs = 3000) {
  esp.println(cmd);
  unsigned long start = millis();
  String reply = "";
  while (millis() - start < waitMs) {
    while (esp.available()) {
      char c = esp.read();
      Serial.write(c);
      reply += c;
    }
  }
  return reply;
}

// ── WiFi retry loop ───────────────────────────────────
void connectWiFi() {
  int attempt = 0;
  while (true) {
    attempt++;
    Serial.println("\n[DEBUG] WiFi Attempt #" + String(attempt));
    
    // Check if already connected first
    String check = sendATgetReply("AT+CWJAP?", 2000);
    if (check.indexOf("Yavi") >= 0) {
      Serial.println("[DEBUG] Already connected to Yavi!");
      return;
    }

    Serial.println("[DEBUG] Sending Join Command...");
    String joinCmd = "AT+CWJAP=\"Yavi\",\"Yavisod28\"";
    String reply = sendATgetReply(joinCmd, 15000);
    
    if (reply.indexOf("OK") >= 0 || reply.indexOf("WIFI CONNECTED") >= 0) {
      Serial.println("[DEBUG] Success: Connected to WiFi!");
      return;
    } else if (reply.indexOf("FAIL") >= 0) {
      Serial.println("[DEBUG] Error: Connection Failed (Check Password)");
    } else if (reply.length() < 5) {
      Serial.println("[DEBUG] Error: No response from ESP. Check Wiring/Baud Rate!");
    } else {
      Serial.println("[DEBUG] Unknown Response: " + reply);
    }

    Serial.println("[DEBUG] Retrying in 5 seconds...");
    delay(5000);
  }
}

// ── Auto-calibrate zero offsets (call with NO load) ───
void calibrateZero() {
  Serial.println("Calibrating zero offsets (ensure no load)...");
  for (int i = 0; i < 4; i++) {
    long sum = 0;
    for (int s = 0; s < 500; s++) {
      sum += analogRead(SENSOR[i]);
      delayMicroseconds(200);
    }
    zeroOffset[i] = sum / 500;
    Serial.print("Sensor ");
    Serial.print(i + 1);
    Serial.print(" zero = ");
    Serial.println(zeroOffset[i]);
  }
  Serial.println("Calibration done.");
}

// ── Read RMS current (Amps) from ACS712 ──────────────
float readCurrentRMS(int sensorIdx) {
  int pin = SENSOR[sensorIdx];
  int zero = zeroOffset[sensorIdx];
  long sumSq = 0;

  for (int i = 0; i < SAMPLES; i++) {
    int raw = analogRead(pin) - zero;
    sumSq += (long)raw * raw;
    delayMicroseconds(133);   // 150 samples × 133µs ≈ 20ms (50Hz cycle)
  }

  float rmsRaw  = sqrt((float)sumSq / SAMPLES);
  float rmsMv   = rmsRaw * MV_PER_STEP;
  float rmsAmps = rmsMv / SENSITIVITY;

  // Noise floor — readings below 0.05A treated as zero
  if (rmsAmps < 0.05) rmsAmps = 0.0;
  return rmsAmps;
}

// ── Send sensor readings to Python ───────────────────
void sendSensorData() {
  String data = "SENSOR";
  for (int i = 0; i < 4; i++) {
    float amps = readCurrentRMS(i);
    data += ":" + String(amps, 3);
  }
  
  // Add a simple "1" at the end to signify WiFi is still active from the Arduino's perspective
  data += ":1\n";

  esp.println("AT+CIPSEND=" + String(activeConnectionId) + "," + String(data.length()));
  delay(100);
  esp.print(data);
  // Serial.println("Sent: " + data); // Commented to reduce serial noise
}

// ── Setup ─────────────────────────────────────────────
void setup() {
  Serial.begin(9600);
  esp.begin(9600);

  for (int i = 0; i < 4; i++) {
    pinMode(RELAY[i], OUTPUT);
    digitalWrite(RELAY[i], HIGH);   // relays OFF at start
  }

  delay(3000);
  Serial.println("Starting...");

  Serial.println("Calibrating zero offsets (ensure no load)...");
  calibrateZero();

  Serial.println("[DEBUG] Testing AT communication...");
  sendAT("AT", 1000);
  
  Serial.println("[DEBUG] Resetting ESP8266 (Waiting 10s)...");
  sendAT("AT+RST", 10000); 
  
  Serial.println("[DEBUG] Setting Station Mode...");
  sendAT("AT+CWMODE=1", 2000);
  
  connectWiFi();

  Serial.println("Getting IP...");
  esp.println("AT+CIFSR");
  unsigned long t = millis();
  while (millis() - t < 5000) {
    while (esp.available()) Serial.write(esp.read());
  }
  Serial.println("--- IP ABOVE ---");

  sendAT("AT+CIPMUX=1", 1000);
  sendAT("AT+CIPSERVER=1,8080", 1000);
  sendAT("AT+CIPSTO=7200", 1000);
  Serial.println("=== READY ===");
}

// ── Loop ──────────────────────────────────────────────
void loop() {

  // Handle incoming relay commands from Python
  while (esp.available()) {
    char c = esp.read();
    Serial.write(c);
    buf += c;

    if (c == '\n') {
      buf.trim();
      
      // Update connection ID on new client connect
      if (buf.endsWith(",CONNECT")) {
        activeConnectionId = buf.substring(0, buf.indexOf(',')).toInt();
        Serial.println("[DEBUG] New connection ID: " + String(activeConnectionId));
      }

      if (buf.indexOf("+IPD") >= 0) {
        int colon = buf.indexOf(':');
        if (colon != -1) {
          String cmd = buf.substring(colon + 1);
          cmd.trim();

          // Also update activeConnectionId from IPD just in case
          int idStart = buf.indexOf("+IPD,") + 5;
          int idEnd = buf.indexOf(',', idStart);
          if (idStart > 4 && idEnd > idStart) {
            activeConnectionId = buf.substring(idStart, idEnd).toInt();
          }

          if (cmd.startsWith("R") && cmd.length() >= 4) {
            int rn = cmd.charAt(1) - '1';
            if (rn >= 0 && rn < 4) {

              if (cmd.endsWith("ON")) {
                digitalWrite(RELAY[rn], LOW);
                String ack = "OK:R" + String(rn + 1) + "ON\n";
                esp.println("AT+CIPSEND=" + String(activeConnectionId) + "," + String(ack.length()));
                delay(100);
                esp.print(ack);
                Serial.println("Relay " + String(rn + 1) + " ON");

              } else if (cmd.endsWith("OFF")) {
                digitalWrite(RELAY[rn], HIGH);
                String ack = "OK:R" + String(rn + 1) + "OFF\n";
                esp.println("AT+CIPSEND=" + String(activeConnectionId) + "," + String(ack.length()));
                delay(100);
                esp.print(ack);
                Serial.println("Relay " + String(rn + 1) + " OFF");
              }
            }
          }
        }
      }
      buf = "";
    }
  }

  // Send sensor data every 1 second
  if (millis() - lastSensorSend >= SENSOR_INTERVAL) {
    lastSensorSend = millis();
    sendSensorData();
  }

  // Echo Serial Monitor to ESP for debugging
  while (Serial.available()) {
    esp.write(Serial.read());
  }
}
