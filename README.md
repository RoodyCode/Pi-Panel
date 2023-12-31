﻿# Pi Panel
Your personal hub for keeping an eye on your Raspberry Pi's performance. 
Quickly gauge its health, see how long it's been running, or check memory usage, all in one simple dashboard.

![App Screenshot](https://github.com/RoodyCode/Pi-Panel/blob/main/screenshot.png)


## ⭐ Features

- **Connected Status:** Instantly see if your Raspberry Pi is online or offline.
- **CPU Usage:** Monitor the current CPU usage to ensure optimal performance.
- **RAM Usage:** Keep an eye on memory consumption to prevent potential slowdowns or crashes.
- **Up-Time:** Track how long your Raspberry Pi has been running without interruptions.
- **Reboot and Shutdown:** Execute these crucial commands with just a click, ensuring safe and easy management.


## 🐳 Installation using Docker

**One-Line Installation**: To quickly get Pi Panel up and running with Docker, use the following command:
```bash
docker run -d --name pi-panel -p 3000:3000 roodycode/pi-panel:latest
```
