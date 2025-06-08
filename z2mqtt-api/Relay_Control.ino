#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

#ifndef STASSID
#define STASSID "HijjawiHome"
#define STAPSK "smile007"
#endif

const char *ssid = STASSID;
const char *password = STAPSK;
int relay = 5;
int relayState = HIGH;
ESP8266WebServer server(80);

void setup(void) {
    Serial.begin(115200);
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    Serial.println("");
    pinMode(relay, OUTPUT);

    while (WiFi.status() != WL_CONNECTED) {
        digitalWrite(relay, HIGH);
        delay(500);
        digitalWrite(relay, LOW);
        delay(500);
    }

    if (MDNS.begin("esp8266")) { Serial.println("MDNS responder started"); }
    digitalWrite(relay, relayState);

    server.on("/state", HTTP_GET, SETSTATE);
    server.on("/toggle", HTTP_GET, TOGGLE);
    server.on("/", HTTP_GET, GETSTATE);
    server.begin();
    Serial.println("HTTP server started ");
    Serial.println(WiFi.localIP());
}

void SETSTATE(){
    String stateParam = server.arg("state");
    relayState = stateParam == "true" ? LOW : HIGH;
    digitalWrite(relay, relayState);
    String stateString = relayState == LOW ? "{\"state\":\"ON\"}" : "{\"state\":\"OFF\"}";
    server.send(200, "application/json", stateString);
}

void GETSTATE(){
    String stateString = relayState == LOW ? "{\"state\":\"ON\"}" : "{\"state\":\"OFF\"}";
    server.send(200, "application/json", stateString);
}

void TOGGLE(){
    relayState = !relayState;
    String stateString = relayState == LOW ? "{\"state\":\"ON\"}" : "{\"state\":\"OFF\"}";
    digitalWrite(relay, relayState);
    server.send(200, "application/json", stateString);
}
void loop() {  
    server.handleClient();
}