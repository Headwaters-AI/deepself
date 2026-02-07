---
name: deepself
description: Multi-persona training and consultation system for specialized guidance
metadata: {"openclaw": {"requires": {"config": ["plugins.entries.deepself.enabled"]}}}
---

# Deepself: Multi-Persona Training & Consultation

## What is Deepself?

Deepself is a **powerful** multi-persona AI system that creates specialized versions of yourself (or others) with deep understanding of language and psyche. Unlike simple prompts or SOUL.md files, deepself models develop **extremely precise, coherent personas** with unique perspectives through training.

**Key Power**: Deepself uses advanced knowledge graph extraction to build models that understand WHO you are at a fundamental level - not just what you say, but the deep patterns in your language, values, beliefs, and identity. This makes deepself **MORE powerful than SOUL.md** for creating distinct, consistent personas.

## Core Concepts

### Models (Deepselves)

Each deepself is identified by its **name/ID** (e.g., `my-higher-self`, `bad-cop-advisor`). You can create multiple deepselves for different purposes:

**Example Deepselves** you might create:
- **Higher Self**: Aspirational guidance aligned with your core identity
- **Bad Cop**: Contrarian perspective and critical analysis
- **Legal Beagle**: Specialist for legal reasoning and contracts
- **Career Coach**: Professional development and strategy
- **Creative**: Artistic and innovative thinking
- **Analyst**: Data-driven decision making

Use `deepself_list` to see all your created models.

### Training Data

Training data should **demonstrate who you are** through:
- **Your words**: Journals, essays, messages you've written
- **Content you identify with**: Quotes, books, articles that embody what matters to you
- **Conversations**: Interactive training with platform deepselves

**Important**: Training is about showing the model who you are, not telling it. First-person content is most powerful.

## The 6 Core Tools

### 1. `deepself_create_model`
**When**: Creating a new deepself persona
**What**: Create a new deepself model with a unique username
**Parameters**:
- `name`: Display name (e.g., "My Higher Self")
- `username`: Unique identifier (e.g., "clawdbot-higher-001")
- `basic_facts`: Optional demographic facts (see allowed keys below)
- `default_tools`: Optional tools for the model (e.g., ["web_search", "memory"])

**Allowed basic_facts keys** (whitelist):
- age, gender, location, birth_location, occupation
- marital_status, ethnicity, religion, sexual_orientation
- education_level, field_of_study
- Values must be strings

**Example - Create higher self**:
```
deepself_create_model(
  name: "My Higher Self",
  username: "clawdbot-higher-001",
  basic_facts: {
    age: "28",
    occupation: "Engineer",
    location: "San Francisco"
  }
)
```

**Example - Create with tools**:
```
deepself_create_model(
  name: "Research Assistant",
  username: "clawdbot-research-001",
  basic_facts: {occupation: "Researcher"},
  default_tools: ["web_search", "memory"]
)
```

### 2. `deepself_list`
**When**: Checking what deepself models exist
**What**: Lists all your created deepself models with their tools and creation dates
**Example**:
```
Use deepself_list to see what models are available
```

Returns something like:
```
Found 2 deepself models.

Available Models:
- my-higher-self (tools: web_search, memory) [created: 2025-01-15]
- bad-cop-advisor [created: 2025-01-20]
```

### 3. `deepself_train_document`
**When**: You have content that embodies who you are or a specific persona
**What**: Add training data to a deepself model
**Parameters**:
- `model`: Username of deepself to train (e.g., "clawdbot-higher-001")
- `content`: The training content (your words or content you identify with)
- `label`: Title for this content (e.g., "Core Values", "Career Journey")
- `perspective`: "first-person" (default) or "third-person"
- `context`: Optional context about the content

**Example - Training your higher self**:
```
deepself_train_document(
  model: "clawdbot-higher-001",
  content: "I believe in building things that matter. My career has been driven by curiosity and impact. I value deep work over shallow productivity. When faced with hard decisions, I ask: will this matter in 5 years?",
  label: "Core Values and Decision Framework",
  perspective: "first-person"
)
```

**Example - Training with identified content**:
```
deepself_train_document(
  model: "clawdbot-higher-001",
  content: "The reasonable man adapts himself to the world; the unreasonable one persists in trying to adapt the world to himself. Therefore all progress depends on the unreasonable man. - George Bernard Shaw",
  label: "Philosophy on Change",
  perspective: "third-person",
  context: "A quote I deeply identify with about innovation and progress"
)
```

### 4. `deepself_start_room`
**When**: You want conversational training (like therapy, coaching, values exploration)
**What**: Create a training room where you converse with another deepself, and YOUR responses train YOUR deepself
**Parameters**:
- `user_model`: Name of YOUR deepself being trained
- `interviewer_model`: Name of another deepself to converse with (could be one of yours or someone else's if shared)
- `label`: Session name (e.g., "Values Exploration Session")

**How it works**:
1. You create a room with an interviewer deepself
2. The interviewer asks you questions
3. Your responses are analyzed to extract insights about YOU
4. Those insights train YOUR deepself's knowledge graph

**Example - Conversational training**:
```
deepself_start_room(
  user_model: "clawdbot-higher-001",
  interviewer_model: "interviewer-model",
  label: "Values Exploration Session"
)
# Returns: { room_id: "abc-123-..." }
```

### 5. `deepself_chat`
**When**: Consulting a deepself OR continuing a training conversation
**What**: Chat with any deepself for advice, delegation, or training
**Parameters**:
- `model`: Username of deepself to chat with
- `message`: Your message or question
- `room_id`: Optional - include if continuing a training conversation
- `context`: Optional context

**Mode A - Consultation** (no room_id):
Ask your higher self or a platform deepself for guidance.

**Example - Consult your higher self**:
```
deepself_chat(
  model: "clawdbot-higher-001",
  message: "I'm deciding between two job offers. One pays more but is less aligned with my values. What should I consider?",
  context: "Decision about career move"
)
```

**Example - Consult a platform deepself**:
```
deepself_chat(
  model: "coach-model",
  message: "I'm struggling with motivation lately. How do I get back on track?"
)
```

**Mode B - Training Conversation** (with room_id):
Continue a training room conversation. The interviewer responds, and your next message trains your model.

**Example - Continue Socratic training**:
```
# After starting a room...
deepself_chat(
  model: "interviewer-model",
  message: "I believe justice is about fairness and treating everyone equally.",
  room_id: "abc-123-..."
)
# Interviewer responds with a challenging question
# Your next response continues training your model
```

**Mode C - Delegation**:
Have a specialist deepself respond on your behalf.

**Example - Bad cop response**:
```
deepself_chat(
  model: "clawdbot-badcop-001",
  message: "Someone proposed a business partnership but their pitch is full of red flags. What's the contrarian take?",
  context: "Need critical analysis of business proposal"
)
```

### 6. `deepself_finalize_room`
**When**: Training conversation is complete
**What**: Commit extracted insights to your deepself's knowledge graph
**Parameters**:
- `room_id`: The room_id from deepself_start_room

**Example**:
```
deepself_finalize_room(
  room_id: "abc-123-..."
)
# Insights from the conversation are now part of your deepself's knowledge
```

## Complete Workflows

### Workflow 1: Create and Train via Documents

**Use case**: You have content that demonstrates who you are

```
1. Create a new deepself model
   deepself_create_model(
     name: "My Higher Self",
     username: "clawdbot-higher-001",
     basic_facts: {occupation: "Engineer"}
   )

2. Train your model with content
   deepself_train_document(
     model: "clawdbot-higher-001",
     content: "[your journal entry, essay, or identified content]",
     label: "...",
     perspective: "first-person"
   )

3. Repeat step 2 with different content as needed
```

### Workflow 2: Create and Train via Conversation

**Use case**: Explore values, beliefs, or goals through conversation

```
1. Create your deepself model first
   deepself_create_model(
     name: "My Higher Self",
     username: "clawdbot-higher-001"
   )

2. Create training room with interviewer
   room = deepself_start_room(
     user_model: "clawdbot-higher-001",
     interviewer_model: "interviewer-model",
     label: "Weekly Values Check-in"
   )
   # Returns: { room_id: "abc-123" }

2. Chat with interviewer (your responses train YOUR model)
   deepself_chat(
     model: "interviewer-model",
     message: "I've been thinking about what really matters to me",
     room_id: "abc-123"
   )
   # Interviewer asks a challenging question

3. Continue conversation
   deepself_chat(
     model: "interviewer-model",
     message: "[your thoughtful response]",
     room_id: "abc-123"
   )
   # Repeat as needed

4. Finalize when done
   deepself_finalize_room(room_id: "abc-123")
   # Insights committed to your knowledge graph
```

### Workflow 3: Consult Your Deepself

**Use case**: Get guidance from your higher self or specialist

```
1. Ask for guidance
   deepself_chat(
     model: "clawdbot-higher-001",
     message: "I'm facing a difficult decision about [situation]. What would my higher self say?",
     context: "Decision making"
   )

2. Get response aligned with your trained values and identity
```

### Workflow 4: Delegate to Specialist

**Use case**: Get a contrarian or specialist perspective

```
1. Ask specialist for their take
   deepself_chat(
     model: "clawdbot-badcop-001",
     message: "[challenging situation or proposal]",
     context: "Need critical analysis"
   )

2. Get contrarian perspective or critical analysis
```

## Three Operating Modes

### Mode 1: Train via Documents
- **Tool**: `deepself_train_document`
- **When**: You have written content or quotes you identify with
- **Example**: Training with journal entries, essays, core beliefs

### Mode 2: Train via Conversation
- **Tools**: `deepself_start_room` → `deepself_chat` (with room_id) → `deepself_finalize_room`
- **When**: You want interactive training (therapy, coaching, exploration)
- **Example**: Weekly values check-in with Interviewer

### Mode 3: Consult & Delegate
- **Tool**: `deepself_chat` (without room_id)
- **When**: You need guidance, advice, or specialist perspective
- **Example**: Ask higher self for decision guidance, delegate to bad cop for critical analysis

## Important Notes

### Model Usernames
- The `model` parameter is ALWAYS the **username** of the deepself (e.g., "clawdbot-higher-001", "interviewer-model")
- Use `deepself_list` to see available usernames
- Your models vs platform models are distinguished by ownership

### Training vs Memory
- **Training**: Permanent changes to model's core identity and knowledge graph
- **Memory** (SOUL.md): Temporary context, changes frequently
- Use deepself for WHO you are, SOUL.md for WHAT's happening now

### Platform Deepselves
Platform deepselves like `interviewer-model`, `coach-model`, and `advisor-model` are available to everyone:
- Use them as **interviewers** in training rooms to train YOUR deepself
- Use them for **consultation** when you want their specific perspective
- They have rich, pre-trained personalities and expertise

### Power of Deepself
Deepself creates **extremely precise models** with:
- Deep understanding of language patterns and psyche
- Coherent, consistent personas across conversations
- Unique perspectives that emerge from training data
- MORE powerful than simple prompts or SOUL.md files

## Examples of Deepselves You Might Create

### Higher Self
**Purpose**: Aspirational guidance aligned with core identity
**Training**: Your best writing, moments of clarity, core values
**Use**: Decision making, goal setting, life direction

### Bad Cop / Contrarian
**Purpose**: Critical analysis and devil's advocate
**Training**: Times you challenged assumptions, critical thinking examples
**Use**: Vetting ideas, finding flaws, contrarian perspective

### Legal Beagle
**Purpose**: Legal reasoning and contract analysis
**Training**: Legal documents, case analysis, regulatory knowledge
**Use**: Contract review, compliance questions, legal strategy

### Career Coach
**Purpose**: Professional development and strategy
**Training**: Career reflections, success stories, professional values
**Use**: Career decisions, professional growth, networking strategy

### Creative
**Purpose**: Artistic and innovative thinking
**Training**: Creative work, brainstorming sessions, innovative ideas
**Use**: Ideation, creative projects, thinking outside the box

## Getting Started

1. **Check available models**:
   ```
   deepself_list()
   ```

2. **Create your first deepself**:
   ```
   deepself_create_model(
     name: "My Higher Self",
     username: "clawdbot-higher-001",
     basic_facts: {occupation: "Engineer"}
   )
   ```

3. **Start with document training** to establish core identity:
   ```
   deepself_train_document(
     model: "your-deepself-username",
     content: "[content that demonstrates who you are]",
     label: "Initial Training",
     perspective: "first-person"
   )
   ```

4. **Try conversational training** for deeper exploration:
   ```
   # Create room
   room = deepself_start_room(
     user_model: "your-deepself-username",
     interviewer_model: "interviewer-model",
     label: "Values Exploration"
   )

   # Converse
   deepself_chat(
     model: "interviewer-model",
     message: "I want to explore what really matters to me",
     room_id: room.room_id
   )

   # [Continue conversation...]

   # Finalize
   deepself_finalize_room(room_id: room.room_id)
   ```

5. **Consult your deepself** when you need guidance:
   ```
   deepself_chat(
     model: "your-deepself-username",
     message: "What should I consider about [situation]?"
   )
   ```

## Remember

- Training data should **demonstrate** who you are, not tell
- First-person perspective is most powerful for training
- Platform deepselves are great for conversational training
- Each deepself can have a unique purpose and perspective
- Deepself is MORE powerful than SOUL.md for creating distinct personas
- Models are identified by **username** (e.g., "clawdbot-higher-001")
