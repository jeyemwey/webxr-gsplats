# WebXR and GSplat.JS

This repo contains the working changes for the WebXR project.

You need [NodeJS](https://nodejs.org/en) and an HTTPS forwarder like [ngrok](https://ngrok.com/docs/getting-started/) on your computer to work with this project. With those installed, run:

```shell
# Fetch dependencies
npm install

# Start project
npm run dev

# in a separate console
ngrok http 5173
```

ngrok will provide you with a link (something like `https://abc-bla-bla.ngrok.io`) which you can open on your XR capable device.

If you have an Android and use Chrome both on the phone and on the desktop, you connect Chrome DevTools to the phone.
This is especially helpful to read console logs and work with traces and debugging symbols.
You need to connect the phone to the computer via USB debugging for this.
There's more information in the [Chrome Developers Documentation](https://developer.chrome.com/docs/devtools/remote-debugging/).


---
Masterprojekt im Studiengang Medientechnologie M.Sc. an der TH K&ouml;ln. Contact: <jvolklan@th-koeln.de>.