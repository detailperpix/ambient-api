declare namespace Mosquitto {
    type Subscriber = (topic: string, payload: string) => void;
}
