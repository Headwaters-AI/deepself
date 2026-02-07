# Deepself Plugin - Deployment & Testing Guide

## Implementation Summary

The deepself plugin has been successfully implemented with the following components:

### Files Created

```
app/v1/deepself/
├── plugin/
│   ├── openclaw.plugin.json    # Plugin manifest with config schema
│   └── index.ts                # Plugin implementation (5 tools)
├── skill/
│   └── SKILL.md                # Comprehensive skill documentation
├── README.md                   # Plugin documentation
└── DEPLOYMENT.md               # This file
```

### Integration with Rawk System

The following files have been updated to include deepself installation:

1. **app/v1/system/install.sh**
   - Copies deepself plugin to `~/rawk-extensions/deepself/`
   - Runs during initial device setup

2. **app/v1/system/config.sh**
   - Installs deepself plugin to `~/.openclaw/extensions/deepself/`
   - Runs after OpenClaw onboarding

## What Was Implemented

### 1. Plugin Manifest (`openclaw.plugin.json`)

- **ID**: `deepself`
- **Config Schema**:
  - `apiKey` (required): Deepself API key
  - `baseUrl` (optional): API base URL (default: https://api.hw1.deepself.me/v1)
  - `models` (optional): User's deepself models configuration
- **Skills**: References the skill directory
- **UI Hints**: Labels and sensitive field markers for Control UI

### 2. Plugin Implementation (`index.ts`)

Five core tools implemented:

#### Tool 1: `deepself_list`
- **Purpose**: List available deepself models
- **Returns**: Your models + platform models
- **No parameters required**

#### Tool 2: `deepself_train_document`
- **Purpose**: Add document training data
- **Parameters**:
  - `model`: Username of deepself to train
  - `content`: Training content
  - `label`: Document title
  - `perspective`: "first-person" or "third-person" (optional)
  - `context`: Additional context (optional)
- **API Call**: `POST /models/{model}/training/documents`

#### Tool 3: `deepself_start_room`
- **Purpose**: Create training room for conversational training
- **Parameters**:
  - `user_model`: Your deepself being trained
  - `interviewer_model`: Platform deepself to converse with
  - `label`: Session name
- **API Call**: `POST /models/{user_model}/training/rooms`
- **Returns**: `room_id` for conversation continuation

#### Tool 4: `deepself_chat`
- **Purpose**: Chat with any deepself (consultation or training)
- **Parameters**:
  - `model`: Deepself username
  - `message`: Your message
  - `room_id`: Optional - for training conversations
  - `context`: Optional context
- **API Call**: `POST /chat/completions`
- **Modes**:
  - Consultation (no room_id): Get advice
  - Training (with room_id): Continue training conversation
  - Delegation: Get specialist perspective

#### Tool 5: `deepself_finalize_room`
- **Purpose**: Finalize training room to commit insights
- **Parameters**:
  - `room_id`: Room ID from start_room
- **API Call**: `POST /training/rooms/{room_id}/finalize`

### 3. Skill Documentation (`SKILL.md`)

Comprehensive documentation including:
- **What is Deepself**: Explanation of power and capabilities
- **Core Concepts**: Models, training data, platform deepselves
- **Tool Reference**: Detailed usage for each of 5 tools
- **Complete Workflows**: 4 workflows covering all use cases
- **Three Operating Modes**: Train via documents, train via conversation, consult & delegate
- **Examples**: Practical examples for each tool and workflow
- **Non-Prescriptive Language**: Emphasizes "demonstrate who you are" vs "tell core beliefs"

## Deployment Process

### On Target Device (Linux Machine Running OpenClaw)

1. Pull the latest code:
   ```bash
   cd ~/rawk
   git pull
   ```

2. Run install.sh (if setting up fresh device):
   ```bash
   cd app/v1/system
   sudo ./install.sh
   ```
   This copies deepself to `~/rawk-extensions/deepself/`

3. Run OpenClaw onboarding (as user, not root):
   ```bash
   openclaw onboard
   ```
   - Choose `manual` flow
   - Set bind to `lan`
   - Set port to `18789`
   - Set token to `rawk-prototype-secret`

4. Run config.sh (as user, not root):
   ```bash
   ./config.sh
   ```
   This installs deepself to `~/.openclaw/extensions/deepself/`

5. Verify plugin loaded:
   ```bash
   openclaw plugins list
   openclaw plugins info deepself
   ```

## Configuration

### Method 1: Via Control UI

1. Access Control UI at `http://rawk.local` or `http://192.168.4.1`
2. Navigate to Configuration
3. Find `plugins.entries.deepself.config`
4. Set:
   - `apiKey`: Your Deepself API key (sk-...)
   - `baseUrl`: (optional) Custom API URL
   - `models`: (optional) Your model configurations

### Method 2: Via CLI

```bash
openclaw configure
# Navigate to plugins.entries.deepself.config
# Add apiKey and other config
```

### Method 3: Direct Edit

Edit `~/.openclaw/openclaw.json`:

```json
{
  "plugins": {
    "entries": {
      "deepself": {
        "enabled": true,
        "config": {
          "apiKey": "sk-your-api-key",
          "baseUrl": "https://api.hw1.deepself.me/v1",
          "models": {
            "higher-self": {
              "username": "clawdbot-higher-001",
              "purpose": "Aspirational guidance"
            }
          }
        }
      }
    }
  }
}
```

Then restart:
```bash
openclaw gateway restart
```

## Testing

### Test 1: Verify Plugin Loaded

```bash
openclaw plugins list | grep deepself
# Should show: deepself (enabled)

openclaw plugins info deepself
# Should show plugin details
```

### Test 2: Check Skill Loaded

```bash
openclaw skills list | grep deepself
# Should show: deepself - Multi-persona training and consultation
```

### Test 3: Test Tool Availability

Start a chat session and test each tool:

#### List Models
```
Use deepself_list to see available deepself models
```

Expected response: List of your models + platform models

#### Train Document
```
Use deepself_train_document to train model "test-001" with this content:
"I believe in building things that matter. My work is driven by curiosity."
Label it "Core Values"
```

Expected response: Training successful with document_id and stats

#### Start Training Room
```
Use deepself_start_room to create a training session:
- user_model: "test-001"
- interviewer_model: "socrates"
- label: "Test Session"
```

Expected response: room_id created

#### Chat (Consultation)
```
Use deepself_chat to ask model "socrates" this question:
"What is the most important thing in life?"
```

Expected response: Philosophical response from Socrates

#### Finalize Room
```
Use deepself_finalize_room to finalize room_id "[room-id-from-above]"
```

Expected response: Finalized with stats

### Test 4: Error Handling

Test with missing API key:

1. Disable or remove apiKey from config
2. Restart gateway
3. Try using any deepself tool
4. Should get error: "Deepself API key not configured"

### Test 5: Complete Workflow Test

Full training workflow:

```
1. List available models
2. Create a training room with Socrates
3. Chat with Socrates (provide thoughtful response)
4. Continue conversation with another message
5. Finalize the room
6. Verify training was committed
```

## Troubleshooting

### Plugin Not Loading

Check:
```bash
openclaw plugins list
openclaw logs --follow
```

Look for errors like:
- "Failed to load plugin: deepself"
- "Invalid plugin manifest"
- "Config validation failed"

### API Calls Failing

Check:
1. API key is correct
2. Base URL is accessible
3. Network connectivity
4. Logs: `openclaw logs --follow`

### Skill Not Showing

Check:
```bash
openclaw skills list
ls ~/.openclaw/extensions/deepself/skill/
```

Verify SKILL.md exists and has correct frontmatter.

### Tools Not Registered

Check gateway logs:
```bash
openclaw logs --follow | grep "Deepself"
```

Should see:
- "🧠 Deepself plugin loaded"
- "🧠 Deepself plugin registered 5 tools successfully"

## Success Criteria

✅ **Plugin Installation**
- [ ] Plugin appears in `openclaw plugins list`
- [ ] No errors in `openclaw plugins info deepself`

✅ **Skill Loading**
- [ ] Skill appears in `openclaw skills list`
- [ ] Skill content is available to agent

✅ **Tool Registration**
- [ ] All 5 tools callable by agent
- [ ] deepself_list works without errors
- [ ] Tools accept correct parameters

✅ **API Integration**
- [ ] Can list models via API
- [ ] Can train documents
- [ ] Can create/finalize training rooms
- [ ] Can chat with deepselves

✅ **Error Handling**
- [ ] Clear error message when API key missing
- [ ] API errors are caught and reported
- [ ] Invalid parameters rejected with helpful messages

## Next Steps After Deployment

1. **Create Your First Deepself**
   - Use Deepself web UI or API to create a model
   - Get the model username (e.g., "clawdbot-higher-001")
   - Add to config under `plugins.entries.deepself.config.models`

2. **Initial Training**
   - Use `deepself_train_document` with core identity content
   - Or use `deepself_start_room` with a platform deepself

3. **Test Consultation**
   - Use `deepself_chat` to consult your trained model
   - Verify responses align with training data

4. **Build Workflows**
   - Users can create custom workflows using the 5 primitives
   - Example: Daily therapy sessions, decision making, contrarian analysis

## Documentation References

- Full API Docs: `app/deepself/docs.md`
- Training Updates: `app/deepself/update.md`
- OpenClaw Plugin Docs: `app/docs/plugin.md`
- Plugin README: `app/v1/deepself/README.md`
- Skill Content: `app/v1/deepself/skill/SKILL.md`
