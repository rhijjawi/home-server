# My Home Sever
This is my home server setup, which includes various services and applications to manage my home network and personal projects.


## Overview
### Products
#### Hardware
- 4x **Raspberry Pi 4**: The main server running most of the services.
- 1x **Raspberry Pi 5**: More powerful than the Raspberry Pi 4, used for specific tasks that require more processing power.
- 1x **ESP32**: Used for controlling the relay connected to the COB LED strip under my desk.

#### Lighting
- I have two IKEA bulbs that both support Zigbee communication. For this to work, you'll need a Zigbee Configurator. I use the [SONOFF USB Dongle](https://amzn.to/3Zl3CRR)<sup>[1](#notes)</sup>
- I use COB LED Strips. COB, or Chip-on-Board, LED strips are known for their high brightness and uniform light distribution. They're very well diffused and quite budget-friendly on AliExpress.

## Services
- [**Glance**](https://hijjawihome.xyz): A personal dashboard that opens on each new tab in the browser.
- [**Pi-Hole**](https://docs.pi-hole.net/): A network-wide ad blocker.
- [**Homebridge**](homebridge/README.md): A home automation hub that integrates various smart home devices and emulates a HomeKit bridge.
- [**Zigbee2MQTT**](https://www.zigbee2mqtt.io/): A bridge that connects Zigbee devices to MQTT, allowing for integration with various home automation systems.
  - [**Z2MQTT API**](z2mqtt-api/README.md): A self-hosted API for managing Zigbee devices over HTTP.
- [**ntfy**](https://github.com/binwiederhier/ntfy): A simple HTTP-based notification service.
- [**n8n**](https://github.com/n8n-io/n8n): A workflow automation tool that allows for the creation of complex workflows using a visual interface.
- [**mstate**](https://github.com/rhijjawi/mstate): A service that monitors the state of machines and devices in the home network using WebSockets - Built for stateless communication and uses a Pub/Sub model.
- [**shairport-sync**](https://github.com/mikebrady/shairport-sync): An AirPlay server that allows streaming audio to AirPlay-compatible devices.
- [**Tailscale**](https://tailscale.com/): A free service that provides secure access to devices behind NAT or firewalls.
- [**iperf**](https://iperf.fr/): A tool for measuring network performance between devices.

### Notes
[1] : If you plan on using a Raspberry Pi, you should also consider getting a USB Extension Cable, since the Coordinators are quite sensitive to interference and may not work properly if they are too close to the Raspberry Pi's Wi-Fi or Bluetooth antennas. You can get one [here](https://amzn.to/43Sy7Qz)