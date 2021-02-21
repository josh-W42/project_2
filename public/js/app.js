let socket = null;
(() => {
    // TODO, change for production
    const URL = "http://127.0.0.1:3000/";
    // socket = io(URL, { autoConnect: false });
    socket = io(URL);
})()
export default socket;
