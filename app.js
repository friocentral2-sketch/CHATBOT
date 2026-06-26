// Lógica del Chatbot de Soporte y Consola de IA
document.addEventListener("DOMContentLoaded", () => {
    // Referencias de elementos del DOM
    const chatWidget = document.getElementById("chat-widget");
    const chatTrigger = document.getElementById("chat-trigger");
    const chatWindow = document.getElementById("chat-window");
    const chatClose = document.getElementById("chat-close");
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const chatSend = document.getElementById("chat-send");
    
    // Panel de Diagnóstico de IA
    const aiIntent = document.getElementById("ai-intent");
    const aiConfidence = document.getElementById("ai-confidence");
    const aiSlots = document.getElementById("ai-slots");
    const aiNode = document.getElementById("ai-node");
    const aiTicketGroup = document.getElementById("ai-ticket-group");
    const aiTicketJson = document.getElementById("ai-ticket-json");
    const ticketPriorityBadge = document.getElementById("ticket-priority-badge");

    // Estado del asistente
    let state = {
        currentNode: "PREGUNTAR_NOMBRE", // Nuevo nodo inicial
        userName: "", // Se llenará con la respuesta del usuario
        userId: "0105847293", 
        userCareer: "Robótica e Inteligencia Artificial",
        slots: {},
        ticket: null
    };

    // Inicializar chat con la primera pregunta
    setTimeout(() => {
        appendMessage("¡Hola! Soy **UcaBot**, tu asistente inteligente de soporte técnico. 🎓🤖\n\nPara empezar, ¿cuál es tu nombre?", "bot");
    }, 500);

    // Toggle ventana de chat
    chatTrigger.addEventListener("click", () => {
        chatWindow.classList.add("open");
        chatWidget.classList.add("active"); // Oculta botón y burbuja vía CSS
        
        // Quitar notificación si existe
        const notify = chatTrigger.querySelector(".badge-notify");
        if (notify) notify.remove();
    });

    chatClose.addEventListener("click", () => {
        chatWindow.classList.remove("open");
        chatWidget.classList.remove("active"); // Vuelve a mostrar botón y burbuja
    });

    // Evento de envío de mensaje
    chatSend.addEventListener("click", handleUserMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleUserMessage();
    });

    // Evento de botones de opción rápida
    document.addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains("quick-opt-btn")) {
            const action = e.target.getAttribute("data-action");
            handleQuickAction(action);
        }
    });

    // Manejador de opciones rápidas
    function handleQuickAction(action) {
        let text = "";
        if (action === "wifi") text = "Tengo problemas para conectarme al Wi-Fi Eduroam";
        else if (action === "password") text = "Olvidé mi contraseña de la plataforma E-Virtual";
        else if (action === "issue") text = "Quiero reportar un proyector dañado en el Bloque B";
        else if (action === "main_menu") {
            resetState();
            // Limpiar todos los mensajes anteriores para que se vea como la foto
            chatMessages.innerHTML = ""; 
            
            const botResponse = `¡Hola **${state.userName}**! 👋 Soy tu asistente de soporte técnico.\n\n¿Qué inconveniente tienes hoy?\n\n<div class="quick-options">
                <button class="quick-opt-btn" data-action="wifi">Opción A: Conexión Wi-Fi Eduroam</button>
                <button class="quick-opt-btn" data-action="password">Opción B: Recuperar Contraseña E-Virtual</button>
                <button class="quick-opt-btn" data-action="issue">Opción C: Reportar Daño Físico (Aula)</button>
            </div>`;
            
            // Un pequeño delay para que la transición sea suave
            setTimeout(() => {
                appendMessage(botResponse, "bot");
            }, 100);
            return;
        }
        
        chatInput.value = text;
        handleUserMessage();
    }

    // Procesar mensaje del usuario
    function handleUserMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Agregar mensaje del usuario al chat
        appendMessage(text, "user");
        chatInput.value = "";

        // 2. Procesar con NLP simulado y actualizar diagnóstico
        simulateNLP(text);

        // 3. Simular escritura del bot
        showTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator();
            const botResponse = getBotResponse(text);
            appendMessage(botResponse, "bot");
            // Auto scroll
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1200);
    }

    // Agregar mensaje visual al chat
    function appendMessage(text, sender) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender);
        
        // Convertir saltos de línea y Markdown simple (negritas)
        let formattedText = text.replace(/\n/g, "<br>");
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        messageDiv.innerHTML = `<div class="message-content">${formattedText}</div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Simular Typing
    function showTypingIndicator() {
        const indicator = document.createElement("div");
        indicator.classList.add("message", "bot", "typing-temp");
        indicator.innerHTML = `
            <div class="message-content" style="background-color: white;">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>`;
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = chatMessages.querySelector(".typing-temp");
        if (indicator) indicator.remove();
    }

    // ==========================================================================
    // MOTOR DE IA SIMULADO (NLP & MÁQUINA DE ESTADO)
    // ==========================================================================
    
    function simulateNLP(text) {
        const inputLower = text.toLowerCase();
        let intent = "Desconocido";
        let confidence = 0.0;

        // Clasificación de intenciones
        if (state.currentNode === "WIFI_APOYO" || inputLower.includes("wifi") || inputLower.includes("wi-fi") || inputLower.includes("red") || inputLower.includes("conectar")) {
            intent = "Soporte_Red_WiFi";
            confidence = 0.98;
        } else if (state.currentNode === "PASSWORD_RECUPERACION" || inputLower.includes("contraseña") || inputLower.includes("clave") || inputLower.includes("password") || inputLower.includes("virtual") || inputLower.includes("acceso")) {
            intent = "Recuperar_Contraseña";
            confidence = 0.97;
        } else if (state.currentNode === "AVERIA_AULAS" || inputLower.includes("daño") || inputLower.includes("avería") || inputLower.includes("dañado") || inputLower.includes("roto") || inputLower.includes("proyector") || inputLower.includes("aula") || inputLower.includes("bloque")) {
            intent = "Reportar_Averia_Fisica";
            confidence = 0.95;
        } else if (inputLower.includes("hola") || inputLower.includes("buenos") || inputLower.includes("asistente")) {
            intent = "Saludo_Inicial";
            confidence = 0.99;
        } else {
            intent = "Consulta_General";
            confidence = 0.72;
        }

        // Extracción de variables (Slots)
        // 1. Detección de Bloques en el campus
        const bloqueMatch = text.match(/bloque\s+([a-eA-E]|\d)/i);
        if (bloqueMatch) {
            state.slots.bloque = bloqueMatch[0].toUpperCase();
        }

        // 2. Identificación de dispositivo
        if (inputLower.includes("celular") || inputLower.includes("iphone") || inputLower.includes("android")) {
            state.slots.dispositivo = "Dispositivo Móvil";
        } else if (inputLower.includes("computadora") || inputLower.includes("laptop") || inputLower.includes("pc")) {
            state.slots.dispositivo = "Computadora Portátil";
        }

        // Actualizar Consola de IA en la pantalla lateral
        aiIntent.innerText = intent;
        aiConfidence.innerText = (confidence * 100).toFixed(1) + "%";
        aiSlots.innerText = JSON.stringify(state.slots, null, 4);
    }

    function getBotResponse(text) {
        const inputLower = text.toLowerCase();

        // Máquina de estados conversacional
        switch (state.currentNode) {
            case "PREGUNTAR_NOMBRE":
                state.userName = text;
                state.currentNode = "INICIO";
                aiNode.innerText = state.currentNode;
                
                // Actualizar el nombre en la interfaz del portal (opcional, para mayor realismo)
                const userNameDisplay = document.querySelector(".user-name");
                const userAvatarDisplay = document.querySelector(".user-avatar");
                if (userNameDisplay) userNameDisplay.innerText = state.userName;
                if (userAvatarDisplay) userAvatarDisplay.innerText = state.userName.substring(0, 2).toUpperCase();

                return `¡Hola **${state.userName}**! 👋 Soy tu asistente de soporte técnico.\n\n¿Qué inconveniente tienes hoy?\n\n<div class="quick-options">
                    <button class="quick-opt-btn" data-action="wifi">Opción A: Conexión Wi-Fi Eduroam</button>
                    <button class="quick-opt-btn" data-action="password">Opción B: Recuperar Contraseña E-Virtual</button>
                    <button class="quick-opt-btn" data-action="issue">Opción C: Reportar Daño Físico (Aula)</button>
                </div>`;

            case "INICIO":
                if (inputLower.includes("wifi") || inputLower.includes("wi-fi") || inputLower.includes("red")) {
                    state.currentNode = "WIFI_APOYO";
                    aiNode.innerText = state.currentNode;
                    return "Entiendo que tienes problemas con el **Wi-Fi Eduroam**. 🌐\n\n¿Estás intentando conectarte desde tu **celular** o desde una **laptop**?";
                } 
                else if (inputLower.includes("contraseña") || inputLower.includes("clave") || inputLower.includes("password") || inputLower.includes("virtual")) {
                    state.currentNode = "PASSWORD_RECUPERACION";
                    aiNode.innerText = state.currentNode;
                    return "Para recuperar tu acceso a la plataforma **E-Virtual**, necesito verificar tu identidad por seguridad.\n\nPor favor, ingresa tu **número de cédula** o código de estudiante:";
                }
                else if (inputLower.includes("daño") || inputLower.includes("dañado") || inputLower.includes("proyector") || inputLower.includes("averia")) {
                    state.currentNode = "AVERIA_AULAS";
                    aiNode.innerText = state.currentNode;
                    // Guardar slot de avería inicial
                    state.slots.tipo_incidente = "Avería de Hardware / Aulas";
                    return "Lamento el inconveniente técnico en el aula. Por favor, indícame en qué **Bloque** (ej. Bloque B, Bloque C) y aula te encuentras:";
                }
                else {
                    return "No estoy seguro de haber entendido completamente. ¿Podrías indicarme si tienes problemas de **Wi-Fi**, recuperación de **contraseña** o deseas reportar una **avería física** en las aulas?";
                }

            case "WIFI_APOYO":
                if (inputLower.includes("celular") || inputLower.includes("android") || inputLower.includes("iphone") || inputLower.includes("móvil")) {
                    state.slots.dispositivo = "Móvil";
                    state.currentNode = "RESUELTO";
                    aiNode.innerText = state.currentNode;
                    return "Excelente. Para dispositivos **Móviles**, el problema de conexión en la UCACUE suele deberse a la CA del certificado.\n\n**Sigue estos pasos:**\n1. Olvida la red 'Eduroam' en ajustes.\n2. Vuelve a seleccionar 'Eduroam'.\n3. En **Certificado CA**, selecciona *'No validar'* o *'Usar certificados del sistema'*.\n4. En identidad, escribe tu correo institucional completo.\n5. Ingresa tu contraseña y presiona Conectar.\n\n¿Lograste conectarte correctamente?";
                }
                else if (inputLower.includes("laptop") || inputLower.includes("computadora") || inputLower.includes("portatil")) {
                    state.slots.dispositivo = "Computadora";
                    state.currentNode = "RESUELTO";
                    aiNode.innerText = state.currentNode;
                    return "Perfecto. En computadoras portátiles, sigue estos pasos:\n1. Ve a configuración de red y elimina la red 'Eduroam' guardada.\n2. Revisa que el protocolo de seguridad sea **WPA2-Enterprise**.\n3. Ingresa tu correo universitario en el campo *Usuario* (ej: josue.robles.c@ucacue.edu.ec) e introduce tu clave.\n\n¿Esto solucionó tu problema?";
                }
                else {
                    return "Por favor, indícame si estás en un **celular** o una **computadora** para darte las instrucciones adecuadas.";
                }

            case "PASSWORD_RECUPERACION":
                // Simular validación del ID
                const numericId = text.replace(/\D/g, "");
                if (numericId.length >= 6) {
                    state.slots.estudiante_valido = true;
                    state.slots.cedula = numericId;
                    state.currentNode = "PASSWORD_SMS";
                    aiNode.innerText = state.currentNode;
                    return `¡Identidad confirmada!\nHemos encontrado al estudiante **${state.userName}** de la carrera de **${state.userCareer}**.\n\nHe enviado un código de seguridad de 6 dígitos a tu celular registrado (09****72). Por favor, ingrésalo aquí para continuar:`;
                } else {
                    return "El número ingresado no parece válido. Por favor, escribe tu número de cédula institucional de 10 dígitos:";
                }

            case "PASSWORD_SMS":
                state.currentNode = "RESUELTO";
                aiNode.innerText = state.currentNode;
                return `¡Código verificado con éxito! Tu contraseña temporal de E-Virtual ha sido restablecida.\n\nTu nueva contraseña es: **Ucacue.2026*r**\n\nPor seguridad, cámbiala en tu primer inicio de sesión.\n\n<div class="quick-options">
                    <button class="quick-opt-btn" data-action="main_menu">Volver al Menú Principal</button>
                </div>`;

            case "AVERIA_AULAS":
                // Espera recibir el bloque y aula
                state.slots.ubicacion = text;
                state.currentNode = "TICKET_CREACION";
                aiNode.innerText = state.currentNode;
                return "Perfecto, he tomado nota de la ubicación. Por favor, describe detalladamente el problema o avería que presenta el equipo:";

            case "TICKET_CREACION":
                state.slots.descripcion_falla = text;
                state.currentNode = "RESUELTO";
                aiNode.innerText = state.currentNode;

                // Generar ticket estructurado en JSON
                state.ticket = {
                    ticket_id: "TK-" + Math.floor(Math.random() * 90000 + 10000),
                    fecha_creacion: new Date().toISOString(),
                    solicitante: {
                        nombre: state.userName,
                        carrera: state.userCareer,
                        id: state.userId
                    },
                    incidente: {
                        categoria: "Averías de Infraestructura / Aulas",
                        descripcion: state.slots.descripcion_falla,
                        bloque: state.slots.bloque || "No especificado",
                        detalles_ubicacion: state.slots.ubicacion
                    },
                    prioridad: determinarPrioridad(state.slots.descripcion_falla),
                    asignado_a: "Soporte Técnico Físico - Nivel 2",
                    estado: "Abierto"
                };

                // Actualizar panel lateral de Diagnóstico con el Ticket JSON
                aiTicketJson.innerText = JSON.stringify(state.ticket, null, 4);
                ticketPriorityBadge.innerText = "Prioridad: " + state.ticket.prioridad;
                
                // Cambiar clases de color de prioridad
                ticketPriorityBadge.className = "badge badge-priority";
                if (state.ticket.prioridad === "Crítica") ticketPriorityBadge.style.backgroundColor = "#ef4444";
                else if (state.ticket.prioridad === "Alta") ticketPriorityBadge.style.backgroundColor = "#f97316";
                else ticketPriorityBadge.style.backgroundColor = "#eab308";

                aiTicketGroup.style.display = "block";

                return `Entendido. He registrado la avería de forma oficial.\n\nSe ha generado el **Ticket ${state.ticket.ticket_id}** asignado a Soporte Físico con prioridad **${state.ticket.prioridad}**.\nUn técnico se dirigirá al aula en un lapso máximo de 20 minutos.\n\n<div class="quick-options">
                    <button class="quick-opt-btn" data-action="main_menu">Volver al Menú Principal</button>
                </div>`;

            case "RESUELTO":
                return `¿Hay algo más en lo que pueda ayudarte?\n\n<div class="quick-options">
                    <button class="quick-opt-btn" data-action="main_menu">Volver al Menú Principal</button>
                </div>`;
                
            default:
                resetState();
                return "Disculpa, he tenido una inestabilidad de conexión. ¿Podríamos iniciar de nuevo? ¿Cuál es tu problema técnico?";
        }
    }

    // Auxiliar para determinar la prioridad del ticket de manera inteligente
    function determinarPrioridad(text) {
        const textLower = text.toLowerCase();
        if (textLower.includes("caída") || textLower.includes("corte total") || textLower.includes("quemado") || textLower.includes("urgente") || textLower.includes("fuego") || textLower.includes("servidor")) {
            return "Crítica";
        } else if (textLower.includes("dañado") || textLower.includes("roto") || textLower.includes("no enciende") || textLower.includes("sin señal")) {
            return "Alta";
        } else {
            return "Media";
        }
    }

    // Resetear el estado
    function resetState() {
        state.currentNode = "INICIO";
        state.slots = {};
        state.ticket = null;
        
        // Mantener datos de usuario
        aiNode.innerText = state.currentNode;
        aiIntent.innerText = "Esperando consulta...";
        aiConfidence.innerText = "-";
        aiSlots.innerText = "{}";
        aiTicketGroup.style.display = "none";
    }
});
