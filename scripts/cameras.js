const cameras = {

    load: () => {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            return navigator.mediaDevices.enumerateDevices()
                .then(devices => {
                    var _devices = [];
                    devices.forEach((device) => {
                        if (device.kind == "videoinput") _devices.push(device);
                    });
                    return _devices;
                })
                .then(cameras => {
                    return cameras;
                })
                .catch(e => (console.log("Camera Enumeration:", e), null));
        } else {
            return Promise.resolve(false);
        }
    }

};