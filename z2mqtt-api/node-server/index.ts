import mqtt from "mqtt"
import events from "events"

events.setMaxListeners(100)

var MQTT_ADDR = "mqtt://MQTT_ADDR"
var MQTT_PORT = 1883;
var BUN_PORT = 3000;
let hasCheckedUpdates = false

let globalDeviceList: any[] = [];

var client = mqtt.connect(MQTT_ADDR, {
    port: MQTT_BROKER_URL,
    clientId: `mqtt_` + Math.random().toString(16).substr(2, 8),
    protocolId: 'MQTT',
    protocolVersion: 4,
    connectTimeout: 1000,
    keepalive : 120,
});

function startDeviceListListener() {
    const topic = "zigbee2mqtt/bridge/devices";

    client.subscribe(topic, (err) => {
        if (err) {
        console.error("Failed to subscribe to device list:", err);
        return;
        }

        console.log(`Subscribed to ${topic} for continuous updates.`);
    });

    client.on("message", (topicReceived, message) => {
        if (topicReceived === topic) {
        try {
            const parsed = JSON.parse(message.toString());
            if (Array.isArray(parsed)) {
            globalDeviceList = parsed;
            console.log("Device list updated:", parsed.length, "devices.");
            } else {
            console.warn("Received unexpected device list format:", parsed);
            }
        } catch (err) {
            console.error("Failed to parse device list message:", err);
        }
        }
    });

    // Initial trigger to request devices
    client.publish("zigbee2mqtt/bridge/request/devices", "");
}

client.on('disconnect', () => {
    console.warn('MQTT Client Offline, attempting reconnect...');
    client.reconnect();
});

client.on('connect', async function () {
    startDeviceListListener();
});


client.on('error', function (err) {
    console.log(err)
})

const getDevice : (find: string) => Promise<string[]> = async (find?: string) => {
    let _devices = globalDeviceList
    const query = find ? find : "0x44e2f8fffe46be33"
    let foundDevices = _devices.filter((i, idx)=> query == "all" || i.friendly_name == query || i.ieee_address == query).flatMap((item)=>item.friendly_name)
    console.log("fd", foundDevices, foundDevices.filter((device)=>{
	console.log(device !== "0x00124b0030d31e66" && device !== "Coordinator")
	return (device !== "0x00124b0030d31e66" && device !== "Coordinator")
    }))
    return foundDevices.filter((device)=>device !== "0x00124b0030d31e66" && device !== "Coordinator")
}

const server = Bun.serve({
    port: BUN_PORT,
    async fetch(request) {
        const url = new URL(request.url)
        const urlPath = url.pathname.split("/").slice(1);
        const device = (await getDevice(urlPath[1]))
        client.connected ? null : client.reconnect()
	if (urlPath[0] == "bar"){
	    let state;
            if (urlPath[1] == "toggle"){
                const r = await fetch(`http://192.168.178.40/toggle`)
                if (!r.ok){
                    return Response.json({status: "error", message: "Failed to toggle LED Strip"})
                }
                state = (await r.json()).state.toUpperCase() == "ON" ? true : false
            }
            else {
                state = urlPath[1].toLowerCase() == "on" || false
                const r = await fetch(`http://192.168.178.40/state?state=${state}`)
                if (!r.ok){
                    return Response.json({status: "error", message: "Failed to toggle LED Strip"})
                }
            }
            return Response.json({status: "OK", message: `Turned LED Strip ${state ? "ON" : "OFF"}`, state})
        }
    if (urlPath[0] == "turn"){
	console.log("d", device, (await getDevice(urlPath[1])));
        if (["min", "max"].includes(urlPath[2].toLowerCase())){
            device.forEach((d)=>{
                client.publish(`zigbee2mqtt/${d}/set`, JSON.stringify({ "brightness": urlPath[2].toLowerCase() == "min" ? 1 : 255}))
            })
            return Response.json({"status" : "OK", "message" : "All devices successfully turned brightness to "+urlPath[2].toUpperCase(), devices: device})
        }
        if (["on", "off"].includes(urlPath[2].toLowerCase())){
            device.forEach((d)=>{
                client.publish(`zigbee2mqtt/${d}/set`, JSON.stringify({ "state": urlPath[2].toUpperCase()}))
            })
            return Response.json({"status" : "OK", "message" : "All devices successfully turned "+urlPath[2].toUpperCase(), devices: device})
        }
    }
    if (urlPath[0] == "setBrightness"){
        let brightness = ((Number(url.searchParams.get("value")) >= 0 ? Math.min(Number(url.searchParams.get("value")), 100) : 100)/100)*255
        if (urlPath[1]){
            if (device[0]){
                client.publish(`zigbee2mqtt/${device[0]}/set`, JSON.stringify({ "brightness" : brightness }))
            }
            else {
                return Response.json({"status" : "error", "message" : `zero devices found with name: ${urlPath[1]}`})
            }
        }
        else {
            device.map((i : string)=>client.publish(`zigbee2mqtt/${i}/set`, JSON.stringify({ "brightness" : brightness })))
        }
        return Response.json({brightness : brightness})
    }
    if (urlPath[0] == "devices"){
        return Response.json(globalDeviceList);
    }
    if (urlPath[0] == "toggle"){
        try {
	    console.log(device)
            const topic = `zigbee2mqtt/${device[0]}`;
            const timeoutDuration = 30000;
            console.log(topic, timeoutDuration)
            const currentState = await publishAndWaitForResponse(
                topic,
                `${topic}/get`,
                JSON.stringify({ state: "", brightness: "" }),
                timeoutDuration
            );
            if (currentState.error) {
                return Response.json({ error: "Request timed out" }, { status: 408 });
            }

            const { brightness, state } = currentState.message;
            const newState = state === "ON" ? "OFF" : "ON";

            // Toggle the device state
            client.publish(`${topic}/set`, JSON.stringify({ state: newState }));

            return Response.json({ state: newState, brightness });
        } catch (error) {
            console.error("Error toggling device:", error);
            return Response.json({ error: "Failed to toggle device" }, { status: 500 });
        }
    }
    else {
        return new Response("Welcome to Bun!");
    }
}});

    function publishAndWaitForResponse(
        listenTopic: string,
        publishTopic: string,
        payload: string,
        timeout: number
    ): Promise<{ error?: string; message?: any }> {
        return new Promise((resolve, reject) => {
            let timeoutHandle: NodeJS.Timeout;

            // Listener for the response
            const messageHandler = (topic: string, message: Buffer) => {
                if (topic === listenTopic) {
                    clearTimeout(timeoutHandle);
                    client.off("message", messageHandler);

                    try {
                        resolve({ message: JSON.parse(message.toString()) });
                    } catch (err) {
                        reject(new Error("Invalid JSON response"));
                    }
                }
            };

            // Subscribe to the topic and attach the handler
            client.subscribe(listenTopic, (err) => {
                if (err) {
                    clearTimeout(timeoutHandle);
                    reject(err);
                }
            });

            client.on("message", messageHandler);

            // Publish the request
            client.publish(publishTopic, payload);

            // Handle timeout
            timeoutHandle = setTimeout(() => {
                client.off("message", messageHandler);
                client.unsubscribe(listenTopic);
                resolve({ error: "timeout" });
            }, timeout);
        });
    }