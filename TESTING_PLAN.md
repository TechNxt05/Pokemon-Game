# Pokemon Battle Platform - Testing Plan

Use this guide to verify the end-to-end functionality of the application.

## 1. Environment Verification

1.  **Docker**: Ensure Docker Desktop is running.
    ```bash
    docker info
    ```
2.  **Node.js**: Ensure Node.js v18+ is installed.
    ```bash
    node -v
    ```

## 2. Infrastructure Setup

1.  **Start Database & Redis**:
    From the root directory:
    ```bash
    docker-compose up -d
    ```
    *Verification*: Run `docker ps` and check that `postgres` (port 5433) and `redis` (port 6379) are "Up".

## 3. Application Startup

1.  **Start Backend (Server)**:
    Open a terminal in the `/server` directory:
    ```bash
    npm install
    npm run start:dev
    ```
    *Verification*: Wait for "Application is running on: http://localhost:4000" log.

2.  **Start Frontend (Client)**:
    Open a new terminal in the `/client` directory:
    ```bash
    npm install
    npm run dev
    ```
    *Verification*: Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the Landing Page.

## 4. End-to-End User Flow Test

**Goal**: Complete a full battle between two players (or Player vs CPU if implemented).

### Step 1: Login / Access
1.  Open [http://localhost:3000](http://localhost:3000) in **Browser Window A**.
2.  Click **"Try Demo (Guest)"**.
    *   *Expected Result*: You are redirected to a Battle Room (e.g., `/battle/test-match-1`).
    *   *Check*: Verify the URL is `/battle/test-match-1`.

### Step 2: Battle Initialization & Joining
1.  Open [http://localhost:3000/battle/test-match-1](http://localhost:3000/battle/test-match-1) in **Browser Window B** (Incognito window recommended to simulate 2nd user).
2.  (Optional) If specific login is required, use Guest access again.
3.  *Expected Result*: Window A and Window B should both show the Battle Arena.
    *   **Window A** should confirm "You (Player 1)".
    *   **Window B** should confirm "You (Player 2)" (or similar connection status).

### Step 3: Combat Loop
1.  **Player 1 Attack**: In Window A, click **"Attack (Tackle)"**.
2.  **Player 2 Attack**: In Window B, click **"Attack (Tackle)"**.
3.  *Expected Result*:
    *   Both screens should update.
    *   Health bars should decrease.
    *   Battle Log (if visible) should show "Charizard used Tackle!".
    *   Turn counter should increment.

### Step 4: Game Over Condition
1.  Repeat the attacks until one Pokémon faints.
    *   *Note*: Since damage is fixed (e.g., 30) and HP is around 150, this will take ~5-6 turns.
2.  *Expected Result*:
    *   **Match Finished** overlay appears on BOTH screens.
    *   Winner is declared (e.g., "Winner: User-..." ).
    *   "Return to Home" button is visible.

### Step 5: Post-Match
1.  Click **"Return to Home"**.
2.  *Expected Result*: Redirected to Landing Page (`/`).

## 5. Feature Checklist (Manual)

- [ ] **Real-time Sync**: Actions in Window A appear in Window B immediately (< 500ms).
- [ ] **Battleground UI**: The "Volcano/Ocean" card is visible at the top.
- [ ] **Responsiveness**: Resize window to mobile view; layout should stack correctly.
- [ ] **Copy Link**: "Share to Join" button copies the URL to clipboard.

## Troubleshooting

- **Connection Error**: Check if server is running on port 4000.
- **Database Error**: Check if Docker container is running (`docker ps`).
- **White Screen**: Check browser console (F12) for React errors.
