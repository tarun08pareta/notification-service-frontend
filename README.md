# Enterprise Notification Dashboard (Frontend)

A responsive, high-performance administrative console built with **Angular 16+** and **TypeScript**. This dashboard serves as the control center for the **Centralized Notification & Alerting Engine**, allowing system administrators to securely monitor delivery metrics, inspect failure logs, and configure platform rate limits in real-time.

---

## 🖥️ Core Dashboard Features

* **Real-time Analytics Dashboard:** Utilizes responsive charts and status metrics to provide instant insights into notification success, failure, and pending queues.
* **Reactive Logging Panel:** Implements an advanced, searchable datatable using **RxJS Observables** to display real-time delivery logs, complete with detailed error messages for troubleshooting failed SMS/Emails.
* **Dynamic Configuration Manager:** A dedicated administrative interface that sends instant payload configurations to the Spring Boot backend to modify user rate limits dynamically (e.g., maximum OTPs allowed per minute).
* **Secure JWT Session Management:** Integrated with **Angular Route Guards** and automated **HTTP Interceptors** that securely attach JWT Bearer tokens to all outgoing backend API calls, preventing unauthorized administrative access.

---

## 🛠️ Architecture & Best Practices

* **Unsubscription Management:** Strict handling of RxJS subscriptions to eliminate any possibility of frontend memory leaks during heavy data streaming.
* **Component-Service Decoupling:** Complete separation of concerns where components only display the UI state, and all HTTP communications and state logic are handled via dedicated Angular Services.
* **Clean State Handling:** Built using modern Angular state practices to avoid page flickers or unnecessary re-renders when data updates.

---

## 📂 Directory Structure

```text
notification-frontend/
├── src/
│   ├── app/
│   │   ├── components/            # Layouts: Dashboard, LogTable, ConfigForm
│   │   ├── services/              # NotificationService, AuthService (API calls)
│   │   ├── interceptors/          # AuthInterceptor (Attaches JWT to backend calls)
│   │   ├── guards/                # AuthGuard (Secures admin routing)
│   │   └── app-routing.module.ts  # Standard Angular Routing setup
│   ├── assets/                    # Shared images, styles, and branding
│   └── environments/              # Environment configurations (dev/prod target endpoints)
└── package.json
```

---

## ⚡ Development Setup

1. Run `npm install` to set up all node modules and dependencies.
2. Ensure your backend target URLs are correctly mapped in `src/environments/environment.ts`.
3. Launch the development server using `ng serve` and access the panel locally at `http://localhost:4200/`.
