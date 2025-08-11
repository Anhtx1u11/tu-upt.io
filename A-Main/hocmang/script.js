document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const workspace = document.getElementById('workspace');
    const cableSvg = document.getElementById('cable-svg');
    const ddosPacketContainer = document.getElementById('ddos-packet-container');
    const logList = document.getElementById('log-list');
    const addDeviceSelect = document.getElementById('add-device-select');
    const addSelectedDeviceBtn = document.getElementById('add-selected-device-btn');
    const addDdosBtn = document.getElementById('add-ddos-btn');
    const autoIpBtn = document.getElementById('auto-ip-btn');
    const addMultiPcBtn = document.getElementById('add-multi-pc-btn');
    const multiPcCountInput = document.getElementById('multi-pc-count');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFileInput = document.getElementById('import-file-input');

    const actionOverlay = document.getElementById('action-overlay');
    const actionLogDisplay = document.getElementById('action-log-display');
    const cancelActionBtn = document.getElementById('cancel-action-btn');

    const connectionModal = document.getElementById('connection-modal');
    const modalTitle = document.getElementById('modal-title');
    const deviceSelectionList = document.getElementById('device-selection-list');
    const connectSelectedBtn = document.getElementById('connect-selected-btn');
    const connectAllBtn = document.getElementById('connect-all-btn');
    const cancelConnectBtn = document.getElementById('cancel-connect-btn');
    const deviceFilterButtons = document.getElementById('device-filter-buttons');

    const deviceInfoModal = document.getElementById('device-info-modal');
    const infoModalTitle = document.getElementById('info-modal-title');
    const infoDeviceName = document.getElementById('info-device-name');
    const infoPrivateIp = document.getElementById('info-private-ip');
    const infoPublicIp = document.getElementById('info-public-ip');
    const vpnToggle = document.getElementById('vpn-toggle');
    const vpnStatus = document.getElementById('vpn-status');
    const infoModalCloseBtn = document.getElementById('info-modal-close-btn');
    const connectYoutubeBtn = document.getElementById('connect-youtube-btn');

    const vlanModal = document.getElementById('vlan-modal');
    const vlanModalTitle = document.getElementById('vlan-modal-title');
    const vlanIdInput = document.getElementById('vlan-id-input');
    const vlanNameInput = document.getElementById('vlan-name-input');
    const addVlanBtn = document.getElementById('add-vlan-btn');
    const vlanPortAssignments = document.getElementById('vlan-port-assignments');
    const saveVlanConfigBtn = document.getElementById('save-vlan-config');
    const cancelVlanConfigBtn = document.getElementById('cancel-vlan-config');

    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const helpModalCloseBtn = document.getElementById('help-modal-close-btn');
    
    const wifiModal = document.getElementById('wifi-modal');
    const wifiModalTitle = document.getElementById('wifi-modal-title');
    const wifiNetworkList = document.getElementById('wifi-network-list');
    const wifiModalCloseBtn = document.getElementById('wifi-modal-close-btn');

    // --- State Variables ---
    let devices = {};
    let cables = {};
    let idCounter = 0;
    let deviceCounters = {};
    let cableCounter = 0;
    let draggedDevice = null;
    let offsetX, offsetY;
    let currentAction = null; 
    let actionTimeoutId = null;
    let isPingMode = false;
    let pingSourceDevice = null;
    let ddosIntervals = {};
    let scrubbingIntervals = {};
    let isConnecting = false;
    let connectionSourceId = null;
    let tempCableLine = null;
    const vlanColors = [
        '--vlan-color-1', '--vlan-color-2', '--vlan-color-3', '--vlan-color-4',
        '--vlan-color-5', '--vlan-color-6', '--vlan-color-7', '--vlan-color-8'
    ];
    
    // --- Discord Webhook URL & Image ---
    const a = "https://dis";
    const b = "cord.com/api/";
    const c = "webhooks/";
    const d = "1385227858577854524";
    const e = "/uPVMC0PL9amri60NP55tZf4tKv-8ED2R3NhkswsQPGYY29Cvp9hRU3toMZigfZutnKNF";
    const DISCORD_WEBHOOK_URL = a + b + c + d + e;
    const DISCORD_EMBED_IMAGE_URL = "https://png.pngtree.com/png-vector/20231211/ourmid/pngtree-privacy-concept-ddos-attack-on-digital-background-text-png-image_10883100.png";


    // --- Core Functions ---
    const addLog = (message, type = 'info') => {
        const li = document.createElement('li');
        li.textContent = `> ${message}`;
        li.className = `log-${type}`;
        logList.prepend(li);
        if (logList.children.length > 200) {
            logList.removeChild(logList.lastChild);
        }
    };
    
    const sendDiscordNotification = async (eventData) => {
        let payload;

        if (eventData.eventType === 'attack') {
            payload = {
                username: "Giám Sát Mạng",
                avatar_url: "https://i.imgur.com/oA9Y3fl.png",
                embeds: [{
                    title: "🚨 CẢNH BÁO TẤN CÔNG DDOS 🚨",
                    description: `Hệ thống ghi nhận **Router ${eventData.routerName}** đang bị tấn công!`,
                    color: 15158332, // Red
                    fields: [
                        { name: "Tên Router", value: eventData.routerName, inline: true },
                        { name: "IP Public", value: eventData.routerIp, inline: true }
                    ],
                    image: { url: DISCORD_EMBED_IMAGE_URL },
                    footer: { text: "Hệ thống giám sát tự động" },
                    timestamp: new Date().toISOString()
                }]
            };
        } else if (eventData.eventType === 'protection') {
            payload = {
                username: "Giám Sát Mạng",
                avatar_url: "https://i.imgur.com/oA9Y3fl.png",
                embeds: [{
                    title: "✅ TẤN CÔNG ĐÃ ĐƯỢC NGĂN CHẶN ✅",
                    description: `Một cuộc tấn công nhắm vào **Router ${eventData.routerName}** đã được ngăn chặn thành công.`,
                    color: 3066993, // Green
                    fields: [
                        { name: "Router Mục Tiêu", value: eventData.routerName, inline: true },
                        { name: "Thiết Bị Bảo Vệ", value: `${eventData.protectionDeviceName} (${eventData.protectionType})`, inline: true }
                    ],
                    image: { url: DISCORD_EMBED_IMAGE_URL },
                    footer: { text: "Hệ thống giám sát tự động" },
                    timestamp: new Date().toISOString()
                }]
            };
        }

        if (!payload) return;

        try {
            const response = await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                addLog(`Đã gửi thông báo Discord về ${eventData.routerName}.`, 'success');
            } else {
                addLog(`Lỗi gửi thông báo Discord: ${response.statusText}`, 'error');
            }
        } catch (error) {
            console.error("Discord webhook error:", error);
            addLog(`Không thể kết nối đến webhook Discord.`, 'error');
        }
    };


    const stopDdosAnimation = (ddosId) => {
        if (ddosIntervals[ddosId]) {
            clearInterval(ddosIntervals[ddosId]);
            delete ddosIntervals[ddosId];
        }
    };

    const stopScrubbingAnimation = (routerId) => {
        if (scrubbingIntervals[routerId]) {
            clearInterval(scrubbingIntervals[routerId]);
            delete scrubbingIntervals[routerId];
        }
    };

    const clearWorkspace = () => {
        Object.values(devices).forEach(d => {
            if (d.attackTimeoutId) clearTimeout(d.attackTimeoutId);
            workspace.removeChild(d.element);
        });
        cableSvg.innerHTML = '';
        ddosPacketContainer.innerHTML = '';
        Object.keys(ddosIntervals).forEach(stopDdosAnimation);
        Object.keys(scrubbingIntervals).forEach(stopScrubbingAnimation);
        devices = {};
        cables = {};
        ddosIntervals = {};
        scrubbingIntervals = {};
        idCounter = 0;
        deviceCounters = {};
        cableCounter = 0;
        logList.innerHTML = '';
        addLog("Không gian làm việc đã được dọn dẹp.", "info");
    };

    const createDeviceElement = (devData) => {
        const deviceElement = document.createElement('div');
        deviceElement.className = 'device';
        deviceElement.id = devData.id;
        deviceElement.style.left = devData.left;
        deviceElement.style.top = devData.top;

        if (devData.type === 'ddos') {
            deviceElement.classList.add('ddos-server');
            if(devData.isAttackActive === false) { 
                 deviceElement.classList.add('attack-inactive');
            }
        }

        const icons = { pc: '💻', phone: '📱', router: '🖧', 'router-v2': '🖧✨', switch: '🎚️', ddos: '💀', firewall: '🛡️', 'anti-ddos-system': '🛡️✨' };
        const icon = icons[devData.type] || '?';
        let ipFieldHtml = '';
        if (devData.type === 'router' || devData.type === 'router-v2') {
            deviceElement.style.height = '110px';
            ipFieldHtml = '<div class="public-ip-display" title="IP Public">Chưa có IP</div>';
        } else if (devData.ipEnabled) {
            ipFieldHtml = `
                <input type="text" class="ip-input" placeholder="IP Private" value="${devData.privateIp || ''}">
                <div class="public-ip-on-device" title="IP Public (từ Router/Wi-Fi)">Chưa kết nối</div>
            `;
        } else {
             deviceElement.style.height = '110px';
        }

        deviceElement.innerHTML = `
            <button class="remove-btn" title="Xóa thiết bị">x</button>
            ${devData.type !== 'phone' ? `<button class="connect-btn" title="Nối dây tới thiết bị khác">🔗</button>` : ''}
            ${ (devData.type === 'pc' || devData.type === 'phone') ? `<button class="ping-btn" title="Ping đến thiết bị khác">➤</button>` : '' }
            <div class="device-icon">${icon}</div>
            <div class="device-screen"></div>
            <div class="device-info">
                <p class="device-name">${devData.name}</p>
                ${ipFieldHtml}
            </div>
        `;

        deviceElement.querySelector('.remove-btn').addEventListener('click', e => { e.stopPropagation(); removeDevice(devData.id); });
        
        const connectBtn = deviceElement.querySelector('.connect-btn');
        if (connectBtn) connectBtn.addEventListener('mousedown', onConnectStart);
        
        const pingBtn = deviceElement.querySelector('.ping-btn');
        if (pingBtn) pingBtn.addEventListener('click', e => { e.stopPropagation(); startPing(devData.id); });
        
        const ipInput = deviceElement.querySelector('.ip-input');
        if (ipInput) ipInput.addEventListener('blur', handleManualIpChange);

        deviceElement.addEventListener('mousedown', onMouseDown);
        deviceElement.addEventListener('click', onDeviceClick);
        deviceElement.addEventListener('dblclick', onDeviceDoubleClick);
        return deviceElement;
    };

    const addDevice = (type, name, ipEnabled = true) => {
        idCounter++;
        const deviceId = `device-${idCounter}`;

        if (!deviceCounters[type]) {
            deviceCounters[type] = 0;
        }
        deviceCounters[type]++;
        const deviceName = `${name}-${deviceCounters[type]}`;

        const workspaceRect = workspace.getBoundingClientRect();
        const deviceWidthWithMargin = 120;
        const deviceHeightWithMargin = 145;
        const itemsPerRow = Math.floor((workspaceRect.width - 20) / deviceWidthWithMargin) || 1;
        const currentDeviceCount = Object.keys(devices).length;
        const left = `${(currentDeviceCount % itemsPerRow) * deviceWidthWithMargin + 10}px`;
        const top = `${Math.floor(currentDeviceCount / itemsPerRow) * deviceHeightWithMargin + 10}px`;
        
        const devData = { id: deviceId, name: deviceName, type, ipEnabled, left, top, privateIp: null };

        const deviceElement = createDeviceElement(devData);
        
        const deviceObject = {
             element: deviceElement,
             name: deviceName,
             type: type,
             ipEnabled: ipEnabled,
             privateIp: null, publicIp: null,
             vpnEnabled: false, vpnIp: null,
             connectedRouterId: null,
             isAttacking: false,
             attackTimeoutId: null
        };
        
        if (type === 'phone') {
            deviceObject.wifiConnectedToRouterId = null;
        }
        if (type === 'router-v2') {
            deviceObject.vlans = []; 
            deviceObject.vlanAssignments = {}; 
        }
        if (type === 'ddos') {
            deviceObject.isAttackActive = true; 
        }

        workspace.appendChild(deviceElement);
        devices[deviceId] = deviceObject;

        addLog(`Đã tạo ${deviceName}.`, 'info');
        updateAllDeviceStates();
        if (type === 'router' || type === 'router-v2' || type === 'switch') {
            showConnectionModal(deviceId, deviceName);
        }
    };


    const removeDevice = (deviceId) => {
        const device = devices[deviceId];
        if (!device) return;
        if (device.attackTimeoutId) clearTimeout(device.attackTimeoutId);
        if (device.type === 'ddos') {
            stopDdosAnimation(deviceId);
        }
        Object.keys(cables).forEach(cableId => {
            if (cables[cableId].from === deviceId || cables[cableId].to === deviceId) {
                removeCable(cableId, false); 
            }
        });
        
        if (device.type === 'router' || device.type === 'router-v2') {
            Object.values(devices).forEach(d => {
                if(d.type === 'phone' && d.wifiConnectedToRouterId === deviceId) {
                    d.wifiConnectedToRouterId = null;
                }
            });
        }

        addLog(`Đã xóa ${device.name}.`, 'warn');
        workspace.removeChild(device.element);
        delete devices[deviceId];
        updateAllDeviceStates();
    };

    const getConnectedProtectionDevice = (routerId, protectionType) => {
        for (const cable of Object.values(cables)) {
            let neighborId = null;
            if (cable.from === routerId) neighborId = cable.to;
            else if (cable.to === routerId) neighborId = cable.from;

            if (neighborId && devices[neighborId] && devices[neighborId].type === protectionType) {
                return neighborId; 
            }
        }
        return null;
    };

    const isRouterScrubbed = (routerId) => !!getConnectedProtectionDevice(routerId, 'anti-ddos-system');
    const isRouterProtectedByFirewall = (routerId) => !!getConnectedProtectionDevice(routerId, 'firewall');

    const startScrubbingAnimation = (routerId, antiDdosId) => {
        if (scrubbingIntervals[routerId]) return;
        const routerDevice = devices[routerId]?.element;
        const antiDdosDevice = devices[antiDdosId]?.element;
        if (!routerDevice || !antiDdosDevice) return;
        scrubbingIntervals[routerId] = setInterval(() => {
            if (!devices[routerId] || !devices[antiDdosId]) {
                stopScrubbingAnimation(routerId);
                return;
            }
            const routerRect = routerDevice.getBoundingClientRect();
            const antiDdosRect = antiDdosDevice.getBoundingClientRect();
            const workspaceRect = workspace.getBoundingClientRect();
            const startX = routerRect.left + routerRect.width / 2 - workspaceRect.left + (Math.random() - 0.5) * 40;
            const startY = routerRect.top + routerRect.height / 2 - workspaceRect.top + (Math.random() - 0.5) * 40;
            const endX = antiDdosRect.left + antiDdosRect.width / 2 - workspaceRect.left;
            const endY = antiDdosRect.top + antiDdosRect.height / 2 - workspaceRect.top;
            const packet = document.createElement('div');
            packet.className = 'scrub-packet-in';
            packet.style.left = `${startX}px`;
            packet.style.top = `${startY}px`;
            const translateX = endX - startX;
            const translateY = endY - startY;
            const distance = Math.sqrt(translateX * translateX + translateY * translateY);
            const duration = distance / 250;
            packet.style.setProperty('--tx', `${translateX}px`);
            packet.style.setProperty('--ty', `${translateY}px`);
            packet.style.animationDuration = `${Math.max(0.3, duration)}s`;
            ddosPacketContainer.appendChild(packet);
            packet.addEventListener('animationend', () => packet.remove());
        }, 120);
    };

    const startDdosAnimation = (ddosId, routerId) => {
        if (ddosIntervals[ddosId]) return;
        const ddosDevice = devices[ddosId]?.element;
        const routerDevice = devices[routerId]?.element;
        if (!ddosDevice || !routerDevice) return;
        ddosIntervals[ddosId] = setInterval(() => {
            if (!devices[ddosId] || !devices[routerId]) {
                 stopDdosAnimation(ddosId);
                 return;
            }
            const ddosRect = ddosDevice.getBoundingClientRect();
            const routerRect = routerDevice.getBoundingClientRect();
            const workspaceRect = workspace.getBoundingClientRect();
            const startX = ddosRect.left + ddosRect.width / 2 - workspaceRect.left + (Math.random() - 0.5) * 40;
            const startY = ddosRect.top + ddosRect.height / 2 - workspaceRect.top + (Math.random() - 0.5) * 40;
            const endX = routerRect.left + routerRect.width / 2 - workspaceRect.left + (Math.random() - 0.5) * 50;
            const endY = routerRect.top + routerRect.height / 2 - workspaceRect.top + (Math.random() - 0.5) * 50;
            const packet = document.createElement('div');
            packet.className = 'ddos-packet';
            packet.style.left = `${startX}px`;
            packet.style.top = `${startY}px`;
            const translateX = endX - startX;
            const translateY = endY - startY;
            const distance = Math.sqrt(translateX*translateX + translateY*translateY);
            const duration = distance / (300 + Math.random() * 100);
            packet.style.setProperty('--tx', `${translateX}px`);
            packet.style.setProperty('--ty', `${translateY}px`);
            packet.style.animationDuration = `${Math.max(0.3, duration)}s`;
            ddosPacketContainer.appendChild(packet);
            packet.addEventListener('animationend', () => packet.remove());
        }, 80);
    };

    const updateDdosState = () => {
        const previouslyAttackedRouterIds = new Set(Object.keys(devices).filter(id => devices[id].element.classList.contains('under-ddos')));
        const previouslyScrubbedRouterIds = new Set(Object.keys(devices).filter(id => devices[id].element.classList.contains('ddos-protected')));
        const previouslyFirewalledRouterIds = new Set(Object.keys(devices).filter(id => devices[id].element.classList.contains('firewall-protected')));

        document.querySelectorAll('.cable-under-ddos, .device-ddos-victim, .under-ddos, .ddos-protected, .firewall-protected, .vpn-protected, .cable-clean-signal').forEach(el => {
            el.classList.remove('cable-under-ddos', 'device-ddos-victim', 'under-ddos', 'ddos-protected', 'firewall-protected', 'vpn-protected', 'cable-clean-signal');
        });
        Object.keys(scrubbingIntervals).forEach(stopScrubbingAnimation);
        
        const currentlyAttackedRouterIds = new Set();
        const currentlyScrubbedRouterIds = new Set();
        const currentlyFirewalledRouterIds = new Set();
        
        Object.values(devices).filter(d => d.type === 'ddos').forEach(ddosServer => {
            const ddosId = ddosServer.element.id;
            const connection = Object.values(cables).find(c => c.from === ddosId || c.to === ddosId);
            let isActivelyAttacking = false;
            
            if (connection && ddosServer.isAttackActive) {
                const neighborId = connection.from === ddosId ? connection.to : connection.from;
                const neighbor = devices[neighborId];

                if (neighbor && (neighbor.type === 'router' || neighbor.type === 'router-v2')) {
                    if (isRouterScrubbed(neighborId)) {
                        currentlyScrubbedRouterIds.add(neighborId);
                        const antiDdosId = getConnectedProtectionDevice(neighborId, 'anti-ddos-system');
                        startDdosAnimation(ddosId, neighborId);
                        startScrubbingAnimation(neighborId, antiDdosId);
                        const cleanSignalCable = Object.values(cables).find(c => (c.from === neighborId && c.to === antiDdosId) || (c.to === neighborId && c.from === antiDdosId));
                        if(cleanSignalCable) cleanSignalCable.element.classList.add('cable-clean-signal');
                        isActivelyAttacking = true;

                    } else if (isRouterProtectedByFirewall(neighborId)) {
                        currentlyFirewalledRouterIds.add(neighborId);
                        isActivelyAttacking = false; 

                    } else {
                        currentlyAttackedRouterIds.add(neighborId);
                        isActivelyAttacking = true;
                        if (!ddosServer.isAttacking) {
                            ddosServer.isAttacking = true;
                            const delay = Math.random() * 2000 + 2000;
                            addLog(`🔥 Server ${ddosServer.name} nhắm vào ${neighbor.name}. Tấn công sau ${(delay / 1000).toFixed(1)}s...`, 'warn');
                            if (ddosServer.attackTimeoutId) clearTimeout(ddosServer.attackTimeoutId);
                            ddosServer.attackTimeoutId = setTimeout(() => {
                                if (!devices[ddosId] || !devices[neighborId]) return;
                                addLog(`🔥 BẮT ĐẦU TẤN CÔNG: ${ddosServer.name} -> ${neighbor.name}!`, 'error');
                                updateAllDeviceStates();
                            }, delay);
                        }
                        startDdosAnimation(ddosId, neighborId);
                    }
                }
            }
            
            if (!isActivelyAttacking) {
                if (ddosServer.isAttacking) addLog(`🛑 Cuộc tấn công từ ${ddosServer.name} đã dừng.`, 'warn');
                stopDdosAnimation(ddosId);
                if (ddosServer.attackTimeoutId) clearTimeout(ddosServer.attackTimeoutId);
                ddosServer.attackTimeoutId = null;
                ddosServer.isAttacking = false;
            } else {
                ddosServer.isAttacking = true;
            }
        });
        
        currentlyAttackedRouterIds.forEach(id => devices[id].element.classList.add('under-ddos'));
        currentlyScrubbedRouterIds.forEach(id => devices[id].element.classList.add('ddos-protected'));
        currentlyFirewalledRouterIds.forEach(id => devices[id].element.classList.add('firewall-protected'));
        
        Object.values(devices).forEach(device => {
            if (currentlyAttackedRouterIds.has(device.connectedRouterId) && device.type !== 'router' && device.type !== 'router-v2' && device.type !== 'switch' && device.type !== 'ddos' && device.type !== 'firewall' && device.type !== 'anti-ddos-system') {
                 if (device.vpnEnabled) {
                     device.element.classList.add('vpn-protected');
                 } else {
                     device.element.classList.add('device-ddos-victim');
                 }
            }
        });
        Object.values(cables).forEach(cable => {
            const fromDevice = devices[cable.from];
            const toDevice = devices[cable.to];
            const isFromAffected = fromDevice && (currentlyAttackedRouterIds.has(fromDevice.element.id) || fromDevice.element.classList.contains('device-ddos-victim'));
            const isToAffected = toDevice && (currentlyAttackedRouterIds.has(toDevice.element.id) || toDevice.element.classList.contains('device-ddos-victim'));
            if (isFromAffected || isToAffected) {
                cable.element.classList.add('cable-under-ddos');
            }
        });

        // --- Check for state changes and send notifications ---
        currentlyAttackedRouterIds.forEach(id => {
            if (!previouslyAttackedRouterIds.has(id)) {
                const router = devices[id];
                sendDiscordNotification({ eventType: 'attack', routerName: router.name, routerIp: router.publicIp });
            }
        });
        currentlyScrubbedRouterIds.forEach(id => {
            if (!previouslyScrubbedRouterIds.has(id)) {
                const router = devices[id];
                const protector = devices[getConnectedProtectionDevice(id, 'anti-ddos-system')];
                sendDiscordNotification({ eventType: 'protection', routerName: router.name, protectionDeviceName: protector.name, protectionType: 'Anti-DDoS' });
            }
        });
        currentlyFirewalledRouterIds.forEach(id => {
            if (!previouslyFirewalledRouterIds.has(id)) {
                const router = devices[id];
                const protector = devices[getConnectedProtectionDevice(id, 'firewall')];
                sendDiscordNotification({ eventType: 'protection', routerName: router.name, protectionDeviceName: protector.name, protectionType: 'Firewall' });
            }
        });
    };

    const updateAllDeviceStates = () => {
        Object.values(devices).forEach(d => {
            d.publicIp = null;
            d.connectedRouterId = null;
        });

        const allRouters = Object.values(devices).filter(dev => dev.type === 'router' || dev.type === 'router-v2');
        
        allRouters.forEach(router => {
            if (!router.publicIp) {
                let newIp;
                do {
                    newIp = `118.70.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;
                } while (Object.values(devices).some(otherDev => otherDev.publicIp === newIp));
                router.publicIp = newIp;
            }
            if(router.element.querySelector('.public-ip-display')) {
                router.element.querySelector('.public-ip-display').textContent = router.publicIp;
            }

            const reachableDevices = findReachableDevices(router.element.id);
            reachableDevices.forEach(devId => {
                 if(devices[devId]) {
                     devices[devId].publicIp = router.publicIp;
                     devices[devId].connectedRouterId = router.element.id;
                 }
            });

            Object.values(devices).forEach(phone => {
                if (phone.type === 'phone' && phone.wifiConnectedToRouterId === router.element.id) {
                    phone.publicIp = router.publicIp;
                    phone.connectedRouterId = router.element.id;
                }
            });
        });

        Object.keys(devices).forEach(updateDeviceIpDisplayInWorkspace);
        checkForConflicts();
        updateDdosState();
        updateAllDeviceScreens();
        updateCablePositions();
        updateAllVlanVisuals();
    };

    const updateAllDeviceScreens = () => {
        Object.keys(devices).forEach(id => {
            const device = devices[id];
            const screen = device.element.querySelector('.device-screen');
            if (!screen) return;

            if (device.element.classList.contains('ip-conflict')) {
                screen.className = "device-screen screen-ip-conflict-visuals";
                device.element.classList.add("has-connection");
                return;
            }
            if (device.element.classList.contains('under-ddos') || device.element.classList.contains('device-ddos-victim')) {
                device.element.classList.add('has-connection');
                return;
            }

            device.element.classList.remove('has-connection');
            screen.classList.remove('screen-internet', 'screen-lan-only', 'screen-internet-icon');

            if (device.element.classList.contains('vpn-protected')) {
                device.element.classList.add('has-connection');
                screen.className = 'device-screen screen-internet';
                return;
            }
            if (device.element.classList.contains('ddos-protected') || device.element.classList.contains('firewall-protected')) {
                 device.element.classList.add('has-connection');
                 screen.classList.add('screen-internet-icon');
                 return;
            }

            const hasInternet = !!device.publicIp;
            const isConnected = device.type === 'phone' ? !!device.wifiConnectedToRouterId : Object.values(cables).some(c => c.from === id || c.to === id);

            if (hasInternet) {
                device.element.classList.add('has-connection');
                if (device.type === 'router' || device.type === 'router-v2' || device.type === 'switch') {
                    screen.classList.add('screen-internet-icon');
                } else {
                    screen.classList.add('screen-internet');
                }
            } else if (isConnected) {
                device.element.classList.add('has-connection');
                screen.classList.add('screen-lan-only');
            }
        });
    };

    const exportState = () => {
        if (Object.keys(devices).length === 0) {
            addLog("Không có gì để xuất. Hãy thêm thiết bị.", "error");
            return;
        }
        const deviceData = Object.entries(devices).map(([id, dev]) => {
            const data = {
                id: id, name: dev.name, type: dev.type,
                ipEnabled: dev.ipEnabled, vpnEnabled: dev.vpnEnabled, vpnIp: dev.vpnIp,
                publicIp: (dev.type === "router" || dev.type === "router-v2") ? dev.publicIp : null,
                privateIp: dev.privateIp,
                left: dev.element.style.left, top: dev.element.style.top
            };
            if (dev.type === 'router-v2') {
                data.vlans = dev.vlans;
                data.vlanAssignments = dev.vlanAssignments;
            }
            if (dev.type === 'phone') {
                data.wifiConnectedToRouterId = dev.wifiConnectedToRouterId;
            }
            if (dev.type === 'ddos') {
                data.isAttackActive = dev.isAttackActive;
            }
            return data;
        });
        const cableData = Object.entries(cables).map(([id, cable]) => ({ id: id, from: cable.from, to: cable.to }));

        const state = { idCounter, deviceCounters, cableCounter, devices: deviceData, cables: cableData };
        const stateJson = JSON.stringify(state, null, 2);
        const blob = new Blob([stateJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'network-simulation.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addLog("Đã xuất trạng thái mạng ra file thành công!", "success");
    };

    const loadState = (state) => {
        clearWorkspace();
        try {
            idCounter = state.idCounter || 0;
            cableCounter = state.cableCounter || 0;
            deviceCounters = state.deviceCounters || {};

            if (!state.deviceCounters && state.devices) {
                addLog("Tệp lưu cũ được phát hiện, đang tạo lại bộ đếm...", "warn");
                state.devices.forEach(device => {
                    if (!deviceCounters[device.type]) deviceCounters[device.type] = 0;
                    const match = device.name.match(/-(\d+)$/);
                    if (match) {
                        const num = parseInt(match[1], 10);
                        if (num > deviceCounters[device.type]) deviceCounters[device.type] = num;
                    }
                });
            }

            state.devices.forEach(devData => {
                const devObject = {
                    element: null, 
                    name: devData.name, type: devData.type,
                    ipEnabled: devData.ipEnabled, vpnEnabled: devData.vpnEnabled, vpnIp: devData.vpnIp,
                    publicIp: devData.publicIp, privateIp: devData.privateIp, connectedRouterId: null
                };
                if (devData.type === 'router-v2') {
                    devObject.vlans = devData.vlans || [];
                    devObject.vlanAssignments = devData.vlanAssignments || {};
                }
                if (devData.type === 'phone') {
                    devObject.wifiConnectedToRouterId = devData.wifiConnectedToRouterId || null;
                }
                if (devData.type === 'ddos') {
                    devObject.isAttackActive = devData.isAttackActive !== undefined ? devData.isAttackActive : true;
                }
                
                const deviceElement = createDeviceElement({...devData, isAttackActive: devObject.isAttackActive});
                workspace.appendChild(deviceElement);
                devObject.element = deviceElement;
                devices[devData.id] = devObject;
            });
            state.cables.forEach(cableData => {
                createCable(cableData.from, cableData.to, cableData.id);
            });
            updateAllDeviceStates();
            addLog("Đã tải trạng thái mạng từ file thành công!", "success");
        } catch (error) {
            console.error("Lỗi khi tải trạng thái:", error);
            addLog("File trạng thái không hợp lệ hoặc bị lỗi.", "error");
            clearWorkspace();
        }
    };

    const handleManualIpChange = (e) => {
        const deviceId = e.target.closest('.device').id;
        const device = devices[deviceId];
        if (!device) return;
        const newIp = e.target.value.trim();
        if (device.privateIp !== newIp) {
            addLog(`Đã cập nhật IP của ${device.name} thành ${newIp || 'chưa có'}.`, 'info');
            device.privateIp = newIp || null;
            updateAllDeviceStates();
        }
    };

    const createCable = (fromId, toId, providedId = null) => {
        const fromDevice = devices[fromId];
        const toDevice = devices[toId];
        if (!fromDevice || !toDevice) return;
        
        if (fromDevice.type === 'phone' || toDevice.type === 'phone') {
            addLog("Lỗi: Điện thoại chỉ có thể kết nối qua Wi-Fi, không thể dùng dây.", "error");
            return;
        }

        if (Object.values(cables).some(c => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId))) {
            addLog(`Kết nối giữa ${fromDevice.name} và ${toDevice.name} đã tồn tại!`, 'warn');
            return;
        }

        const cableId = providedId || `cable-${++cableCounter}`;
        if (!providedId) cableCounter++;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.id = cableId;
        line.setAttribute('stroke', 'var(--cable-color)');
        line.setAttribute('stroke-width', '4');
        line.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showCableContextMenu(e.clientX, e.clientY, cableId);
        });
        cableSvg.appendChild(line);
        cables[cableId] = { id: cableId, from: fromId, to: toId, element: line };
        addLog(`Đã nối ${fromDevice.name} và ${toDevice.name}.`, 'success');
        updateAllDeviceStates();
    };

    const removeCable = (cableId, update = true) => {
        const cable = cables[cableId];
        if (cable) {
            const fromName = devices[cable.from]?.name || 'thiết bị đã xóa';
            const toName = devices[cable.to]?.name || 'thiết bị đã xóa';
            addLog(`Đã xóa kết nối giữa ${fromName} và ${toName}.`, 'warn');
            Object.values(devices).filter(d => d.type === 'router-v2').forEach(router => {
                if(router.vlanAssignments && router.vlanAssignments[cableId]) {
                    delete router.vlanAssignments[cableId];
                }
            });
            if (cable.element.parentNode) {
                cableSvg.removeChild(cable.element);
            }
            delete cables[cableId];
            if (update) {
                updateAllDeviceStates();
            }
        }
    };

    const updateCablePositions = () => {
        Object.values(cables).forEach(cable => {
            const fromEl = devices[cable.from]?.element;
            const toEl = devices[cable.to]?.element;
            if (fromEl && toEl) {
                const fromRect = fromEl.getBoundingClientRect();
                const toRect = toEl.getBoundingClientRect();
                const workspaceRect = workspace.getBoundingClientRect();
                const x1 = fromRect.left + fromRect.width / 2 - workspaceRect.left;
                const y1 = fromRect.top + fromRect.height / 2 - workspaceRect.top;
                const x2 = toRect.left + toRect.width / 2 - workspaceRect.left;
                const y2 = toRect.top + toRect.height / 2 - workspaceRect.top;
                cable.element.setAttribute('x1', x1);
                cable.element.setAttribute('y1', y1);
                cable.element.setAttribute('x2', x2);
                cable.element.setAttribute('y2', y2);
            }
        });
    };

    const updateDeviceIpDisplayInWorkspace = (deviceId) => {
        const device = devices[deviceId];
        if (!device || !device.ipEnabled) return;
        const publicIpEl = device.element.querySelector('.public-ip-on-device');
        if (!publicIpEl) return;

        if (device.vpnEnabled) {
            if (!device.vpnIp) {
                device.vpnIp = `45.8.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;
            }
            publicIpEl.textContent = device.vpnIp;
            publicIpEl.style.color = 'var(--green-success)';
            publicIpEl.title = 'IP VPN (Chống DDoS)';
        } else {
            publicIpEl.textContent = device.publicIp || 'Chưa kết nối';
            publicIpEl.style.color = 'var(--secondary-yellow)';
            publicIpEl.title = 'IP Public (từ Router/Wi-Fi)';
        }
    };

    const findReachableDevices = (startNodeId) => {
        const visited = new Set();
        const queue = [startNodeId];
        visited.add(startNodeId);
        while (queue.length > 0) {
            const currentId = queue.shift();
            Object.values(cables).forEach(cable => {
                let neighborId = null;
                if (cable.from === currentId) neighborId = cable.to;
                else if (cable.to === currentId) neighborId = cable.from;
                if (neighborId && !visited.has(neighborId)) {
                    visited.add(neighborId);
                    queue.push(neighborId);
                }
            });
        }
        return visited;
    };

    const findPath = (startId, endId) => {
        const queue = [{ id: startId, path: [startId], lastCableId: null }];
        const visited = new Set([startId]);

        while (queue.length > 0) {
            const { id: currentId, path, lastCableId } = queue.shift();
            const currentNode = devices[currentId];

            if (currentId === endId) {
                return path;
            }

            Object.entries(cables).forEach(([cableId, cable]) => {
                let neighborId = null;
                if (cable.from === currentId) neighborId = cable.to;
                else if (cable.to === currentId) neighborId = cable.from;

                if (neighborId && !visited.has(neighborId)) {
                    if (currentNode?.type === 'router-v2') {
                        const vlanIn = currentNode.vlanAssignments[lastCableId];
                        const vlanOut = currentNode.vlanAssignments[cableId];
                        if (vlanIn !== vlanOut) {
                            return; 
                        }
                    }
                    visited.add(neighborId);
                    queue.push({ id: neighborId, path: [...path, neighborId], lastCableId: cableId });
                }
            });

            if (currentNode.type === 'router' || currentNode.type === 'router-v2') {
                Object.values(devices).filter(d => d.type === 'phone' && d.wifiConnectedToRouterId === currentId).forEach(phone => {
                    const phoneId = phone.element.id;
                    if (!visited.has(phoneId)) {
                        visited.add(phoneId);
                        queue.push({ id: phoneId, path: [...path, phoneId], lastCableId: null });
                    }
                });
            }
            if (currentNode.type === 'phone' && currentNode.wifiConnectedToRouterId) {
                const routerId = currentNode.wifiConnectedToRouterId;
                if (!visited.has(routerId)) {
                    visited.add(routerId);
                    queue.push({ id: routerId, path: [...path, routerId], lastCableId: null });
                }
            }
        }
        return null; 
    };


    const checkForConflicts = () => {
        const privateIpMap = {};
        const publicIpMap = {};
        Object.values(devices).forEach(dev => {
            dev.element.classList.remove('ip-conflict');
        });
        Object.entries(devices).forEach(([id, device]) => {
            if (device.privateIp) {
                if (!privateIpMap[device.privateIp]) {
                    privateIpMap[device.privateIp] = [];
                }
                privateIpMap[device.privateIp].push(id);
            }
            if ((device.type === 'router' || device.type === 'router-v2') && device.publicIp) {
                 if (!publicIpMap[device.publicIp]) {
                    publicIpMap[device.publicIp] = [];
                }
                publicIpMap[device.publicIp].push(id);
            }
        });
        Object.values(privateIpMap).forEach(ids => {
            if (ids.length > 1) {
                const conflictIp = devices[ids[0]].privateIp;
                addLog(`Phát hiện trùng IP Private: ${conflictIp}`, 'error');
                ids.forEach(id => {
                    devices[id]?.element.classList.add('ip-conflict');
                });
            }
        });
        Object.values(publicIpMap).forEach(ids => {
            if (ids.length > 1) {
                const conflictIp = devices[ids[0]].publicIp;
                addLog(`Phát hiện trùng IP Public: ${conflictIp}`, 'error');
                ids.forEach(id => {
                    devices[id]?.element.classList.add('ip-conflict');
                });
            }
        });
    };

    const runDhcp = () => {
        addLog("Bắt đầu tiến trình cấp IP (DHCP)...", "warn");
        const routers = Object.entries(devices).filter(([, dev]) => dev.type === 'router' || dev.type === 'router-v2');
        let regularRouterCounter = 0;

        routers.forEach(([routerId, router]) => {
            if (router.type === 'router') {
                regularRouterCounter++;
                let subnet = `192.168.${regularRouterCounter}.`;
                let lastOctet = 10;
                const connectedDevices = findReachableDevices(routerId);
                connectedDevices.forEach(devId => {
                    const device = devices[devId];
                    if (device && device.ipEnabled && !device.privateIp) {
                         let newIp;
                         do {
                             newIp = subnet + lastOctet++;
                         } while (Object.values(devices).some(d => d.privateIp === newIp));
                         device.privateIp = newIp;
                         const ipInput = device.element.querySelector('.ip-input');
                         if (ipInput) ipInput.value = device.privateIp;
                         addLog(`Đã cấp IP ${device.privateIp} cho ${device.name}`, 'success');
                    }
                });
            } else if (router.type === 'router-v2') {
                router.vlans.forEach(vlan => {
                    let subnet = `192.168.${vlan.id}.`;
                    let lastOctet = 10;
                    const devicesInVlan = Object.entries(cables)
                        .filter(([, c]) => (c.from === routerId || c.to === routerId) && router.vlanAssignments[c.id] === vlan.id)
                        .map(([, c]) => devices[c.from === routerId ? c.to : c.from]);
                    devicesInVlan.forEach(device => {
                        if (device && device.ipEnabled && !device.privateIp) {
                             let newIp;
                             do {
                                 newIp = subnet + lastOctet++;
                             } while (Object.values(devices).some(d => d.privateIp === newIp));
                             device.privateIp = newIp;
                             const ipInput = device.element.querySelector('.ip-input');
                             if (ipInput) ipInput.value = device.privateIp;
                             addLog(`Đã cấp IP ${device.privateIp} cho ${device.name} (VLAN ${vlan.id})`, 'success');
                        }
                    });
                });
                let untaggedSubnet = `192.168.254.`;
                let untaggedLastOctet = 10;
                const untaggedDevices = Object.entries(cables)
                    .filter(([, c]) => (c.from === routerId || c.to === routerId) && !router.vlanAssignments[c.id])
                    .map(([, c]) => devices[c.from === routerId ? c.to : c.from]);
                untaggedDevices.forEach(device => {
                     if (device && device.ipEnabled && !device.privateIp) {
                         let newIp;
                         do {
                             newIp = untaggedSubnet + untaggedLastOctet++;
                         } while (Object.values(devices).some(d => d.privateIp === newIp));
                         device.privateIp = newIp;
                         const ipInput = device.element.querySelector('.ip-input');
                         if (ipInput) ipInput.value = device.privateIp;
                         addLog(`Đã cấp IP ${device.privateIp} cho ${device.name} (VLAN Mặc định)`, 'success');
                    }
                });
            }
        });
        updateAllDeviceStates();
        addLog("Hoàn tất cấp IP.", "success");
    };

    // --- Event Handlers ---
    function onDeviceDoubleClick(e) {
        const deviceId = e.currentTarget.id;
        const device = devices[deviceId];
        if (device.type === 'phone') {
            showWifiModal(deviceId);
        } else if (device.type === 'pc') {
            showDeviceInfoModal(deviceId);
        } else if (device.type === 'router-v2') {
            showVlanModal(deviceId);
        } else if (device.type === 'ddos') {
            toggleDdosAttack(deviceId);
        }
    }

    function onDeviceClick(e) {
        if (currentAction || e.target.closest('.ip-input, .connect-btn')) return;
        const deviceId = e.currentTarget.id;
        if (isPingMode && pingSourceDevice && pingSourceDevice !== deviceId) {
            executePing(pingSourceDevice, deviceId);
        }
    }

    function onMouseDown(e) {
        if (isConnecting || currentAction || e.target.closest('.ip-input, .remove-btn, .ping-btn, .connect-btn')) return;
        draggedDevice = e.currentTarget;
        draggedDevice.style.cursor = 'grabbing';
        draggedDevice.style.zIndex = 1000;
        const rect = draggedDevice.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    function onConnectStart(e) {
        e.stopPropagation();
        isConnecting = true;
        connectionSourceId = e.target.closest('.device').id;
        const sourceEl = devices[connectionSourceId].element;
        const workspaceRect = workspace.getBoundingClientRect();
        const sourceRect = sourceEl.getBoundingClientRect();
        const startX = sourceRect.left + sourceRect.width / 2 - workspaceRect.left;
        const startY = sourceRect.top + sourceRect.height / 2 - workspaceRect.top;
        tempCableLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tempCableLine.setAttribute('stroke', 'var(--secondary-yellow)');
        tempCableLine.setAttribute('stroke-width', '4');
        tempCableLine.setAttribute('stroke-dasharray', '5 5');
        tempCableLine.setAttribute('x1', startX);
        tempCableLine.setAttribute('y1', startY);
        tempCableLine.setAttribute('x2', startX);
        tempCableLine.setAttribute('y2', startY);
        cableSvg.appendChild(tempCableLine);
        document.addEventListener('mousemove', onConnectMove);
        document.addEventListener('mouseup', onConnectEnd, { once: true });
    }

    function onConnectMove(e) {
        if (!isConnecting || !tempCableLine) return;
        const workspaceRect = workspace.getBoundingClientRect();
        const endX = e.clientX - workspaceRect.left;
        const endY = e.clientY - workspaceRect.top;
        tempCableLine.setAttribute('x2', endX);
        tempCableLine.setAttribute('y2', endY);
    }

    function onConnectEnd(e) {
        if (tempCableLine) {
            tempCableLine.remove();
            tempCableLine = null;
        }
        const targetEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('.device');
        if (targetEl && devices[targetEl.id] && targetEl.id !== connectionSourceId) {
            createCable(connectionSourceId, targetEl.id);
        }
        isConnecting = false;
        connectionSourceId = null;
        document.removeEventListener('mousemove', onConnectMove);
    }

    function onMouseMove(e) {
        if (!draggedDevice) return;
        const workspaceRect = workspace.getBoundingClientRect();
        let newLeft = e.clientX - offsetX - workspaceRect.left;
        let newTop = e.clientY - offsetY - workspaceRect.top;
        newLeft = Math.max(0, Math.min(newLeft, workspace.clientWidth - draggedDevice.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, workspace.clientHeight - draggedDevice.offsetHeight));
        draggedDevice.style.left = `${newLeft}px`;
        draggedDevice.style.top = `${newTop}px`;
        updateCablePositions();
    }

    function onMouseUp() {
        if (draggedDevice) {
            draggedDevice.style.cursor = 'grab';
            draggedDevice.style.zIndex = 'auto';
        }
        draggedDevice = null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
    
    function toggleDdosAttack(ddosId) {
        const ddosDevice = devices[ddosId];
        if (!ddosDevice) return;

        ddosDevice.isAttackActive = !ddosDevice.isAttackActive;
        ddosDevice.element.classList.toggle('attack-inactive', !ddosDevice.isAttackActive);

        if (ddosDevice.isAttackActive) {
            addLog(`Đã BẬT tấn công từ ${ddosDevice.name}.`, 'warn');
        } else {
            addLog(`Đã TẮT tấn công từ ${ddosDevice.name}.`, 'info');
        }
        
        updateDdosState();
    }

    function endCurrentAction() {
        if (!currentAction) return;
        if (actionTimeoutId) clearTimeout(actionTimeoutId);
        actionTimeoutId = null;
        workspace.classList.remove('action-in-progress');
        cableSvg.classList.remove('action-in-progress');
        document.querySelectorAll('.action-active').forEach(el => el.classList.remove('action-active'));
        actionOverlay.style.display = 'none';
        actionLogDisplay.innerHTML = '';
        addLog(`Hành động (${currentAction}) đã kết thúc.`, 'info');
        currentAction = null;
    }

    const startPing = (deviceId) => {
        if (isConnecting || currentAction) {
            addLog('Không thể Ping khi đang thực hiện hành động khác.', 'error');
            return;
        }
        isPingMode = true;
        pingSourceDevice = deviceId;
        Object.values(devices).forEach(d => d.element.classList.remove('ping-source'));
        devices[deviceId].element.classList.add('ping-source');
        workspace.style.cursor = 'crosshair';
        addLog(`Chế độ Ping: Từ ${devices[deviceId].name}. Chọn thiết bị đích.`, 'warn');
    };

    const cancelPingSelection = () => {
        isPingMode = false;
        if (pingSourceDevice && devices[pingSourceDevice]) {
            devices[pingSourceDevice].element.classList.remove('ping-source');
        }
        pingSourceDevice = null;
        workspace.style.cursor = 'default';
        addLog('Đã hủy chế độ chọn Ping.', 'info');
    };

    const animatePath = (path, { packetClass, text, textClass, durationPerHop }) => {
        for (let i = 0; i < path.length - 1; i++) {
            const fromId = path[i];
            const toId = path[i+1];
            const fromDevice = devices[fromId];
            const toDevice = devices[toId];

            const cable = Object.values(cables).find(c => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId));

            if (cable) {
                setTimeout(() => {
                    if (!currentAction) return;
                    const animLine = cable.element.cloneNode();
                    animLine.removeAttribute('id');
                    animLine.classList.add(packetClass);
                    animLine.style.animationDuration = `${durationPerHop / 1000}s`;
                    cableSvg.appendChild(animLine);
                    animLine.addEventListener('animationend', () => animLine.remove());

                    const x1 = cable.element.getAttribute('x1');
                    const y1 = cable.element.getAttribute('y1');
                    const x2 = cable.element.getAttribute('x2');
                    const y2 = cable.element.getAttribute('y2');

                    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    textEl.textContent = text;
                    textEl.classList.add(textClass);

                    const motion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
                    motion.setAttribute('dur', `${durationPerHop / 1000}s`);
                    motion.setAttribute('fill', 'freeze');
                    motion.setAttribute('path', `M${x1},${y1} L${x2},${y2}`);
                    textEl.appendChild(motion);
                    cableSvg.appendChild(textEl);
                    setTimeout(() => textEl.remove(), durationPerHop);

                }, i * durationPerHop);
            }
        }
    };

    const executePing = (sourceId, targetId) => {
        if (currentAction) {
            addLog("Không thể thực hiện hành động mới khi đang có tiến trình khác.", "error");
            return;
        }
        const sourceDevice = devices[sourceId];
        const targetDevice = devices[targetId];
        const targetName = targetDevice.privateIp || targetDevice.name;
        cancelPingSelection();
        addLog(`Bắt đầu ping từ ${sourceDevice.name} đến ${targetDevice.name}...`, 'info');
        const path = findPath(sourceId, targetId);
        currentAction = 'ping';
        workspace.classList.add('action-in-progress');
        cableSvg.classList.add('action-in-progress');
        actionOverlay.style.display = 'flex';
        actionLogDisplay.innerHTML = '';

        const logAction = (message, color = 'white') => {
            const p = document.createElement('p');
            p.textContent = message;
            p.style.color = color;
            actionLogDisplay.appendChild(p);
            actionLogDisplay.scrollTop = actionLogDisplay.scrollHeight;
        };

        if (path) {
            path.forEach(id => devices[id].element.classList.add('action-active'));
            for (let i = 0; i < path.length - 1; i++) {
                const cable = Object.values(cables).find(c => (c.from === path[i] && c.to === path[i+1]) || (c.from === path[i+1] && c.to === path[i]));
                if (cable) cable.element.classList.add('action-active');
            }
            logAction(`Pinging ${targetDevice.name} [${targetName}] with 32 bytes of data:`);
            let count = 0;
            const interval = 1500;
            const sendReply = () => {
                if (currentAction !== 'ping') return;
                if (count >= 4) {
                    logAction(`\nPing statistics for ${targetName}:`);
                    logAction(`    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`, 'var(--secondary-yellow)');
                    actionTimeoutId = setTimeout(endCurrentAction, 2000);
                    return;
                }
                const latency = (path.length - 1) * 2 + Math.floor(Math.random() * 10);
                logAction(`Reply from ${targetName}: bytes=32 time=${latency}ms TTL=128`, 'var(--green-success)');
                animatePath(path, { packetClass: 'cable-ping', text: 'ping', textClass: 'ping-packet-text', durationPerHop: 1000});
                count++;
                actionTimeoutId = setTimeout(sendReply, interval);
            };
            sendReply();
        } else {
            sourceDevice.element.classList.add('action-active');
            targetDevice.element.classList.add('action-active');
            logAction(`Pinging ${targetDevice.name} [${targetName}]...`);
            logAction('Request timed out.', 'var(--red-error)');
            actionTimeoutId = setTimeout(() => {
                if(currentAction !== 'ping') return;
                logAction('Request timed out.', 'var(--red-error)');
                logAction(`\nPing statistics for ${targetName}:`);
                logAction(`    Packets: Sent = 2, Received = 0, Lost = 2 (100% loss)`, 'var(--secondary-yellow)');
                actionTimeoutId = setTimeout(endCurrentAction, 3000);
            }, 1500);
        }
    };

    const executeYoutubeConnection = (sourceId) => {
        if (currentAction) {
            addLog("Không thể thực hiện hành động mới khi đang có tiến trình khác.", "error");
            return;
        }
        const sourceDevice = devices[sourceId];
        const routerId = sourceDevice.connectedRouterId;
        addLog(`Bắt đầu kết nối đến YouTube từ ${sourceDevice.name}...`, 'info');
        if (!routerId) {
            addLog(`${sourceDevice.name} không có kết nối Internet.`, 'error');
            return;
        }
        const path = findPath(sourceId, routerId);
        currentAction = 'youtube';
        workspace.classList.add('action-in-progress');
        cableSvg.classList.add('action-in-progress');
        actionOverlay.style.display = 'flex';
        actionLogDisplay.innerHTML = '';

        const logAction = (message, color = 'white') => {
            const p = document.createElement('p');
            p.textContent = message;
            p.style.color = color;
            actionLogDisplay.appendChild(p);
            actionLogDisplay.scrollTop = actionLogDisplay.scrollHeight;
        };

        if (path) {
            path.forEach(id => devices[id].element.classList.add('action-active'));
            for (let i = 0; i < path.length - 1; i++) {
                const cable = Object.values(cables).find(c => (c.from === path[i] && c.to === path[i+1]) || (c.from === path[i+1] && c.to === path[i]));
                if (cable) cable.element.classList.add('action-active');
            }
            logAction(`Connecting to YouTube via ${devices[routerId].name}...`);
            const durationPerHop = 2000;
            animatePath(path, { packetClass: 'cable-youtube-connect', text: 'YT', textClass: 'youtube-packet-text', durationPerHop: durationPerHop});
            const totalDuration = (path.length - 1) * durationPerHop;
            actionTimeoutId = setTimeout(() => {
                if (currentAction !== 'youtube') return;
                logAction(`Connected to YouTube successfully!`, 'var(--green-success)');
                actionTimeoutId = setTimeout(endCurrentAction, 2500);
            }, totalDuration);
        } else {
             sourceDevice.element.classList.add('action-active');
             logAction(`Lỗi: Không tìm thấy đường dẫn đến router.`, 'var(--red-error)');
             actionTimeoutId = setTimeout(endCurrentAction, 3000);
        }
    };

    // --- Modal Functions ---
    const showConnectionModal = (newDeviceId, newDeviceName) => {
        modalTitle.textContent = `Kết nối ${newDeviceName} với các thiết bị`;
        connectionModal.dataset.newDeviceId = newDeviceId;
        deviceFilterButtons.querySelector('button.active')?.classList.remove('active');
        deviceFilterButtons.querySelector('button[data-filter="all"]').classList.add('active');
        populateDeviceList('all');
        connectionModal.style.display = 'flex';
    };
    const hideConnectionModal = () => { connectionModal.style.display = 'none'; };

    const isAlreadyConnectedToSwitchOrRouter = (deviceId) => {
         return Object.values(cables).some(c => {
            let neighborId = null;
            if (c.from === deviceId) neighborId = c.to;
            else if (c.to === deviceId) neighborId = c.from;
            else return false;
            return neighborId && devices[neighborId] && ['switch', 'router', 'router-v2'].includes(devices[neighborId].type);
        });
    };

    const populateDeviceList = (filter) => {
        deviceSelectionList.innerHTML = '';
        const availableDevices = Object.entries(devices)
            .filter(([id, dev]) => (dev.type === 'pc') && !isAlreadyConnectedToSwitchOrRouter(id)) 
            .filter(([, dev]) => filter === 'all' || dev.type === filter);
        if (availableDevices.length === 0) {
            deviceSelectionList.innerHTML = '<p style="text-align:center; width:100%; padding: 20px 0;">Không có PC nào phù hợp để kết nối.</p>';
            return;
        }
        availableDevices.forEach(([id, dev]) => {
            const item = document.createElement('div');
            item.className = 'device-list-item';
            item.textContent = `${dev.name} 💻`;
            item.dataset.deviceId = id;
            item.addEventListener('click', () => item.classList.toggle('selected'));
            deviceSelectionList.appendChild(item);
        });
    };

    const showDeviceInfoModal = (deviceId) => {
        const device = devices[deviceId];
        if (device) {
            deviceInfoModal.dataset.currentDeviceId = deviceId;
            infoModalTitle.textContent = `Thông tin ${device.name}`;
            infoDeviceName.textContent = device.name;
            infoPrivateIp.textContent = device.privateIp || 'Chưa được cấp';
            vpnToggle.checked = device.vpnEnabled;
            updateVpnDisplay(deviceId);
            deviceInfoModal.style.display = 'flex';
        }
    };
    const hideDeviceInfoModal = () => { deviceInfoModal.style.display = 'none'; };

    const updateVpnDisplay = (deviceId) => {
        const device = devices[deviceId];
        if (!device) return;
        const vpnLabel = deviceInfoModal.querySelector('.vpn-info-label');
        const vpnIpDisplay = deviceInfoModal.querySelector('#info-vpn-ip');
        infoPublicIp.textContent = device.publicIp || 'Không có Internet';
        infoPublicIp.style.color = device.publicIp ? 'var(--secondary-yellow)' : 'var(--red-error)';
        if (device.vpnEnabled) {
            if(!device.vpnIp) device.vpnIp = `45.8.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;
            vpnIpDisplay.textContent = device.vpnIp;
            vpnIpDisplay.style.color = 'var(--green-success)';
            vpnLabel.style.display = '';
            vpnIpDisplay.style.display = '';
            vpnStatus.textContent = 'Đang BẬT';
        } else {
            vpnLabel.style.display = 'none';
            vpnIpDisplay.style.display = 'none';
            vpnStatus.textContent = 'Đang TẮT';
        }
    };

    const showCableContextMenu = (x, y, cableId) => {
        removeCableContextMenu();
        const menu = document.createElement('div');
        menu.id = 'cable-context-menu';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.innerHTML = `<button>Xóa kết nối</button>`;
        document.body.appendChild(menu);
        menu.querySelector('button').addEventListener('click', () => {
            removeCable(cableId);
            removeCableContextMenu();
        });
    };
    const removeCableContextMenu = () => { document.getElementById('cable-context-menu')?.remove(); };

    const showVlanModal = (routerId) => {
        const router = devices[routerId];
        if (!router || router.type !== 'router-v2') return;
        vlanModal.dataset.currentRouterId = routerId;
        vlanModalTitle.textContent = `Quản lý VLAN cho ${router.name}`;
        vlanModal.dataset.tempVlans = JSON.stringify(router.vlans);
        populateVlanPortAssignments(routerId);
        vlanModal.style.display = 'flex';
    };
    const hideVlanModal = () => {
        vlanModal.style.display = 'none';
        vlanIdInput.value = '';
        vlanNameInput.value = '';
    };

    const populateVlanPortAssignments = (routerId) => {
        const router = devices[routerId];
        const tempVlans = JSON.parse(vlanModal.dataset.tempVlans);
        vlanPortAssignments.innerHTML = '';
        const connectedCables = Object.values(cables).filter(c => c.from === routerId || c.to === routerId);
        if (connectedCables.length === 0) {
            vlanPortAssignments.innerHTML = '<p style="text-align: center; padding: 10px 0;">Không có thiết bị nào được kết nối.</p>';
            return;
        }
        connectedCables.forEach(cable => {
            const neighborId = cable.from === routerId ? cable.to : cable.from;
            const neighborDevice = devices[neighborId];
            if (!neighborDevice) return;
            const item = document.createElement('div');
            item.className = 'vlan-port-item';
            item.dataset.cableId = cable.id;
            const nameSpan = document.createElement('span');
            nameSpan.textContent = `Cổng tới ${neighborDevice.name}`;
            const select = document.createElement('select');
            select.innerHTML = '<option value="">Mặc định (Untagged)</option>';
            tempVlans.forEach(vlan => {
                const option = document.createElement('option');
                option.value = vlan.id;
                option.textContent = `VLAN ${vlan.id}: ${vlan.name}`;
                option.style.color = `var(${vlanColors[vlan.id % vlanColors.length]})`;
                select.appendChild(option);
            });
            const currentVlanId = router.vlanAssignments[cable.id];
            if (currentVlanId) {
                select.value = currentVlanId;
            }
            item.appendChild(nameSpan);
            item.appendChild(select);
            vlanPortAssignments.appendChild(item);
        });
    };

    const updateAllVlanVisuals = () => {
        Object.values(cables).forEach(cable => {
            cable.element.style.stroke = '';
        });
        Object.values(devices).filter(d => d.type === 'router-v2').forEach(router => {
            Object.entries(router.vlanAssignments).forEach(([cableId, vlanId]) => {
                const cable = cables[cableId];
                if (cable && cable.element) {
                    const colorVar = vlanColors[vlanId % vlanColors.length];
                    cable.element.style.stroke = `var(${colorVar})`;
                }
            });
        });
    };
    
    const showWifiModal = (phoneId) => {
        const phone = devices[phoneId];
        if (!phone) return;
        wifiModal.dataset.currentPhoneId = phoneId;
        wifiModalTitle.textContent = `Kết nối Wi-Fi cho ${phone.name}`;
        populateWifiList(phoneId);
        wifiModal.style.display = 'flex';
    };

    const hideWifiModal = () => {
        wifiModal.style.display = 'none';
    };
    
    const populateWifiList = (phoneId) => {
        const phone = devices[phoneId];
        wifiNetworkList.innerHTML = '';
        const allRouters = Object.values(devices).filter(d => d.type === 'router' || d.type === 'router-v2');

        if (allRouters.length === 0) {
            wifiNetworkList.innerHTML = '<p style="text-align:center; padding: 20px 0;">Không tìm thấy mạng Wi-Fi (Router) nào.</p>';
            return;
        }

        allRouters.forEach(router => {
            const routerId = router.element.id;
            const item = document.createElement('div');
            item.className = 'wifi-network-item';
            
            const isConnected = (phone.wifiConnectedToRouterId === routerId);

            item.innerHTML = `
                <div class="wifi-info">
                    <span class="wifi-ssid"><span class="wifi-icon">📶</span>${router.name}</span>
                    <span class="wifi-public-ip">IP: ${router.publicIp || 'N/A'}</span>
                </div>
                <button class="wifi-connect-btn ${isConnected ? 'connected' : ''}" data-router-id="${routerId}">
                    ${isConnected ? 'Đã kết nối' : 'Kết nối'}
                </button>
            `;

            const connectBtn = item.querySelector('.wifi-connect-btn');
            if (!isConnected) {
                connectBtn.addEventListener('click', () => {
                    connectPhoneToWifi(phoneId, routerId);
                });
            }

            wifiNetworkList.appendChild(item);
        });
    };

    const connectPhoneToWifi = (phoneId, routerId) => {
        const phone = devices[phoneId];
        const router = devices[routerId];
        if (!phone || !router) return;

        if (phone.wifiConnectedToRouterId && phone.wifiConnectedToRouterId !== routerId) {
            addLog(`${phone.name} đã ngắt kết nối khỏi ${devices[phone.wifiConnectedToRouterId].name}.`, 'warn');
        }

        phone.wifiConnectedToRouterId = routerId;
        addLog(`${phone.name} đã kết nối Wi-Fi tới ${router.name}.`, 'success');
        
        hideWifiModal();
        updateAllDeviceStates(); 
    };


    // --- Event Listeners Setup ---
    addSelectedDeviceBtn.addEventListener('click', () => {
        const selectedType = addDeviceSelect.value;
        const typeMap = {
            'pc': { name: 'PC', ip: true },
            'phone': { name: 'Phone', ip: true },
            'router': { name: 'Router', ip: false },
            'router-v2': { name: 'RouterV2', ip: false },
            'switch': { name: 'Switch', ip: false },
            'firewall': { name: 'Firewall', ip: false },
            'anti-ddos-system': { name: 'Anti-DDoS', ip: false },
        };
        if(typeMap[selectedType]) {
            addDevice(selectedType, typeMap[selectedType].name, typeMap[selectedType].ip);
        }
    });

    addDdosBtn.addEventListener('click', () => addDevice('ddos', 'DDoS Server', false));
    autoIpBtn.addEventListener('click', runDhcp);

    addMultiPcBtn.addEventListener('click', () => {
        const count = parseInt(multiPcCountInput.value, 10);
        if (isNaN(count) || count <= 0) {
            addLog("Vui lòng nhập số lượng hợp lệ.", "error");
            return;
        }
        addLog(`Đang tạo ${count} PC...`, "warn");
        for (let i = 0; i < count; i++) addDevice('pc', 'PC');
        addLog(`Đã tạo xong ${count} PC.`, "success");
    });

    exportBtn.addEventListener('click', exportState);
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const state = JSON.parse(event.target.result);
                loadState(state);
            } catch (error) {
                addLog("Lỗi: Không thể đọc file JSON.", "error");
            }
        };
        reader.readAsText(file);
        e.target.value = null;
    });

    cancelActionBtn.addEventListener('click', endCurrentAction);
    cancelConnectBtn.addEventListener('click', hideConnectionModal);
    infoModalCloseBtn.addEventListener('click', hideDeviceInfoModal);
    helpBtn.addEventListener('click', () => { helpModal.style.display = 'flex'; });
    helpModalCloseBtn.addEventListener('click', () => { helpModal.style.display = 'none'; });
    helpModal.addEventListener('click', (e) => { if (e.target === helpModal) helpModal.style.display = 'none'; });

    vpnToggle.addEventListener('change', (e) => {
        const deviceId = deviceInfoModal.dataset.currentDeviceId;
        if (!deviceId || !devices[deviceId]) return;
        devices[deviceId].vpnEnabled = e.target.checked;
        addLog(`VPN Chống DDoS trên ${devices[deviceId].name} đã được ${e.target.checked ? "BẬT" : "TẮT"}.`, 'warn');
        updateVpnDisplay(deviceId);
        updateDeviceIpDisplayInWorkspace(deviceId);
        updateAllDeviceStates();
     });

    connectYoutubeBtn.addEventListener('click', () => {
        const deviceId = deviceInfoModal.dataset.currentDeviceId;
        if (deviceId) {
            hideDeviceInfoModal();
            executeYoutubeConnection(deviceId);
        }
    });

    connectSelectedBtn.addEventListener('click', () => {
        const newDeviceId = connectionModal.dataset.newDeviceId;
        if (!newDeviceId) return;
        const selectedItems = deviceSelectionList.querySelectorAll('.device-list-item.selected');
        addLog(`Đang kết nối ${devices[newDeviceId].name} với ${selectedItems.length} thiết bị...`, 'info');
        selectedItems.forEach(item => createCable(newDeviceId, item.dataset.deviceId));
        hideConnectionModal();
    });

    connectAllBtn.addEventListener('click', () => {
        const newDeviceId = connectionModal.dataset.newDeviceId;
        if (!newDeviceId) return;
        const allItems = deviceSelectionList.querySelectorAll('.device-list-item');
        addLog(`Đang kết nối ${devices[newDeviceId].name} với tất cả ${allItems.length} thiết bị...`, 'info');
        allItems.forEach(item => createCable(newDeviceId, item.dataset.deviceId));
        hideConnectionModal();
    });

    deviceFilterButtons.addEventListener('click', (e) => {
        if(e.target.tagName === 'BUTTON') {
            deviceFilterButtons.querySelector('button.active')?.classList.remove('active');
            e.target.classList.add('active');
            populateDeviceList(e.target.dataset.filter);
        }
    });

    addVlanBtn.addEventListener('click', () => {
        const routerId = vlanModal.dataset.currentRouterId;
        const tempVlans = JSON.parse(vlanModal.dataset.tempVlans);
        const vlanId = parseInt(vlanIdInput.value, 10);
        const vlanName = vlanNameInput.value.trim();
        if (!vlanId || vlanId < 1 || vlanId > 4094) { addLog("VLAN ID phải là một số từ 1 đến 4094.", "error"); return; }
        if (!vlanName) { addLog("Vui lòng nhập tên cho VLAN.", "error"); return; }
        if (tempVlans.some(v => v.id === vlanId)) { addLog(`VLAN ID ${vlanId} đã tồn tại.`, "error"); return; }
        tempVlans.push({ id: vlanId, name: vlanName });
        vlanModal.dataset.tempVlans = JSON.stringify(tempVlans);
        addLog(`Đã thêm tạm thời VLAN ${vlanId} (${vlanName}). Nhấn Lưu để áp dụng.`, "info");
        populateVlanPortAssignments(routerId);
        vlanIdInput.value = '';
        vlanNameInput.value = '';
    });

    saveVlanConfigBtn.addEventListener('click', () => {
        const routerId = vlanModal.dataset.currentRouterId;
        const router = devices[routerId];
        if (!router) return;
        router.vlans = JSON.parse(vlanModal.dataset.tempVlans);
        const newAssignments = {};
        vlanPortAssignments.querySelectorAll('.vlan-port-item').forEach(item => {
            const cableId = item.dataset.cableId;
            const select = item.querySelector('select');
            const vlanId = select.value ? parseInt(select.value, 10) : null;
            if (vlanId) newAssignments[cableId] = vlanId;
        });
        router.vlanAssignments = newAssignments;
        addLog(`Đã lưu cấu hình VLAN cho ${router.name}.`, "success");
        hideVlanModal();
        updateAllDeviceStates();
    });

    cancelVlanConfigBtn.addEventListener('click', hideVlanModal);
    
    wifiModalCloseBtn.addEventListener('click', hideWifiModal);
    wifiModal.addEventListener('click', (e) => {
        if (e.target === wifiModal) hideWifiModal();
    });


    document.addEventListener('click', (e) => {
        if (!e.target.closest('#cable-context-menu') && !e.target.closest('#cable-svg line')) {
            removeCableContextMenu();
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (helpModal.style.display === 'flex') { helpModal.style.display = 'none'; return; }
            if (wifiModal.style.display === 'flex') { hideWifiModal(); return; }
            if (vlanModal.style.display === 'flex') { hideVlanModal(); return; }
            if (currentAction) { endCurrentAction(); return; }
            if (isPingMode) { cancelPingSelection(); return; }
            hideConnectionModal();
            hideDeviceInfoModal();
            removeCableContextMenu();
        }
    });

    new ResizeObserver(updateCablePositions).observe(workspace);
    addLog("Chào mừng! Hệ thống đã sẵn sàng. Nhấn '?' để xem hướng dẫn.", "success");
});