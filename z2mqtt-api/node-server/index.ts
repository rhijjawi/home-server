import mqtt from "mqtt";
import express, { type Request, type Response } from "express";
import { WebSocketServer } from 'ws'

const MQTT_ADDR = "mqtt://${MQTT_HOST_CHANGE}";
const MQTT_PORT = 1883;
const webserverPort = 3000;
let globalDeviceList: any[] = [];

if (MQTT_ADDR == "mqtt://${MQTT_HOST_CHANGE}") {
    console.error("Please set the MQTT_HOST_CHANGE environment variable to your MQTT broker address.");
    
}

const client = mqtt.connect(MQTT_ADDR, {
    port: MQTT_PORT,
    clientId: `mqtt_` + Math.random().toString(16).substr(2, 8),
    protocolId: 'MQTT',
    protocolVersion: 4,
    connectTimeout: 1000,
    keepalive : 120,
});

async function notifyWebSocketClients(data: {
    type: string;
    device?: string;
    deviceId?: string;
    state?: boolean;
}) {
    const message = JSON.stringify(data);
    wsServer.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    });
}

async function turnOffDevice(deviceId: string) {
    const topic = `zigbee2mqtt/${deviceId}`;
    await publishNoResponse(
        `${topic}/set`,
        JSON.stringify({ state: "OFF"}),
        5000
    )
    
}
async function turnOnDevice(deviceId: string, brightness: number|null) {
    const topic = `zigbee2mqtt/${deviceId}`;
    await publishNoResponse(
        `${topic}/set`,
        JSON.stringify({ state: "ON", brightness: brightness ? brightness : undefined }),
        5000
    )
    
}
async function getLightState(deviceId: string): Promise<any> {
    const topic = `zigbee2mqtt/${deviceId}`;
    const {message} = await publishAndWaitForResponse(
        topic,
        `${topic}/get`,
        JSON.stringify({ state: "", brightness: "" }),
        5000
    );
    return message;
}

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
    client.publish("zigbee2mqtt/bridge/request/devices", "");
}

client.on('connect', async function () {
    startDeviceListListener();
});

client.on('error', function (err) {
    console.log(err)
})

// Web server endpoints

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const wsServer = new WebSocketServer({ path : "/ws", server: app.listen(webserverPort, () => {
    console.log(`Web server is running on http://localhost:${webserverPort}`);
}) });

wsServer.on('connection', socket => {
    socket.on('error', err => console.error('Websocket error:', err))

    socket.send(JSON.stringify({ type: 'serverHello', message: 'hello' }))
})

app.get("/", (req, res) => {
    res.send("OK");
});

app.get("/devices", (req, res) => {
    res.json(globalDeviceList);
});
//@ts-ignore
app.get("/bar/:state", async(req : Request, res : Response) => {
    const actions = ["on", "off", "toggle"];
    const state = req.params.state.toLowerCase();
    if (actions.indexOf(state) === -1) {
        return res.status(400).json({ error: "Invalid state. Use 'on', 'off', or 'toggle'." });
    }
    let booleanState = state === "on" ? true : state === "off" ? false : null;
    if (state == "toggle") {
        const req = await fetch("http://192.168.178.40");
        const {state: currentState} = await req.json();
        booleanState = currentState === "ON" ? false : true;
    }
    try {
        const req = await fetch(`http://192.168.178.40/state?state=${booleanState}`)
        if (!req.ok) {
            return res.status(500).json({ error: "Failed to toggle LED Strip" });
        }
        const {state} = await req.json();
        notifyWebSocketClients({ type: "deviceStateChange", device: "ledStrip", state });
        return res.json({ status: "success", message: `LED Strip turned ${state}`, state });
    }
    catch (error) {
        console.error("Failed to fetch from LED Strip:", error);
        return res.status(500).json({ error: "Failed to toggle LED Strip" });
    }
})
//@ts-ignore
app.get("/:deviceId/:action", async(req, res) => {
    const actions = ["on", "off", "toggle", "setBrightness"];
    const { deviceId, action } = req.params;
    let brightness : number | null = null;
    if (!globalDeviceList.some(device => device.ieee_address === deviceId)) {
        return res.status(404).json({ error: "Device not found." });
    }
    if (!actions.includes(action)) {
        return res.status(400).json({ error: `Invalid action. Use ${actions.join(", ")}.` });
    }
    let newState = action === "on" ? true : action === "off" ? false : null;
    if (action === "toggle") {
        const {state, ...s} = await getLightState(deviceId);
        newState = state === "ON" ? false : true;
    }
    if (action === "setBrightness") {
        const _brightness = req.query.value ? Math.min(Math.max(Number(req.query.value), 0), 100) : 100;
        if (isNaN(_brightness)) {
            return res.status(400).json({ error: "Invalid brightness value. Must be a number between 0 and 100." });
        }
        brightness = Math.round((_brightness / 100) * 255);

    }
    newState ? await turnOnDevice(deviceId, brightness) : await turnOffDevice(deviceId);
    notifyWebSocketClients({ type: "deviceStateChange", deviceId, state: newState! });
    return res.json({ status: "OK", message: `Device ${deviceId} turned ${newState ? "ON" : "OFF"}`, state: newState });
})



async function publishNoResponse(
    publishTopic: string,
    payload: string,
    timeout: number = 5000
): Promise<void> {
    return new Promise((resolve, reject) => {
        const timeoutHandle = setTimeout(() => {
            reject(new Error("Publish timed out"));
        }, timeout);

        client.publish(publishTopic, payload, (err) => {
            clearTimeout(timeoutHandle);
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function publishAndWaitForResponse(
    listenTopic: string,
    publishTopic: string,
    payload: string,
    timeout: number = 5000
): Promise<{ error?: string; message?: any }> {
    return new Promise((resolve, reject) => {
        let timeoutHandle: Timer;

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