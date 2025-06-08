# My Home Sever
This is my home server setup, which includes various services and applications to manage my home network and personal projects.


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