# Homebridge
This is my Homebridge setup, which integrates various smart home devices and emulates a HomeKit bridge. It allows for control of non-HomeKit devices through Apple's Home app and Siri.
Unfortunately, Homebridge does not support access from outside the local network since it is not a Verified HomeKit Bridge and only broadcasts its services over mDNS. mDNS is not broadcasted over the internet and is locally scoped.
> I could potentially set up a DNS record that resolves to the Homebridge server, but that doesn't seem to be properly supported by either Tailscale or Cloudflared.

### Installation
To install Homebridge, follow the steps on the [Homebridge GitHub page](https://github.com/homebridge/docker-homebridge).

### Plugins
- [HTTP-Switch](https://github.com/bauer-andreas/homebridge-http-switch) (Configuration in [`http_switch.json`](http_switch.json))
- [Zigbee2MQTT](https://z2m.dev/) (Configuration in [`zigbee2mqtt.json`](zigbee2mqtt.json))

