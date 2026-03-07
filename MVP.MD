# MVP.md: Trankilo Hub (The Agent Registry)

## 1. Goal
The central registry for discovering, editing, managing, monitoring and distributing Agent instructions.

## 2. Minimal Feature Set

### A. The Discovery Engine (Search)
- **Public Gallery:** A landing page showing "Trending" or "Recently Published" public agents.
- **Search Bar:** Search by name, platform (LangChain, etc.), or use-case.

### B. Workspace & RBAC
- **Roles:** Admin, Editor, Viewer.
- **Invites:** Email-based invitations to join a "Workspace" (Project).

### C. The Web Editor
- **Direct Editing:** Modify the `instructions` block of an `Agentfile` directly in the UI. If user has role of Viewer don't let him/her edit! Create a publish button for publishing the agent + Confirmation pop-up
- **Auto-Versioning:** Every web-save is a new `push` in the history.

### D. Generic Playground
- **Vibe Checker:** A simple chat interface to test the current instructions against a base LLM (OpenAI/Anthropic).
- **Note:** This tests *prompt logic*, not *code tools*.

### E. Privacy Toggle
- **Switch:** A simple "Private/Public" toggle in the Agent Settings.
- **URL:** Public agents get a shareable link: `trankilo.io/@alice/crm-expert`.

### F. SDK Connection Monitor
- **Heartbeat:** A list of active SDK clients currently pulling this agent's instructions.