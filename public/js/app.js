let socket = null;
(() => {
    // TODO, change for production
    // const URL = "http://127.0.0.1:3000/";
    const URL = "https://crane-jw42.herokuapp.com/";
    // socket = io(URL, { autoConnect: false });
    socket = io(URL);
})()
export default socket;
