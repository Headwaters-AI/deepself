# Deepself Plugin for OpenClaw

Multi-persona training and consultation system providing generic primitives for specialized AI guidance.

## Overview

Deepself is a powerful plugin that enables creation and training of specialized AI personas with deep understanding of language and psyche. Unlike simple prompts, deepself models develop extremely precise, coherent personalities through training data.

## Features

- **5 Core Primitives**: Essential tools for training and consultation
- **Multi-Persona Support**: Create multiple deepselves for different purposes
- **Platform Deepselves**: Access to pre-trained models like Socrates, Tony Robbins, etc.
- **Three Modes**: Train via documents, train via conversation, consult & delegate
- **Knowledge Graph**: Deep extraction of identity, values, beliefs, and patterns

## Installation

### Development (Laptop)

1. This plugin is already in the repo at `app/v1/deepself/`

2. When deploying to the device, the plugin will be installed via:
   ```bash
   openclaw plugins install -l ~/rawk-extensions/deepself/plugin
   ```

### Configuration

Add to your OpenClaw config (`~/.openclaw/openclaw.json`):

```json
{
  "plugins": {
    "entries": {
      "deepself": {
        "enabled": true,
        "config": {
          "apiKey": "sk-your-deepself-api-key",
          "baseUrl": "https://api.hw1.deepself.me/v1",
          "models": {
            "higher-self": {
              "username": "clawdbot-higher-001",
              "purpose": "Aspirational guidance aligned with core identity"
            },
            "bad-cop": {
              "username": "clawdbot-critic-001",
              "purpose": "Contrarian perspective and critical analysis"
            }
          }
        }
      }
    }
  }
}
```

Or use `openclaw configure` to edit the config via Control UI.

## The 5 Core Tools

### 1. `deepself_list`
List available deepself models (yours + platform defaults).

**Example**:
```typescript
await deepself_list()
// Returns: { your_models: [...], platform_models: [...] }
```

### 2. `deepself_train_document`
Add document training data to a deepself.

**Parameters**:
- `model`: Username of deepself (e.g., "clawdbot-higher-001")
- `content`: Training content
- `label`: Document title
- `perspective`: "first-person" or "third-person" (optional)
- `context`: Additional context (optional)

**Example**:
```typescript
await deepself_train_document({
  model: "clawdbot-higher-001",
  content: "I believe in building things that matter...",
  label: "Core Values",
  perspective: "first-person"
})
```

### 3. `deepself_start_room`
Create a training room for conversational training.

**Parameters**:
- `user_model`: Your deepself being trained
- `interviewer_model`: Platform deepself to converse with (e.g., "socrates")
- `label`: Session name

**Example**:
```typescript
const room = await deepself_start_room({
  user_model: "clawdbot-higher-001",
  interviewer_model: "socrates",
  label: "Values Exploration Session"
})
// Returns: { room_id: "abc-123-..." }
```

### 4. `deepself_chat`
Chat with any deepself for consultation or to continue training.

**Parameters**:
- `model`: Deepself username
- `message`: Your message
- `room_id`: Optional - for training conversations
- `context`: Optional context

**Example - Consultation**:
```typescript
const response = await deepself_chat({
  model: "clawdbot-higher-001",
  message: "What should I consider about this decision?",
  context: "Career choice"
})
```

**Example - Training Conversation**:
```typescript
const response = await deepself_chat({
  model: "socrates",
  message: "I believe justice is about fairness...",
  room_id: "abc-123-..."
})
```

### 5. `deepself_finalize_room`
Finalize a training room to commit insights.

**Parameters**:
- `room_id`: Room ID from `deepself_start_room`

**Example**:
```typescript
await deepself_finalize_room({
  room_id: "abc-123-..."
})
```

## Three Operating Modes

### Mode 1: Train via Documents
Use `deepself_train_document` to add content that demonstrates who you are.

**Use case**: Journal entries, essays, quotes you identify with

### Mode 2: Train via Conversation
Use `deepself_start_room` → `deepself_chat` (with room_id) → `deepself_finalize_room`

**Use case**: Therapy, coaching, values exploration with platform deepselves

### Mode 3: Consult & Delegate
Use `deepself_chat` (without room_id)

**Use case**: Get guidance from your higher self, delegate to specialists

## Example Deepselves

- **Higher Self**: Aspirational guidance aligned with core identity
- **Bad Cop**: Contrarian perspective and critical analysis
- **Legal Beagle**: Specialist for legal reasoning
- **Career Coach**: Professional development and strategy
- **Creative**: Artistic and innovative thinking

## Platform Deepselves

Pre-trained models available to everyone:
- `socrates`: Socratic questioning for values exploration
- `tony-robbins`: Motivational coaching and peak performance
- `oprah`: Empathetic guidance and life wisdom

Use platform deepselves as:
- **Interviewers** in training rooms to train YOUR deepself
- **Consultants** for their specific perspective

## File Structure

```
app/v1/deepself/
├── plugin/
│   ├── openclaw.plugin.json    # Plugin manifest
│   └── index.ts                # Plugin implementation
├── skill/
│   └── SKILL.md                # Skill documentation
└── README.md                   # This file
```

## API Documentation

Full Deepself V1 API documentation is available at:
- `app/deepself/docs.md` - Complete API reference
- `app/deepself/update.md` - Training workflow updates

## Development

### Testing Locally

1. Link the plugin for development:
   ```bash
   openclaw plugins install -l app/v1/deepself/plugin
   ```

2. Verify loaded:
   ```bash
   openclaw plugins list
   openclaw plugins info deepself
   ```

3. Configure API key:
   ```bash
   openclaw configure
   # Navigate to plugins.entries.deepself.config and add apiKey
   ```

4. Restart gateway:
   ```bash
   openclaw gateway restart
   ```

5. Test in a chat session:
   ```
   Use deepself_list to see available models
   ```

### Deployment to Device

The installation script (`app/v1/system/install.sh`) should copy this plugin to the device:

```bash
# On the device (after git pull)
cp -r ~/rawk/app/v1/deepself ~/.openclaw/extensions/deepself
openclaw gateway restart
```

Or use the config.sh script to install the extension automatically.

## Design Principles

1. **Generic Primitives**: No prescriptive workflows, just flexible tools
2. **Minimal**: Keep it simple, essential tools only
3. **Non-Prescriptive Language**: Don't say "core beliefs", frame it as "demonstrate who you are"
4. **Multi-Persona**: Support multiple deepselves for different purposes
5. **Platform Integration**: Leverage platform deepselves for training

## Future Extensions

(NOT in initial implementation)

- Cron jobs for automated training sessions
- Auto-creation of models
- Advanced delegation features
- Session history tracking
- Multi-room management

Keep the initial implementation minimal and generic. Users can build specific workflows using the primitives.

## Support

- Deepself API: https://api.hw1.deepself.me/v1
- OpenClaw Docs: app/docs/
- Plugin Docs: app/docs/plugin.md
