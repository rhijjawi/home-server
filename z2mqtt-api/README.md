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
## Endpoints

### `GET /turn/:device/:action`

- **Purpose**: Turn Zigbee device(s) on/off or set brightness to min/max.
- **:device**: `friendly_name` / `ieee_address` / `all`
- **:action**:
  - `on`: Turn device(s) **ON**
  - `off`: Turn device(s) **OFF**
  - `min`: Set brightness to **minimum (1)**
  - `max`: Set brightness to **maximum (255)**
- **Response**:
  ```json
  {
    "status": "OK",
    "message": "All devices successfully turned ON",
    "devices": ["device1", "device2"]
  }
  ```
### `GET /toggle/:device`
- **Purpose**: Toggle the state of a Zigbee device.
- **:device**: `friendly_name` / `ieee_address`
- **Response**: 
  ```json
    { "state": "ON" | "OFF", "brightness" }
  ```

### `GET /setBrightness/:device?value=x`
- **Purpose**: Set brightness of a device or all devices.
- **:device (optional)**: `friendly_name` / `ieee_address`
- **Query Param:**:
  - `value`: Brightness percentage (0-100)
- **Response**: 
  ```json
    { "brightness": 204 }
  ```
### `GET /bar/:state`
- **Purpose**: Set the state of the bar (e.g., COB LED strip).
- **:state**: `on` / `off`
- **Response**:
  ```json
  {
    "status": "OK",
    "message": "Turned LED Strip ON",
    "state": true
  }
  ```
### `GET GET /bar/toggle`
- **Purpose**: Toggle the state of the bar.
- **Response**:
  ```json
  {
    "status": "OK",
    "message": "Toggled LED Strip",
    "state": true
  }
  ```

### `/devices`
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
