# Sewasutra – AI Powered Quotation & Recommendation Platform  

## Project Description  
Sewasutra is a web-based platform that connects clients with verified service providers by  recommending the best service options using AI.  
It bridges the gap between service seekers and providers by enabling requirement posting, AI-powered similarity search and recommendation mechanisms, quotation comparison, negotiation, digital agreements, and secure payments in one unified system.

---

## Major Features  

### 👤 Client  
- User registration and secure login  
- Post service requirements  
- AI-powered similarity search with smart suggestions  
- Compare quotations from service providers  
- Real-time chat with companies for negotiation  
- Digitally review and approve agreements/contracts  
- Make payments using **eSewa** and **Stripe**  
- Provide ratings and reviews to service providers  

---

### 🏢 Service Providers  
- Create and maintain a verified company profile  
- Upload legal documents for verification  
- Showcase past projects and portfolios  
- Submit detailed quotations  
- Real-time chat with clients  
- Track contracts and payment status  
- Receive ratings and reviews  

---

### 🛡 Admin  
- Approve or reject service provider applications  
- User Management
- Dashboard with analytics and reports  

---

## 🧠 AI & Recommendation System  

- **Similarity Search**  
  - Matches client requirements with service providers using text embeddings  
  - Uses cosine similarity to find relevant providers and similar past projects  


---

## 🛠 Tech Stack  

### Frontend (Separate Repository)  
- React.js  
- TypeScript  
- Tailwind CSS  

**State Management**
- Zustand
- React Query (for API caching and synchronization)   

---

### Backend 
- Java for major CRUD
- Node.js for AI
- Hibernate
- Prisma ORM  
- PostgreSQL  
- Hugging Face Sentence Transformer for embeddings
- Pinecone as Vector Database

---

### 💳 Payments  
- eSewa (Local – Nepal)  
- Stripe (International)  

---

### ⚡ Real-time Features  
- Socket.io for:
  - One-to-one chat  
  - Live notifications  

---
