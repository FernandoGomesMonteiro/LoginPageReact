import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const socket = io("http://localhost:5000");

const Contact = ({ name, bgColor }) => (
  <div className="flex items-center space-x-4 cursor-pointer hover:bg-gray-700 p-3 rounded-lg transition duration-300">
    <div className={`w-12 h-12 ${bgColor} rounded-full`}></div>
    <span className="text-lg font-medium">{name}</span>
  </div>
);

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token)?.user : null;

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      console.error("Usuário não autenticado.");
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:5000/chat/load_messages");
        if (isMounted) setMessages(response.data);
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
      }
    };

    fetchMessages();

    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => {
        if (prevMessages.some((msg) => msg.id === data.id)) return prevMessages;
        return [...prevMessages, data];
      });
    });

    return () => {
      isMounted = false;
      socket.off("receive_message");
    };
  }, [user]);

  const handleSendMessage = () => {
    if (message.trim() !== "" && user) {
      const payload = { user_id: user.id, username: user.nome, message };
      socket.emit("send_message", payload);
      setMessage("");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-blue-400 to-blue-300 flex overflow-hidden">
      {/* Barra lateral esquerda com overflow */}
      <div className="w-80 bg-gray-800 text-white p-6 flex flex-col space-y-8 shadow-lg overflow-y-auto max-h-screen">
        <h2 className="text-2xl font-semibold text-gray-200">Contatos</h2>
        <div className="space-y-6">
          {/* Exemplo de contatos */}
          <Contact name="Grupo do Telemarketing" bgColor="bg-blue-600" />
          <Contact name="Grupo de Compras" bgColor="bg-green-600" />
          <Contact name="Grupo de RH" bgColor="bg-purple-600" />
          <Contact name="Grupo de RH" bgColor="bg-purple-600" />
          <Contact name="Grupo de RH" bgColor="bg-purple-600" />
          <Contact name="Grupo de RH" bgColor="bg-purple-600" />
          <Contact name="Grupo de RH" bgColor="bg-purple-600" />
          <Contact name="Grupo de RH" bgColor="bg-purple-600" />
          <Contact name="Grupo de RH" bgColor="bg-purple-600" />
          <Contact name="Grupo de RH" bgColor="bg-purple-600" />
        </div>
      </div>

      {/* Container de Chat à direita */}
      <div className="flex-1 bg-gradient-to-br from-blue-600 via-blue-400 to-blue-300 p-6 overflow-hidden">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Chat em Tempo Real</h1>

          {/* Área de mensagens */}
          <div className="h-[700px] overflow-y-auto border border-gray-300 p-4 rounded-lg mb-6 bg-gray-50 shadow-inner">
            {messages.length === 0 ? (
              <p className="text-gray-500">Nenhuma mensagem ainda.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 flex ${msg.username === user.nome ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg text-white ${msg.username === user.nome ? "bg-blue-600" : "bg-gray-600"}`}
                  >
                    <strong>{msg.username}:</strong>
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p> {/* Classe break-words para quebra automática */}
                    <div className="text-sm text-gray-300">
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Campo de texto e botão de envio */}
          <div className="flex gap-4 items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow p-4 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
              placeholder="Digite sua mensagem"
            />
            <button
              onClick={handleSendMessage}
              className="px-6 py-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
