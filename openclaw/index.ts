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

  // Tool 1: deepself_create_model
  api.registerTool({
    name: "deepself_create_model",
    description: "Create a new deepself model. Use this to create a new persona (higher self, bad cop, specialist, etc.). The 'username' must be unique and will be used to identify this deepself in all future operations.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Display name for the model (e.g., 'My Higher Self', 'Bad Cop')"
        },
        username: {
          type: "string",
          description: "Unique username identifier (e.g., 'clawdbot-higher-001', 'clawdbot-badcop-001')"
        },
        basic_facts: {
          type: "object",
          description: "Optional: Key demographic facts. ONLY these keys are allowed: age, gender, location, birth_location, occupation, marital_status, ethnicity, religion, sexual_orientation, education_level, field_of_study. Values must be strings. Example: {\"age\": \"28\", \"occupation\": \"Engineer\", \"location\": \"San Francisco\"}"
        },
        default_tools: {
          type: "array",
          items: {
            type: "string",
            enum: ["web_search", "memory"]
          },
          description: "Optional: Built-in tools to enable for this model (e.g., [\"web_search\", \"memory\"])"
        }
      },
      required: ["name", "username"]
    },
    async execute(_id: any, params: any) {
      try {
        const { name, username, basic_facts, default_tools } = params;
        api.logger.info(`🧠 Creating deepself model: ${username}`);

        // Convert basic_facts to API format if provided
        const formattedFacts: any = {};
        if (basic_facts) {
          // Validate basic_facts keys
          const allowedKeys = ['age', 'gender', 'location', 'birth_location', 'occupation',
                               'marital_status', 'ethnicity', 'religion', 'sexual_orientation',
                               'education_level', 'field_of_study'];

          for (const [key, value] of Object.entries(basic_facts)) {
            if (!allowedKeys.includes(key)) {
              throw new Error(`Invalid basic_facts key: ${key}. Allowed keys: ${allowedKeys.join(', ')}`);
            }
            formattedFacts[key] = {
              value: String(value),
              status: "stated"
            };
          }
        }

        const result = await callDeepselfAPI("/models", {
          method: "POST",
          body: JSON.stringify({
            name,
            username,
            basic_facts: Object.keys(formattedFacts).length > 0 ? formattedFacts : undefined,
            default_tools: default_tools || undefined
          })
        });

        const message = `Created deepself model: ${username}\n` +
          `Model ID: ${result.id}\n` +
          `Created: ${new Date(result.created * 1000).toISOString()}\n\n` +
          `You can now train it with deepself_train_document or deepself_start_room.`;

        return { content: [{ type: "text", text: message }] };
      } catch (error: any) {
        api.logger.error(`🧠 Deepself create_model error: ${error.message}`);
        return { content: [{ type: "text", text: `Error: ${error.message}` }] };
      }
    }
  });

  // Tool 2: deepself_list

  // Tool 3: deepself_train_document
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
    async execute(_id: any, params: any) {
      try {
        const { model, content, label, perspective, context } = params;
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

        const message = `Training data added to ${model}\n` +
          `Document ID: ${result.document_id}\n` +
          `Status: ${result.status}\n` +
          `Processed: ${result.stats?.epsilons_processed || 0} epsilons, ` +
          `${result.stats?.betas_processed || 0} betas, ` +
          `${result.stats?.deltas_processed || 0} deltas, ` +
          `${result.stats?.alphas_processed || 0} alphas`;

        return { content: [{ type: "text", text: message }] };
      } catch (error: any) {
        api.logger.error(`🧠 Deepself train_document error: ${error.message}`);
        return { content: [{ type: "text", text: `Error: ${error.message}` }] };
      }
    }
  });

  // Tool 4: deepself_start_room
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
    async execute(_id: any, params: any) {
      try {
        const { user_model, interviewer_model, label } = params;
        api.logger.info(`🧠 Creating training room: ${label} (training ${user_model} with ${interviewer_model})`);

        const result = await callDeepselfAPI(`/models/${user_model}/training/rooms`, {
          method: "POST",
          body: JSON.stringify({
            label,
            user_model
          })
        });

        const message = `Training room created!\n` +
          `Room ID: ${result.room_id}\n` +
          `Training: ${user_model}\n` +
          `Interviewer: ${interviewer_model}\n\n` +
          `Use deepself_chat with room_id="${result.room_id}" to continue the conversation.`;

        return { content: [{ type: "text", text: message }] };
      } catch (error: any) {
        api.logger.error(`🧠 Deepself start_room error: ${error.message}`);
        return { content: [{ type: "text", text: `Error: ${error.message}` }] };
      }
    }
  });

  // Tool 5: deepself_finalize_room
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
    async execute(_id: any, params: any) {
      try {
        const { room_id } = params;
        api.logger.info(`🧠 Finalizing training room: ${room_id}`);

        const result = await callDeepselfAPI(`/training/rooms/${room_id}/finalize`, {
          method: "POST"
        });

        const message = `Training room finalized!\n` +
          `Status: ${result.status}\n` +
          `Processed: ${result.stats?.epsilons_processed || 0} epsilons, ` +
          `${result.stats?.betas_processed || 0} betas, ` +
          `${result.stats?.deltas_processed || 0} deltas, ` +
          `${result.stats?.alphas_processed || 0} alphas\n\n` +
          `Insights have been committed to your deepself's knowledge graph.`;

        return { content: [{ type: "text", text: message }] };
      } catch (error: any) {
        api.logger.error(`🧠 Deepself finalize_room error: ${error.message}`);
        return { content: [{ type: "text", text: `Error: ${error.message}` }] };
      }
    }
  });

  // Tool 6: deepself_chat
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
    async execute(_id: any, params: any) {
      try {
        const { model, message, room_id, context } = params;
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

        return { content: [{ type: "text", text: responseContent }] };
      } catch (error: any) {
        api.logger.error(`🧠 Deepself chat error: ${error.message}`);
        return { content: [{ type: "text", text: `Error: ${error.message}` }] };
      }
    }
  });

  
  api.registerTool({
    name: "deepself_list",
    description: "List available deepself models. Returns all models owned by you.",
    parameters: {
      type: "object",
      properties: {}
    },
    async execute() {
      try {
        api.logger.info("🧠 Listing deepself models");

        const result = await callDeepselfAPI("/models", {
          method: "GET"
        });

        const models = result.data || [];

        // Format as readable text
        let output = `Found ${models.length} deepself model${models.length !== 1 ? 's' : ''}.\n\n`;

        if (models.length > 0) {
          output += "Available Models:\n";
          models.forEach((m: any) => {
            const created = new Date(m.created * 1000).toISOString().split('T')[0];
            const tools = m.default_tools && m.default_tools.length > 0
              ? ` (tools: ${m.default_tools.join(', ')})`
              : '';
            output += `- ${m.id}${tools} [created: ${created}]\n`;
          });
        } else {
          output += "No models found. Use deepself_create_model to create your first deepself.";
        }

        return { content: [{ type: "text", text: output }] };
      } catch (error: any) {
        api.logger.error(`🧠 Deepself list error: ${error.message}`);
        return { content: [{ type: "text", text: `Error: ${error.message}` }] };
      }
    }
  });

  api.logger.info("🧠 Deepself plugin registered 6 tools successfully");
}
