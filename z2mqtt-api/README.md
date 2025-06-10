# Zigbee Lighting & Control API

## Overview
This is a self-hosted API for managing Zigbee devices over HTTP. It is designed to work with Zigbee2MQTT and provides a simple interface for controlling Zigbee devices.
As mentioned in the [README](../README.md), this API is used to control Zigbee devices, such as IKEA bulbs and COB LED strips, through a web interface or other HTTP clients.


## Technical Details
- **Base URL**: When running index.ts The API is accessible at `http://IP_ADDRESS`.
  - I wrote this in TS, using Bun and Bun's HTTP server. It's very messy, but it works (sometimes).
- **Dependencies**: The API uses the Zigbee's MQTT server to interact with Zigbee devices. Make sure you have Zigbee2MQTT running and configured properly. Replace the `MQTT_BROKER_URL` in the code with your MQTT broker's URL.
- **Authentication**: The API does not use authentication because I like my network a little spicy. If you'd like to add authentication, you can set up a firewall, header Bearer token, or any other method you prefer.
- **Data Format**: The API uses JSON for requests and responses.
- **WebSocket Support**: The API now supports WebSocket connections for real-time updates. You can connect to the WebSocket server at `ws://IP_ADDRESS/ws` to receive live updates on device states.
## Endpoints

### `GET /ws`
- **Purpose**: Establish a WebSocket connection for real-time updates on Zigbee device states.
- **Response**: 
  - On connection, the server will send a welcome message.
  - Whenever a device state changes, the server will broadcast an update message in the following format:
  ```json
  {
    "type": "deviceStateChange",
    "deviceId": "0xd44867fffe8c096b",
    "state": true
  }
  ```

### `GET /:deviceId/:action`

- **Purpose**: Turn Zigbee device(s) on/off or set brightness to min/max.
- **:device**: `friendly_name` / `ieee_address` / `all`
- **:action**:
  - `on`: Turn device(s) **ON**
  - `off`: Turn device(s) **OFF**
  - `setBrightness`: Set brightness to a specific value (0-100)
- **Response**:
  ```json
  { 
    "status": "OK", 
    "message": "Device {deviceId} turned {ON | OFF}", 
    "state": "ON" | "OFF", 
    "brightness_percent": "XX" // Only for setBrightness action - Z2M does not re-broadcast brightness changes when toggling on/off.
    }
  ```

### `GET /bar/:state`
- **Purpose**: Set the state of the bar (e.g., COB LED strip).
- **:state**: `on` / `off` / `toggle`
- **Response**:
  ```json
  { 
    "status": "success", 
    "message": "LED Strip turned ${ON | OFF}", "state" : "ON" | "OFF"}
  ```

### `GET /devices`
- **Purpose**: Get a list of all Zigbee devices.
- **Response**:
  ```json
  [
    {
      "ieee_address": "0x123...",
      "friendly_name": "lamp1",
      ...
    },
    ...
  ]
  ```
