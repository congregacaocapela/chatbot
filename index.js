// Importa as funções necessárias da biblioteca Baileys
const makeWASocket = require('@whiskeysockets/baileys').default;
const { DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

// Função principal assíncrona para conectar ao WhatsApp
async function connectToWhatsApp() {
    // 'useMultiFileAuthState' guarda a sua sessão (login) em ficheiros.
    // Assim, você não precisa de escanear o QR Code toda vez que reiniciar o bot.
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    // Cria um 'socket' (conexão) com o WhatsApp usando o estado de autenticação guardado
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true // Mostra o QR code no terminal
    });

    // Listener para o evento de atualização da conexão
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Se um QR Code for gerado, mostra-o no terminal
        if (qr) {
            console.log("QR Code recebido, escaneie com o seu telemóvel:");
            qrcode.generate(qr, { small: true });
        }

        // Se a conexão for fechada, verifica o motivo
        if (connection === 'close') {
            // Verifica se o motivo do fecho foi 'loggedOut' (deslogado manualmente)
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada devido a:', lastDisconnect.error, ', reconectando...', shouldReconnect);
            
            // Se não foi deslogado, tenta reconectar
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            // Se a conexão for aberta com sucesso
            console.log('Conexão aberta!');
        }
    });

    // Listener para salvar as credenciais sempre que forem atualizadas
    sock.ev.on('creds.update', saveCreds);

    // AQUI VAI A LÓGICA DO CHATBOT (Parte 3)
}

// Executa a função de conexão
connectToWhatsApp();