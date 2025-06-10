## Shairport-Sync

Shairport-Sync is a fork of the original Shairport project, which is an AirPlay audio player. It allows you to stream audio from Apple devices to other devices over a network. I used to combine it with [Spotifyd](https://github.com/Spotifyd/spotifyd), but unfortunately, I experienced issues with Spotifyd. Since I mainly use Apple Devices, I decided to switch to Shairport-Sync for a more reliable experience.

### Installation
> For a detailed guide, refer to the [official documentation](https://github.com/mikebrady/shairport-sync/blob/master/BUILD.md).
Shairport-Sync's installation process is cumbersome, so let the devs explain it to you.

### Configuration
> For a sample configuration file, refer to the [Sample Configuration file](https://github.com/mikebrady/shairport-sync/blob/master/scripts/shairport-sync.conf).
Here is my configuration file for Shairport-Sync, which I use on my Raspberry Pi 4:

```ini
general =
{
	name = "Home Speaker"; 
	default_airplay_volume = -4.0; // This is about 75% volume @ default.
};
```
