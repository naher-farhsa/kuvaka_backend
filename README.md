# B2B Lead Scoring API

A **B2B lead scoring backend service** that combines **AI-based scoring** (Google Gemini 2.0 Flash) and **rule-based logic** to generate a final lead intent and score.

---

## Features

- AI-driven scoring with detailed reasoning per lead.
- Rule-based scoring logic for additional points.
- Combined final score and intent classification (`High`, `Medium`, `Low`).
- Handles duplicate AI responses automatically.
- REST API endpoints for offers, leads, scoring, and results.

---

## Setup Steps

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd <repo-folder>
```

2. **Install dependencies**

```bash
npm install
```

3. **Set environment variables**

Create a `.env` file in the root directory:

```env
PORT=3010
MONGODB_URI=<your-mongo-connection-string>
GEMINI_API_KEY=<your-google-genai-key>
```

4. **Start the server locally**

```bash
npm run start
```

Your API will run on `http://localhost:3010`.

---

## API Endpoints & Postman Examples

### 1. Create an Offer

**POST** `/api/offer`

**Request Body (JSON)**:

```json
{
  "name": "B2B AI Sales Accelerator",
  "value_props": ["Automated lead scoring", "Predictive outreach", "Boost meeting conversion"],
  "ideal_use_cases": ["B2B SaaS", "Enterprise SaaS", "Marketing Tech"]
}
```

**Response**:

```json
{
  "message": "Offer saved",
  "offer": {
    "_id": "68e4dddd2deede059871f4ab",
    "name": "B2B AI Sales Accelerator",
    "value_props": ["Automated lead scoring", "Predictive outreach", "Boost meeting conversion"],
    "ideal_use_cases": ["B2B SaaS", "Enterprise SaaS", "Marketing Tech"],
    "created_at": "2025-10-07T09:31:09.239Z"
  }
}
```

---

### 2. Delete All Offers

**DELETE** `/api/offer/delete`

**Response Body (JSON)**:

```json
{
  "message": "All offers deleted"
}
```

---

### 3. Get Latest Offer

**GET** `/api/latest`

**Response Body (JSON)**:

```json
{
  "_id": "68e4dddd2deede059871f4ab",
  "name": "B2B AI Sales Accelerator",
  "value_props": ["Automated lead scoring", "Predictive outreach", "Boost meeting conversion"],
  "ideal_use_cases": ["B2B SaaS", "Enterprise SaaS", "Marketing Tech"],
  "created_at": "2025-10-07T09:31:09.239Z"
}
```

---

### 4. Upload Leads CSV

**POST** `/api/leads/upload`

**Form Data**:

* Key: `file`
* Value: `leads.csv`

**Response**:

```json
{
  "message": "Leads uploaded",
  "count": 50
}
```

---

### 5. Get All Leads

**GET** `/api/leads/get`

**Example Response – If leads exist**:

```json
[
  {
    "_id": "6501a1b2c3d4e5f678901234",
    "name": "Jackson Adams",
    "role": "COO",
    "company": "FlowWorks",
    "email": "jackson.adams@flowworks.com",
    "phone": "+1234567890",
    "created_at": "2025-10-07T09:31:09.239Z"
  },
  {
    "_id": "6501a1b2c3d4e5f678901235",
    "name": "Scarlett Baker",
    "role": "Lead Developer",
    "company": "SmartOps",
    "email": "scarlett.baker@smartops.com",
    "phone": "+1987654321",
    "created_at": "2025-10-07T09:32:10.123Z"
  }
]
```

**Example Response – If no leads exist**:

```json
{
  "message": "No leads found"
}
```

---

### 6. Delete All Leads

**DELETE** `/api/leads/delete`

**Response – Success**:

```json
{
  "message": "All leads deleted"
}
```

**Response – Failure**:

```json
{
  "message": "Failed to delete leads"
}
```

---

### 7. Run Lead Scoring

**POST** `/api/score/run`

**Request Body (JSON)**:

```json
{
  "offer_id": "68e4dddd2deede059871f4ab"
}
```

**Response**:

```json
{
  "message": "Scoring completed successfully"
}
```

---

### 8. Get Score Results

**POST** `/api/score/results`

**Request Body (JSON)**:

```json
{
  "offer_id": "68e4dddd2deede059871f4ab"
}
```

**Response**:

```json
[
  {
    "name": "Jackson Adams",
    "role": "COO",
    "company": "FlowWorks",
    "intent": "High",
    "score": 80,
    "reasoning": "COO is a decision maker role, increasing the likelihood of high intent, and aligns with B2B SaaS."
  },
  {
    "name": "Scarlett Baker",
    "role": "Lead Developer",
    "company": "SmartOps",
    "intent": "Low",
    "score": 30,
    "reasoning": "Lead Developer role has low relevance and industry is only adjacent (Software)."
  },
  {
    "name": "Zoey Evans",
    "role": "Product Owner",
    "company": "NextLevel AI",
    "intent": "Low",
    "score": 20,
    "reasoning": "Product Owner role has low relevance, although the company is in an adjacent industry (AI)."
  }
]
```

---

## Rule Logic & AI Prompt

**AI Prompt Logic**:

* AI receives lead details and offer context.
* Task: classify each lead's buying intent (`High`, `Medium`, `Low`) and provide reasoning in 1–2 lines.
* Expected JSON output from AI:

```json
[
  {
    "name": "Lead Name",
    "ai_intent": "High",
    "ai_reason": "Reason why the lead is high potential"
  }
]
```

**Rule-based Scoring**:

* Points assigned based on lead attributes:

  * Decision-maker role → +20 points
  * Industry exact match → +20 points
  * Adjacent industry → +10 points
* **Final Score** = AI points + Rule points
* **Intent Classification**:

  * `High` → score ≥ 70
  * `Medium` → 40 ≤ score < 70
  * `Low` → score < 40
* Reasoning always comes from AI output.

---

## Scoring Reference Table

| AI Intent | Rule Points | Final Score | Final Intent |
| --------- | ----------- | ----------- | ------------ |
| High      | 20–30       | 70+         | High         |
| Medium    | 10–20       | 40–69       | Medium       |
| Low       | 0–10        | <40         | Low          |

---

## Deploy on Render

1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repository.
3. Add environment variables in Render:

   * `PORT` (default `3010`)
   * `MONGODB_URI`
   * `GEMINI_API_KEY`
4. Deploy the service. Render will provide a live URL like:

```
https://<your-app-name>.onrender.com
```

5. Test API endpoints using Postman or cURL.

---

## Live API Base URL

```
https://<your-app-name>.onrender.com
```

**Endpoints**:

```
POST    /api/offer
DELETE  /api/offer/delete
GET     /api/latest
POST    /api/leads/upload
GET     /api/leads/get
DELETE  /api/leads/delete
POST    /api/score/run
POST    /api/score/results
```

---

## Notes

* Ensure the **Google Gemini API key** is valid.
* Duplicate AI responses are filtered automatically.
* Only AI reasoning (`ai_reason`) is used in final records.
* Final score combines AI points and rule-based points.

---

## License

MIT License
