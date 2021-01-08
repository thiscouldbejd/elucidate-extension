(function() {
  if (window.__ELUCIDATED__ === true) return true;
  window.__ELUCIDATED__ = true;
  
  var uuid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request) return;
    if (request.action == "show") {
      var _id = uuid();
      navigator.mediaDevices.getUserMedia({
        video: request.cameraId ? {
          deviceId: {
            exact : request.cameraId
          }
        } : {
          facingMode: "user"
        }
      }).then(stream => {

        sendResponse({
          reply: _id
        });

        var settings = stream.getVideoTracks()[0].getSettings();

        var holder = document.createElement("div");
        holder.setAttribute("class", "elucidate--video--holder");
        holder.setAttribute("id", `__elucidate_${_id}`);
        holder.setAttribute("style", "bottom: 10px; right: 10px;");
        holder.setAttribute("allowfullscreen", true);
        holder.setAttribute("mozallowfullscreen", true);
        holder.setAttribute("webkitallowfullscreen", true);

        var _fullscreen = (event) => {
          holder = holder.parentElement.removeChild(holder);
          if (document.fullscreenElement) {
            document.fullscreenElement.appendChild(holder);
          } else {
            document.body.appendChild(holder);
          }
        };

        var _drag = (element) => {
          
          var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

          var _mouseDrag = (event) => {
            event = event || window.event;
            event.preventDefault();

            pos1 = pos3 - event.clientX;
            pos2 = pos4 - event.clientY;
            pos3 = event.clientX;
            pos4 = event.clientY;
            
            element.parentElement.style.top = (element.parentElement.offsetTop - pos2) + "px";
            element.parentElement.style.left = (element.parentElement.offsetLeft - pos1) + "px";
            element.parentElement.style.right = "";
            element.parentElement.style.bottom = "";
          };

          var _mouseEnd = () => {
            document.onmouseup = null;
            document.onmousemove = null;
          };

          var _mouseDown = (event) => {
            event = event || window.event;
            event.preventDefault();
            if (event.button === 0) {
              pos3 = event.clientX;
              pos4 = event.clientY;
              document.onmouseup = _mouseEnd;
              document.onmousemove = _mouseDrag;
            }
            
          };
          element.onmousedown = _mouseDown;
        
        };

        var _resize = (element, target) => {

          var startX, startY, startWidth, startHeight, aspect;

          var _mouseDrag = (event) => {

            var _newWidth = startWidth + event.clientX - startX,
                _newHeight = startHeight + event.clientY - startY;

            var _target = (target || element.parentElement);
            _target.style["max-width"] = _target.style.width = `${event.clientX >= event.clientY ? _newWidth : _newHeight * aspect}px`;
            _target.style["max-height"] = _target.style.height = `${event.clientY > event.clientX ? _newHeight : _newWidth / aspect}px`;

          };

          var _mouseEnd = () => {
            document.onmouseup = null;
            document.onmousemove = null;
            document.documentElement.removeEventListener("mousemove", _mouseDrag, false);
              document.documentElement.removeEventListener("mouseup", _mouseEnd, false);
          };

          var _mouseStart = (event) => {
            event.preventDefault();
            if (event.button === 0) {
              startX = event.clientX;
              startY = event.clientY;
              startWidth = parseInt(document.defaultView.getComputedStyle(target || element.parentElement).width, 10);
              startHeight = parseInt(document.defaultView.getComputedStyle(target || element.parentElement).height, 10);
              aspect = aspect || (startWidth / startHeight);
              document.documentElement.addEventListener("mousemove", _mouseDrag, false);
              document.documentElement.addEventListener('mouseup', _mouseEnd, false);
            }
            
          };

          element.addEventListener("mousedown", _mouseStart, false);

        };

        var video = document.createElement("video");
        video.setAttribute("class", "elucidate--video");

        video.addEventListener("enterpictureinpicture", () => {
          holder.style.display = "none";
        });
        
        video.addEventListener("leavepictureinpicture", () => {
          holder.style.display = "";
        });

        holder.appendChild(video);

        var closer = document.createElement("a");
        closer.setAttribute("href", "#");
        closer.setAttribute("class", "elucidate--video--control elucidate--video--close");
        closer.appendChild(document.createTextNode("X"));
        closer.addEventListener("click", (event) => {
          event.preventDefault();
          if (stream && stream.getVideoTracks) {
            var _stream = stream.getVideoTracks()[0];
            if (_stream && _stream.stop) _stream.stop();
          }
          holder.parentElement.removeChild(holder);
          document.removeEventListener("fullscreenchange", _fullscreen);
        });
        holder.appendChild(closer);

        var resizer = document.createElement("a");
        resizer.setAttribute("href", "#");
        resizer.setAttribute("class", "elucidate--video--control elucidate--video--resize");
        resizer.appendChild(document.createTextNode("⇲"));
        _resize(resizer, video);
        holder.appendChild(resizer);

        document.body.appendChild(holder);

        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        video.setAttribute("muted", true);
        if (settings.facingMode == "user") video.style.transform = "scaleX(-1)";

        document.addEventListener("fullscreenchange", _fullscreen);
        _drag(video);
        video.play();
      }).catch(e => {
        if (/(permission dismissed)|(permission denied)/i.test(e)) {
          sendResponse({
            reply: false
          });
        } else {
          console.log("Camera Media Request Failed", e);
        }
      });
      return true;
    } else if (request.action == "ping") {
      sendResponse({
        reply: "pong"
      });
    }
  });
  console.log("ELUCIDATE INJECTED");
})();