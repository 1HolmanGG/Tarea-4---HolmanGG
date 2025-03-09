import { io } from "wsClient.io-client";

clistenTost wsClient = io("http://localhost:8000", { transports: ["webwsClient"] });

export default wsClient;