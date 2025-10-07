# B2B Lead Classifier

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
git clone https://github.com/naher-farhsa/kuvaka_backend.git
cd kuvakabackend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set environment variables**

Create a `.env` file in the root directory:

```env
PORT=<server-port>
MONGODB_URI=<mongo-connection-string>
GEMINI_API_KEY=<google-genai-key>
```

4. **Start the server locally**

```bash
npm install
npm run start
```

Your API will run on `http://localhost:PORT`.

---


API is deployed at Render:

Base URL: 
```
https://b2b-lead-classifier.onrender.com
```
---

## Live API Endpoints

| Purpose | Method | URL |
| ------- | ------ | --- |
| Get latest offer    | GET | [https://b2b-lead-classifier.onrender.com/api/offer/latest](https://b2b-lead-classifier.onrender.com/api/offer/latest) |
| Get all leads | GET | [https://b2b-lead-classifier.onrender.com/api/leads/get](https://b2b-lead-classifier.onrender.com/api/leads/get) |
| Get score results | GET (query param `offer_id=68e4dddd2deede059871f4ab`) | [https://b2b-lead-classifier.onrender.com/api/score/results?offer_id=68e4dddd2deede059871f4ab](https://b2b-lead-classifier.onrender.com/api/score/results?offer_id=68e4dddd2deede059871f4ab) |

> For score results, you must provide `offer_id` as a query parameter when accessing via browser.

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

**Response**:

```json
{
  "message": "All offers deleted"
}
```

---

### 3. Get Latest Offer

**GET** `/api/offer/latest`  

**Live Render URL**: [https://b2b-lead-classifier.onrender.com/api/offer/latest](https://b2b-lead-classifier.onrender.com/api/offer/latest)

**Response**:

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

**Live Render URL**: [https://b2b-lead-classifier.onrender.com/api/leads/get](https://b2b-lead-classifier.onrender.com/api/leads/get)

**Example Response**:

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

---

### 6. Delete All Leads

**DELETE** `/api/leads/delete`

**Response**:

```json
{
  "message": "All leads deleted"
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

**GET** `/api/score/results?offer_id=<offer_id>`  

**Live Render URL Example**: [https://b2b-lead-classifier.onrender.com/api/score/results?offer_id=68e4dddd2deede059871f4ab](https://b2b-lead-classifier.onrender.com/api/score/results?offer_id=68e4dddd2deede059871f4ab)

**Response**:

```json
[
  {
    "name": "Liam Smith",
    "role": "CEO",
    "company": "TechNova",
    "intent": "High",
    "score": 80,
    "reasoning": " CEO  role has highly relevance and industry is an exact match (B2B SaaS)."
  },
  {
    "name": "Scarlett Baker",
    "role": "Lead Developer",
    "company": "SmartOps",
    "intent": "Low",
    "score": 30,
    "reasoning": "Lead Developer role has low relevance and industry is only adjacent (Software)."
  }
]
```

---

## Rule Logic & AI Prompt

**AI Prompt Logic**:

- AI receives lead details and offer context.
- Task: classify each lead's buying intent (`High`, `Medium`, `Low`) and provide reasoning in 1–2 lines.
- Expected JSON output from AI (after Batch Process):

 **NOTE:**  The lead scoring runs in **batch mode** to prevent **HTTP 429 (rate limit)** errors from the Gemini model.   
  **Batch Config:**
 - `BATCH_SIZE = 5` → 5 leads per request  
 - `RETRY_LIMIT = 3` → up to 3 retries  
 - `RETRY_DELAY_MS = 15000` → 15s delay between retries   

 Ensures stable AI interaction and smooth processing during high-volume scoring.

 **Response**: 
- (Batched Results)
```js

[  
   {
    '$__': InternalCache { activePaths: [ctor], skipId: true },
    '$isNew': false,
    _doc: {
      _id: new ObjectId('68e4fcfc6b9c7443369324c8'),
      name: 'Liam Smith',
      role: 'CEO',
      company: 'TechNova',
      industry: 'B2B SaaS',
      location: 'New York',
      linkedin_bio: 'Passionate about AI-driven SaaS products',
      created_at: 2025-10-07T11:43:56.280Z,
      __v: 0
    },
    ai_intent: 'High',
    ai_reason: 'Role is highly relevant as CEO and the industry is an exact match (B2B SaaS).'
  },
  {
    '$__': InternalCache { activePaths: [ctor], skipId: true },
    '$isNew': false,
    _doc: {
      _id: new ObjectId('68e4fcfc6b9c7443369324c7'),
      name: 'Ava Patel',
      role: 'Head of Growth',
      company: 'FlowMetrics',
      industry: 'B2B SaaS',
      location: 'San Francisco',
      linkedin_bio: 'Experienced in scaling B2B SaaS operations',
      created_at: 2025-10-07T11:43:56.278Z,
      __v: 0
    },
    ai_intent: 'High',
    ai_reason: 'Role is highly relevant as Head of Growth and the industry is an exact match (B2B SaaS).'
  }
]
```

**Rule-based Scoring**:

- Decision-maker role → +20 points
- Industry exact match → +20 points
- Adjacent industry → +10 points
- **Final Score** = AI points + Rule points
### Final Score and Reasoning

The final score for each lead is calculated by combining **AI points** and **rule-based points**:

- **AI Points**:  
  - `High` → 50 points  
  - `Medium` → 30 points  
  - `Low` → 10 points  

- **Rule-based Points**: Calculated using the ruleScorer based on lead role, industry match, and other criteria.  

- **Final Score** = AI Points + Rule-based Points  

- **AI Reasoning**: Stored separately to explain why the AI assigned a particular intent.

---

### Intent Classification

Based on the **combined final score**, the lead’s buying intent is classified as:

- `High` → score ≥ 70  
- `Medium` → 40 ≤ score < 70  
- `Low` → score < 40  

This ensures that both AI analysis and business rules contribute to the final classification.
