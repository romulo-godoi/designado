# My JW Assignments Tracker 📅


A beautiful, single-page web application designed for Jehovah's Witnesses to easily track their meeting parts and other assignments. Inspired by modern UI design, it offers a clean interface with helpful features, all running locally in your browser.

## ✨ Key Features

*   **📜 JW-Specific Assignments:** Predefined list including meeting parts (Treasures, Ministry, Living as Christians, Watchtower Study), organizational tasks (Audio/Video, Cleaning, Attendant), and special events (Assembly, Convention, Memorial, Bethel Visit).
*   **✏️ Custom Assignments:** Add any unique assignment not on the list.
*   **📅 Interactive Dashboard:**
    *   **Weekly Calendar:** Visualise your upcoming week with assignment markers. Navigate between weeks.
    *   **Upcoming List:** See a quick list of assignments for the next 7 days using relative dates ("Today", "Tomorrow", "This Friday").
*   **💡 Smart & Intuitive:**
    *   **Relative Dates:** Displays assignment dates in an easy-to-understand format ("Tomorrow", "This Wednesday", etc.) in the main list.
    *   **Learning Dropdown:** Prioritizes your most frequently added assignments for faster input.
    *   **Duplicate Prevention:** Warns you if you try to add the same assignment on the same day.
    *   **Past Date Prevention:** Prevents adding or editing assignments to dates already passed.
    *   **Assembly Handling:** Automatically adds entries for Day 1, Day 2, and Day 3 when you add an "Assembly".
*   **✅ Task Management:**
    *   Click on any assignment to access actions: **Complete**, **Edit** (Date/Notes), or **Delete**.
    *   Completed assignments are visually marked (dimmed, strikethrough) and moved to the end of the list.
    *   Completed assignments are excluded from the Dashboard view.
    *   ✨ **Confetti!** Enjoy a satisfying confetti burst when marking an assignment as complete.
*   **🎨 Modern UI:**
    *   **"Black Midnight" Theme:** Dark, elegant, and easy on the eyes.
    *   **Colorful Assignment Cards:** Each active assignment gets a distinct background color for visual appeal.
    *   **Emojis:** Relevant emojis enhance assignment type identification.
    *   **Smooth Transitions:** Subtle animations for a polished user experience.
    *   **Collapsible Sections:** Keep the interface tidy by collapsing the "Add New" and "All Assignments" sections.
    *   **Mobile-First Design:** Optimized for use on mobile devices.
*   **🔒 Purely Client-Side:** All your data is stored *exclusively* in your web browser's `localStorage`. **No data is sent to any server.**

## 💻 Technology Stack

*   **HTML5:** Semantic structure.
*   **CSS3:** Modern styling using Variables, Flexbox, Grid, and Animations.
*   **Vanilla JavaScript (ES6+):** Handles all logic, interactivity, and data storage. No external frameworks.

##🚀 How to Use

1.  **Download:** Get the `[your-filename].html` file (e.g., `index.html` or `assignments.html`) from this repository.
2.  **Open:** Double-click the downloaded `.html` file to open it in your preferred web browser (Chrome, Firefox, Edge, Safari, etc.).
3.  **Use:** Start adding and managing your assignments!

## ⚠️ Important Note: Data Storage

*   **Local Only:** Your assignment data is saved **only** within the browser you use on the device you use. It is **not** backed up online or synced across devices.
*   **Risk of Data Loss:** Clearing your browser's data (cache, cookies, site data, browsing history) **will permanently delete** all your saved assignments. Be cautious when clearing browser data.
*   **Browser/Profile Specific:** Data saved in one browser (e.g., Chrome) is not accessible in another (e.g., Firefox). Data saved in a specific user profile is not accessible in another profile on the same computer.
*   **Incognito/Private Mode:** Data entered in private browsing modes is typically deleted when the private window is closed.


## 🌱 Future Ideas (Maybe?)

*   Data Export/Import feature (e.g., as JSON).
*   Enhanced Notifications (using Web Notifications API).
*   Progressive Web App (PWA) capabilities for offline use and installability.
*   Theme selection.
*   More advanced sorting/filtering options.


---

*Created with organization in mind for fellow Brothers and Sisters.*
