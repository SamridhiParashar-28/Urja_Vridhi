#include <SoftwareSerial.h>
SoftwareSerial esp(10, 11);

const int RELAY[4]  = {4, 5, 6, 7};
const int SENSOR[4] = {2, 3, 8, 9};

String buf = "";
unsigned long lastSensorSend = 0;

void sendAT(String cmd, int waitMs = 2000) {
  esp.println(cmd);
  unsigned long start = millis();
  while (millis() - start < waitMs) {
    while (esp.available()) {
      Serial.write(esp.read());
    }
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

bool connectWiFi() {
  int attempt = 0;
  while (true) {
    attempt++;
    Serial.print("WiFi attempt #");
    Serial.println(attempt);
    sendAT("AT+CWJAP=\"Airtel_sunil-EXT\",\"saibaba123*\"", 20000);
    String reply = sendATgetReply("AT+CWJAP?", 3000);
    if (reply.indexOf("Airtel_sunil") >= 0) {
      Serial.println("=== WiFi CONNECTED! ===");
      return true;
    }
    Serial.println("Not connected yet, retrying in 3s...");
    delay(3000);
  }
}

void setup() {
  Serial.begin(9600);
  esp.begin(9600);

  for (int i = 0; i < 4; i++) {
    pinMode(RELAY[i], OUTPUT);
    digitalWrite(RELAY[i], HIGH); // Relays OFF by default
  }

  for (int i = 0; i < 4; i++) {
    pinMode(SENSOR[i], INPUT);
  }

  delay(3000);
  Serial.println("Starting...");

  sendAT("AT", 1000);
  sendAT("AT+RST", 3000);
  sendAT("AT+CWMODE=1", 1000);

  connectWiFi();

  Serial.println("Getting IP...");
  esp.println("AT+CIFSR");
  unsigned long start = millis();
  while (millis() - start < 5000) {
    while (esp.available()) {
      char c = esp.read();
      Serial.write(c);
    }
  }
  Serial.println("--- IP ABOVE ---");

  sendAT("AT+CIPMUX=1", 1000);
  sendAT("AT+CIPSERVER=1,8080", 1000);
  sendAT("AT+CIPSTO=7200", 1000);

  Serial.println("=== READY ===");
}

void loop() {
  // ── Send sensor data every 500ms to all clients ──────────
  if (millis() - lastSensorSend >= 500) {
    lastSensorSend = millis();

    int s[4];
    for (int i = 0; i < 4; i++) {
      s[i] = (digitalRead(SENSOR[i]) == LOW) ? 1 : 0;
    }

    String json = "{\"t\":" + String(millis()) +
                  ",\"s\":[" +
                  String(s[0]) + "," +
                  String(s[1]) + "," +
                  String(s[2]) + "," +
                  String(s[3]) + "]}\n";

    Serial.print(json);

    for (int ch = 0; ch < 4; ch++) {
      String sendCmd = "AT+CIPSEND=" + String(ch) + "," + String(json.length());
      esp.println(sendCmd);
      delay(100);
      esp.print(json);
      delay(50);
    }
  }
  // ─────────────────────────────────────────────────────────

  // Read incoming TCP commands
  while (esp.available()) {
    char c = esp.read();
    Serial.write(c);
    buf += c;

    if (c == '\n') {
      buf.trim();

      if (buf.indexOf("+IPD") >= 0) {
        // Parse channel ID: +IPD,<channel>,<len>:data
        int comma1 = buf.indexOf(',');
        int comma2 = buf.indexOf(',', comma1 + 1);
        int colon = buf.indexOf(':');

        if (comma1 != -1 && colon != -1) {
          String channelStr = buf.substring(comma1 + 1, comma1 + 2);
          int ch = channelStr.toInt();
          
          String cmd = buf.substring(colon + 1);
          cmd.trim();

          // STATUS command
          if (cmd == "STATUS") {
            String ack = "R1:" + String(digitalRead(RELAY[0]) == LOW ? "ON" : "OFF") +
                         ",R2:" + String(digitalRead(RELAY[1]) == LOW ? "ON" : "OFF") +
                         ",R3:" + String(digitalRead(RELAY[2]) == LOW ? "ON" : "OFF") +
                         ",R4:" + String(digitalRead(RELAY[3]) == LOW ? "ON" : "OFF") + "\n";
            esp.println("AT+CIPSEND=" + String(ch) + "," + String(ack.length()));
            delay(100);
            esp.print(ack);
          }
          // Relay commands
          else if (cmd.startsWith("R") && cmd.length() >= 4) {
            int rn = cmd.charAt(1) - '1';
            if (rn >= 0 && rn < 4) {
              if (cmd.endsWith("ON")) {
                digitalWrite(RELAY[rn], LOW);
                String ack = "OK:R" + String(rn+1) + "ON\n";
                esp.println("AT+CIPSEND=" + String(ch) + "," + String(ack.length()));
                delay(100);
                esp.print(ack);
                Serial.println("Relay " + String(rn+1) + " ON");
              } else if (cmd.endsWith("OFF")) {
                digitalWrite(RELAY[rn], HIGH);
                String ack = "OK:R" + String(rn+1) + "OFF\n";
                esp.println("AT+CIPSEND=" + String(ch) + "," + String(ack.length()));
                delay(100);
                esp.print(ack);
                Serial.println("Relay " + String(rn+1) + " OFF");
              }
            }
          }
        }
      }
      buf = "";
    }
  }

  while (Serial.available()) {
    esp.write(Serial.read());
  }
}
