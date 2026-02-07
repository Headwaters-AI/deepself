/**
 * Deepself Plugin for OpenClaw
 *
 * Multi-persona training and consultation system providing 5 core primitives:
 * 1. deepself_train_document - Add document training data
 * 2. deepself_start_room - Create training room for conversational training
 * 3. deepself_finalize_room - Finalize training room to commit insights
 * 4. deepself_chat - Chat with any deepself for consultation or delegation
 * 5. deepself_list - List available deepself models
 */

interface OpenClawApi {
  registerTool: (tool: any) => void;
  config: any;
  logger: {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
  };
}

export default function(api: OpenClawApi) {
  api.logger.info("🧠 Deepself plugin loaded");

  const pluginConfig = api.config?.plugins?.entries?.deepself?.config || {};
  const apiKey = pluginConfig.apiKey;
  const baseUrl = pluginConfig.baseUrl || "https://api.hw1.deepself.me/v1";

  // Helper function for API calls
  async function callDeepselfAPI(endpoint: string, options: any = {}) {
    if (!apiKey) {
      throw new Error("Deepself API key not configured. Please set plugins.entries.deepself.config.apiKey in your OpenClaw config.");
    }

    const url = `${baseUrl}${endpoint}`;
    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers
    };

    api.logger.info(`🧠 Deepself API call: ${options.method || 'GET'} ${endpoint}`);

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deepself API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  }

  // Tool 1: deepself_train_document
  api.registerTool({
    name: "deepself_train_document",
    description: "Add training data to a deepself model. Use this to train your deepself with documents, quotes, or content you identify with. The content demonstrates who you are through your words or those you identify with. The 'model' parameter is the username of the deepself to train (e.g., 'clawdbot-higher-001').",
    parameters: {
      type: "object",
      properties: {
        model: {
          type: "string",
          description: "Username of the deepself model to train (e.g., 'clawdbot-higher-001')"
        },
        content: {
          type: "string",
          description: "The training content (your words or content you identify with)"
        },
        label: {
          type: "string",
          description: "Title for this training data (e.g., 'My Core Values', 'Career Journey')"
        },
        perspective: {
          type: "string",
          enum: ["first-person", "third-person"],
          description: "Perspective of the content (default: first-person)"
        },
        context: {
          type: "string",
          description: "Optional context about this content"
        }
      },
      required: ["model", "content", "label"]
    },
    handler: async ({ model, content, label, perspective, context }: any) => {
      try {
        api.logger.info(`🧠 Training deepself model: ${model} with document: ${label}`);

        const result = await callDeepselfAPI(`/models/${model}/training/documents`, {
          method: "POST",
          body: JSON.stringify({
            label,
            content,
            perspective: perspective || "first-person",
            context: context || undefined
          })
        });

        return {
          success: true,
          document_id: result.document_id,
          status: result.status,
          stats: result.stats,
          message: `Training data added to ${model}. Processed ${result.stats?.epsilons_processed || 0} insights.`
        };
      } catch (error: any) {
        api.logger.error(`🧠 Deepself train_document error: ${error.message}`);
        return {
          success: false,
          error: error.message
        };
      }
    }
  });

  // Tool 2: deepself_start_room
  api.registerTool({
    name: "deepself_start_room",
    description: "Create a training room for conversational training. Use this to have a conversation with a platform deepself (like Socrates or Tony Robbins) where YOUR responses train YOUR deepself. Example: converse with Socrates to explore values through Socratic questioning. The 'user_model' is the username of YOUR deepself being trained, and 'interviewer_model' is the username of the platform deepself to converse with.",
    parameters: {
      type: "object",
      properties: {
        user_model: {
          type: "string",
          description: "Username of YOUR deepself being trained (e.g., 'clawdbot-higher-001')"
        },
        interviewer_model: {
          type: "string",
          description: "Username of platform deepself to converse with (e.g., 'socrates', 'tony-robbins')"
        },
        label: {
          type: "string",
          description: "Session name (e.g., 'Values Exploration Session', 'Career Reflection')"
        }
      },
      required: ["user_model", "interviewer_model", "label"]
    },
    handler: async ({ user_model, interviewer_model, label }: any) => {
      try {
        api.logger.info(`🧠 Creating training room: ${label} (training ${user_model} with ${interviewer_model})`);

        const result = await callDeepselfAPI(`/models/${user_model}/training/rooms`, {
          method: "POST",
          body: JSON.stringify({
            label,
            user_model
          })
        });

        return {
          success: true,
          room_id: result.room_id,
          status: result.status,
          user_model,
          interviewer_model,
          message: `Training room created. Room ID: ${result.room_id}. Use deepself_chat with this room_id to continue the conversation.`
        };
      } catch (error: any) {
        api.logger.error(`🧠 Deepself start_room error: ${error.message}`);
        return {
          success: false,
          error: error.message
        };
      }
    }
  });

  // Tool 3: deepself_finalize_room
  api.registerTool({
    name: "deepself_finalize_room",
    description: "Finalize a training room to commit extracted insights to your deepself's knowledge graph. Call this when the conversation is complete and you want to save the training.",
    parameters: {
      type: "object",
      properties: {
        room_id: {
          type: "string",
          description: "The room_id returned from deepself_start_room"
        }
      },
      required: ["room_id"]
    },
    handler: async ({ room_id }: any) => {
      try {
        api.logger.info(`🧠 Finalizing training room: ${room_id}`);

        const result = await callDeepselfAPI(`/training/rooms/${room_id}/finalize`, {
          method: "POST"
        });

        return {
          success: true,
          status: result.status,
          stats: result.stats,
          message: `Training room finalized. Processed ${result.stats?.epsilons_processed || 0} insights.`
        };
      } catch (error: any) {
        api.logger.error(`🧠 Deepself finalize_room error: ${error.message}`);
        return {
          success: false,
          error: error.message
        };
      }
    }
  });

  // Tool 4: deepself_chat
  api.registerTool({
    name: "deepself_chat",
    description: "Chat with any deepself for consultation or delegation. For consultation: ask your higher self or a platform deepself for advice. For delegation: have a specialist deepself (like 'legal-beagle') respond to a message. The 'model' parameter is the username of the deepself. If 'room_id' is provided, this continues a training conversation.",
    parameters: {
      type: "object",
      properties: {
        model: {
          type: "string",
          description: "Username of the deepself to chat with (e.g., 'clawdbot-higher-001', 'socrates')"
        },
        message: {
          type: "string",
          description: "Your message or question"
        },
        room_id: {
          type: "string",
          description: "Optional: room_id if continuing a training conversation"
        },
        context: {
          type: "string",
          description: "Optional context to include in the conversation"
        }
      },
      required: ["model", "message"]
    },
    handler: async ({ model, message, room_id, context }: any) => {
      try {
        api.logger.info(`🧠 Chatting with deepself: ${model}`);

        const messages = [
          { role: "user", content: message }
        ];

        if (context) {
          messages.unshift({ role: "system", content: context });
        }

        const requestBody: any = {
          model,
          messages,
          stream: false
        };

        if (room_id) {
          requestBody.room_id = room_id;
        }

        const result = await callDeepselfAPI("/chat/completions", {
          method: "POST",
          body: JSON.stringify(requestBody)
        });

        const responseContent = result.choices?.[0]?.message?.content || "";

        return {
          success: true,
          response: responseContent,
          model,
          room_id: room_id || null,
          message: responseContent
        };
      } catch (error: any) {
        api.logger.error(`🧠 Deepself chat error: ${error.message}`);
        return {
          success: false,
          error: error.message
        };
      }
    }
  });

  // Tool 5: deepself_list
  api.registerTool({
    name: "deepself_list",
    description: "List available deepself models. Returns both platform defaults (available to anyone, like 'socrates', 'tony-robbins') and your own created deepselves.",
    parameters: {
      type: "object",
      properties: {}
    },
    handler: async () => {
      try {
        api.logger.info("🧠 Listing deepself models");

        const result = await callDeepselfAPI("/models", {
          method: "GET"
        });

        const models = result.data || [];
        const modelList = models.map((m: any) => ({
          id: m.id,
          username: m.owned_by,
          created: new Date(m.created * 1000).toISOString()
        }));

        // Add platform models info
        const platformModels = [
          "socrates - Socratic questioning for values exploration",
          "tony-robbins - Motivational coaching and peak performance",
          "oprah - Empathetic guidance and life wisdom"
        ];

        return {
          success: true,
          your_models: modelList,
          platform_models: platformModels,
          message: `Found ${modelList.length} of your models. Platform models available: ${platformModels.length}`
        };
      } catch (error: any) {
        api.logger.error(`🧠 Deepself list error: ${error.message}`);
        return {
          success: false,
          error: error.message
        };
      }
    }
  });

  api.logger.info("🧠 Deepself plugin registered 5 tools successfully");
}
