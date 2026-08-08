# Examiner Viva & Project Presentation Cheatsheet
## AI Disaster Relief Coordination Platform

This guide prepares you to answer any technical, architectural, or algorithmic questions from external examiners, professors, or technical interviewers.

---

## 1. Top 5 Questions Examiners Will Ask & How to Answer

### Q1: "Where is your data stored and how do geospatial queries work?"
> **Answer**: All data is stored in **MongoDB** (`disaster_relief_db`) using **Mongoose ORM**. We use standard **GeoJSON `Point` format** (`{ type: "Point", coordinates: [longitude, latitude] }`).
> Crucially, we indexed the `location` field with MongoDB **`2dsphere` spatial indexes**. This allows us to perform native proximity searches using the `$near` operator with a `$maxDistance` boundary in meters.
> *Demo*: Open **MongoDB Compass** -> `disaster_relief_db` -> `incidents` to show the `2dsphere` index and GeoJSON structure.

---

### Q2: "What is your DSA / Algorithmic contribution?"
> **Answer**: We designed and implemented a **Multi-Criteria Resource Allocation & Dispatch Engine** (`server/src/dsa/matchingEngine.js`).
> Instead of simple naive lookups, our algorithm combines:
> 1. **Haversine Formula**: Computes exact great-circle distance in kilometers between the incident coordinates $(lat_1, lon_1)$ and responder coordinates $(lat_2, lon_2)$ in $O(1)$ time.
> 2. **Weighted Scoring Matrix**: 
>    $$\text{MatchScore} = (\text{UrgencyScore} \times 10) - (\text{DistanceKm} \times 3.5) + \text{SkillBonus} + (\text{Rating} \times 5)$$
> 3. **Max-Heap Priority Queue**: Extracts the top $K$ optimal responders in $O(N \log K)$ time complexity.

---

### Q3: "How does the AI Triage Engine work?"
> **Answer**: We integrated **Google Gemini AI API** (`server/src/services/aiService.js`).
> When an unstructured emergency message is reported (e.g., *"Flash flood water rising near Silk Board, 4 people trapped"*), the prompt uses structured JSON schema output forcing Gemini to extract:
> - `type`: (`FLOOD`, `FIRE`, `MEDICAL`, `BUILDING_COLLAPSE`)
> - `urgencyScore`: integer scale $1 \dots 10$
> - `extractedNeeds`: Array of required supplies/equipment (e.g., `["Boat Rescue", "Life Jackets"]`)
> - `victimCountEstimate`: Estimated headcount.
> 
> *Fallback*: If internet or API key is absent, the backend seamlessly switches to a rule-based NLP keyword & Regex heuristic parser so the system never breaks.

---

### Q4: "Why did you use Socket.io instead of REST polling?"
> **Answer**: In disaster scenarios, delayed information costs lives. Polling every 5 seconds wastes HTTP bandwidth and introduces lag.
> **Socket.io** establishes a persistent, bi-directional WebSocket connection. When a citizen submits a report, the server broadcasts an `incident:created` event. All connected Admin Command Center maps and responder portals update **instantly in real time** without refreshing the page.

---

### Q5: "How does your system handle system crashes or offline scenarios?"
> **Answer**: 
> 1. The backend has an **In-Memory Repository Fallback** layer. If MongoDB is temporarily unreachable, the app degrades gracefully to memory cache without throwing unhandled exceptions.
> 2. On the client side, Socket.io automatically attempts exponential backoff reconnects and displays a real-time status badge (`LIVE SOCKET STREAM` vs `RECONNECTING...`).

---

## 2. Recommended Presentation Demo Flow (5-Minute Script)

1. **Step 1: Open Command Center Dashboard** ([http://localhost:5173/](http://localhost:5173/))
   - Show the dark-mode Leaflet GIS map with color-coded incident pins (Red = Critical, Orange = Moderate, Green = Field Responders, Purple = Shelters).
   - Point to the live socket status indicator in the top navbar.

2. **Step 2: Submit a Citizen Emergency Report**
   - Click **"Report Emergency"** tab.
   - Enter: *"Severe electrical fire broke out in chemical warehouse near Peenya, dense toxic smoke spreading, 3 workers trapped"*.
   - Click **"⚡ Test Instant AI Triage Preview"** to show Gemini AI classifying it live as `FIRE`, Urgency `9/10`, and extracting `["Fire Extinguisher", "Ambulance"]`.
   - Click **"Broadcast Emergency Signal"**.

3. **Step 3: Show Real-Time Map Update & DSA Dispatch**
   - Switch back to **Command Center**.
   - Notice the new incident pin automatically appeared on the map with a glowing red radar ring!
   - Click **"Trigger DSA Match"** on the incident card.
   - Show the DSA Engine calculating distance via Haversine and matching top NDRF responders!

4. **Step 4: Show MongoDB Compass**
   - Open **MongoDB Compass**.
   - Click into `disaster_relief_db` -> `dispatches` and `incidents`.
   - Show the newly created documents with standard GeoJSON format and Mongoose schemas!
