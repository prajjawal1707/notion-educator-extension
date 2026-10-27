// // content.js - Version 8.0 (Semantic Brain + Magic Inspector)

// const ENABLE_VOICE = true;
// let lessonSteps = [];
// let currentStepIndex = 0;
// let activeClickListener = null;

// /* =================================================================================
//    PART 1: THE SEMANTIC BRAIN 🧠 (The "Too Strong" Update)
//    ================================================================================= */

// // Dictionary: Defines what elements DO based on their text
// const ROLE_DEFINITIONS = [
//     { type: 'auth', keywords: ['login', 'sign in', 'log in', 'signin', 'access'], text: "Click here to access your account." },
//     { type: 'signup', keywords: ['sign up', 'register', 'get started', 'create account', 'join'], text: "New here? Use this to create your profile." },
//     { type: 'search', keywords: ['search', 'find', 'lookup'], text: "Type here to find exactly what you need." },
//     { type: 'cart', keywords: ['cart', 'basket', 'checkout', 'bag'], text: "Ready to buy? Manage your items here." },
//     { type: 'help', keywords: ['help', 'support', 'docs', 'faq'], text: "Stuck? Here are the guides and support resources." },
//     { type: 'pricing', keywords: ['pricing', 'plans', 'cost', 'upgrade'], text: "Check the costs and subscription plans here." },
//     { type: 'upload', keywords: ['upload', 'import', 'new project', 'add'], text: "Use this button to create or upload new content." },
//     { type: 'save', keywords: ['save', 'submit', 'apply', 'confirm'], text: "Don't forget to save your changes here." }
// ];

// function getElementRole(element) {
//     // Clean up text to find hidden meanings
//     const text = (element.innerText || element.placeholder || element.ariaLabel || element.title || "").toLowerCase().trim();
//     const id = (element.id || "").toLowerCase();

//     for (let role of ROLE_DEFINITIONS) {
//         // Check if ANY keyword exists in the element's text or ID
//         if (role.keywords.some(k => text.includes(k) || id.includes(k))) {
//             return role;
//         }
//     }
//     return null;
// }

// function generateSmartSteps() {
//     const steps = [];
//     const scannedElements = new Set();
//     const siteName = document.domain.split('.')[0]; // e.g., "github"

//     // 1. Welcome (Centered)
//     steps.push({
//         element: document.querySelector('header') || document.body,
//         text: `Welcome to ${siteName}. I have analyzed the workspace. Let's make you productive.`,
//         position: 'center',
//         trigger: 'manual'
//     });

//     // 2. Scan for Key Workflows (The "Work" part)
//     const candidates = document.querySelectorAll('button, a, input, [role="button"]');

//     candidates.forEach(el => {
//         // Skip invisible/tiny elements
//         if (el.offsetParent === null || el.offsetWidth < 20 || scannedElements.has(el)) return;

//         const role = getElementRole(el);
//         if (role) {
//             steps.push({
//                 element: el,
//                 text: role.text,
//                 trigger: (el.tagName === 'INPUT') ? 'click' : 'manual'
//             });
//             scannedElements.add(el);
//         }
//     });

//     // 3. Fallback: If no semantic roles found, find the main Navigation
//     if (steps.length === 1) {
//         const nav = document.querySelector('nav') || document.querySelector('[role="navigation"]');
//         if (nav) {
//             steps.push({
//                 element: nav,
//                 text: "I found the main menu. Use this to navigate the site.",
//                 trigger: 'manual'
//             });
//         }
//     }

//     // Limit to 8 relevant steps so we don't annoy the user
//     return steps.slice(0, 8);
// }


// /* =================================================================================
//    PART 2: THE TOUR ENGINE (With Smart Positioning)
//    ================================================================================= */
   
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   // 1. Start the Tour
//   if (request.action === "start_highlight") {
//     lessonSteps = generateSmartSteps();
//     if(lessonSteps.length === 0) { alert("Page empty!"); return; }
//     currentStepIndex = 0; showStep(0);
//   } 
//   // 2. Open the Chatbot (THIS WAS MISSING)
//   else if (request.action === "open_chat") {
//     ensureChatbot(); // Make sure the HTML exists
//     const win = document.getElementById('educator-chat-window');
//     const fab = document.getElementById('educator-chat-fab');
    
//     // Force open the window
//     if (win) { 
//         win.style.display = 'flex'; 
//         fab.style.display = 'none'; 
//     }
//   }
// });

// function showStep(index) {
//     removeOverlay();

//     if (index >= lessonSteps.length) {
//         speak("Workflow analysis complete.");
//         return;
//     }

//     const step = lessonSteps[index];

//     if (step.element && step.element.offsetParent !== null) {
//         step.element.scrollIntoView({ behavior: "smooth", block: "center" });
//         createOverlay(step.element, step, index);
//         if (ENABLE_VOICE) speak(step.text);

//         // Interaction Waiter
//         if (step.trigger === 'click') {
//             document.querySelector('.educator-highlight-box').classList.add('educator-waiting-click');
//             const handler = () => {
//                 window.speechSynthesis.cancel();
//                 setTimeout(() => { currentStepIndex++; showStep(currentStepIndex); }, 500);
//             };
//             step.element.addEventListener('click', handler, { once: true });
//             activeClickListener = { element: step.element, handler: handler };
//         }
//     } else {
//         showStep(index + 1);
//     }
// }

// function createOverlay(element, step, index) {
//     const rect = element.getBoundingClientRect();
//     const scrollY = window.scrollY;
//     const scrollX = window.scrollX;

//     // 1. Highlight Box
//     const overlay = document.createElement("div");
//     overlay.className = "educator-highlight-box";
//     Object.assign(overlay.style, {
//         top: (rect.top + scrollY) + "px", left: (rect.left + scrollX) + "px",
//         width: rect.width + "px", height: rect.height + "px"
//     });

//     // 2. Tooltip
//     const tooltip = document.createElement("div");
//     tooltip.className = "educator-tooltip";
//     const pct = ((index + 1) / lessonSteps.length) * 100;

//     // Button Logic
//     let btns = `<button id="edu-close" class="educator-btn btn-close">Done</button>`;
//     if (step.trigger === 'manual') btns = `<button id="edu-next" class="educator-btn btn-next">Next</button>` + btns;
//     else btns = `<span style="font-size:11px; color:#aaa; margin-right:10px;">Click the highlighted item...</span>` + btns;

//     tooltip.innerHTML = `
//     <div class="educator-progress-container"><div class="educator-progress-fill" style="width: ${pct}%"></div></div>
//     <div style="margin-bottom:10px; font-weight:600; font-size:14px;">${step.text}</div>
//     <div class="educator-btn-group">${btns}</div>
//   `;

//     document.body.appendChild(overlay);
//     document.body.appendChild(tooltip);

//     // 3. Smart Positioning (Auto-Flip)
//     const tRect = tooltip.getBoundingClientRect();
//     let top = rect.top + scrollY;
//     let left = rect.left + scrollX + rect.width + 15;

//     if (step.position === 'center') {
//         left = (window.innerWidth / 2) - (tRect.width / 2);
//         top = (window.innerHeight / 2) - (tRect.height / 2);
//         tooltip.style.position = 'fixed';
//         tooltip.style.zIndex = '100001';
//     } else if (left + tRect.width > window.innerWidth) {
//         // Flip to left if no space on right
//         left = rect.left + scrollX - tRect.width - 15;
//     }

//     if (step.position !== 'center') {
//         tooltip.style.top = top + "px";
//         tooltip.style.left = left + "px";
//     } else {
//         tooltip.style.top = top + "px";
//         tooltip.style.left = left + "px";
//     }

//     // Bind Buttons
//     const nextBtn = document.getElementById("edu-next");
//     if (nextBtn) nextBtn.onclick = () => { window.speechSynthesis.cancel(); showStep(++currentStepIndex); };
//     document.getElementById("edu-close").onclick = () => { window.speechSynthesis.cancel(); removeOverlay(); };
// }

// function removeOverlay() {
//     const old = document.querySelector(".educator-highlight-box");
//     if (old) old.remove();
//     const oldText = document.querySelector(".educator-tooltip");
//     if (oldText) oldText.remove();
//     if (activeClickListener) {
//         activeClickListener.element.removeEventListener('click', activeClickListener.handler);
//         activeClickListener = null;
//     }
// }

// function speak(text) {
//     if ('speechSynthesis' in window) {
//         window.speechSynthesis.cancel();
//         const u = new SpeechSynthesisUtterance(text);
//         u.rate = 1.1;
//         window.speechSynthesis.speak(u);
//     }
// }


// /* =================================================================================
//    PART 3: THE CHATBOT & MAGIC INSPECTOR (Combined)
//    ================================================================================= */

// if (window.self === window.top) {
//     setInterval(ensureChatbot, 2000);
// }

// function ensureChatbot() {
//     if (document.getElementById('educator-chat-fab')) return;

//     // FAB
//     const fab = document.createElement('div');
//     fab.id = 'educator-chat-fab';
//     fab.innerHTML = '⚡';
//     Object.assign(fab.style, {
//         position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px',
//         background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', // New Blue Gradient
//         borderRadius: '50%', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
//         cursor: 'pointer', zIndex: '2147483647', display: 'flex', alignItems: 'center',
//         justifyContent: 'center', fontSize: '30px', color: 'white'
//     });

//     // Window
//     const win = document.createElement('div');
//     win.id = 'educator-chat-window';
//     win.innerHTML = `
//         <div style="background:linear-gradient(135deg, #00c6ff 0%, #0072ff 100%); color:white; padding:15px; font-weight:bold; display:flex; justify-content:space-between; align-items:center;">
//             <span>Web Pilot AI</span>
//             <div style="display:flex; gap:10px;">
//                 <span id="chat-inspector-btn" title="Inspect" style="cursor:pointer; font-size:18px;">🪄</span>
//                 <span id="chat-close-btn" style="cursor:pointer;">✕</span>
//             </div>
//         </div>
//         <div id="chat-messages" style="flex:1; padding:15px; background:#f9f9f9; overflow-y:auto; display:flex; flex-direction:column; gap:10px;">
//             <div style="background:#fff; border:1px solid #ddd; padding:10px; border-radius:10px; color:#333; align-self:flex-start;">
//                 I am ready to help you work. Type "guide" to analyze the page, or click 🪄 to inspect items.
//             </div>
//         </div>
//         <div style="padding:10px; border-top:1px solid #eee; background:#fff; display:flex;">
//             <input type="text" id="chat-input" placeholder="Ask or type 'guide'..." style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px;">
//             <button id="chat-send" style="margin-left:5px; background:#0072ff; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">Go</button>
//         </div>
//     `;

//     Object.assign(win.style, {
//         position: 'fixed', bottom: '100px', right: '30px', width: '320px', height: '400px',
//         backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
//         display: 'none', flexDirection: 'column', zIndex: '2147483647',
//         fontFamily: 'Segoe UI, sans-serif', overflow: 'hidden'
//     });

//     document.body.appendChild(fab);
//     document.body.appendChild(win);

//     // Listeners
//     fab.onclick = () => { win.style.display = 'flex'; fab.style.display = 'none'; };
//     document.getElementById('chat-close-btn').onclick = () => { win.style.display = 'none'; fab.style.display = 'flex'; };
//     document.getElementById('chat-inspector-btn').onclick = toggleInspectorMode;

//     // Messaging Logic
//     const send = () => {
//         const val = document.getElementById('chat-input').value.trim();
//         if (!val) return;
//         addBubble(val, '#0072ff', 'white', 'flex-end');
//         document.getElementById('chat-input').value = '';

//         setTimeout(() => {
//             // Intelligent Chat Response
//             if (val.toLowerCase().includes('guide') || val.toLowerCase().includes('start')) {
//                 addBubble("Scanning page workflow...", '#eee', '#333', 'flex-start');
//                 lessonSteps = generateSmartSteps();
//                 currentStepIndex = 0; showStep(0);
//             } else if (val.toLowerCase().includes('login')) {
//                 const logins = generateSmartSteps().filter(s => s.text.includes('access'));
//                 if (logins.length > 0) {
//                     lessonSteps = logins; currentStepIndex = 0; showStep(0);
//                     addBubble("I highlighted the Login area for you.", '#eee', '#333', 'flex-start');
//                 } else {
//                     addBubble("I couldn't find a standard login button.", '#eee', '#333', 'flex-start');
//                 }
//             } else {
//                 addBubble("Try typing 'guide' to see workflows, or use the Wand 🪄.", '#eee', '#333', 'flex-start');
//             }
//         }, 600);
//     };

//     document.getElementById('chat-send').onclick = send;
//     document.getElementById('chat-input').onkeypress = (e) => { if (e.key === 'Enter') send(); };
// }

// function addBubble(text, bg, color, align) {
//     const container = document.getElementById('chat-messages');
//     const div = document.createElement('div');
//     div.innerText = text;
//     Object.assign(div.style, { background: bg, color: color, padding: '8px 12px', borderRadius: '10px', maxWidth: '80%', alignSelf: align, marginBottom: '5px' });
//     container.appendChild(div);
//     container.scrollTop = container.scrollHeight;
// }

// /* =================================================================================
//    PART 4: THE MAGIC INSPECTOR 🪄
//    ================================================================================= */

// let isInspectorActive = false;
// let hoveredElement = null;

// function toggleInspectorMode() {
//     isInspectorActive = !isInspectorActive;
//     const btn = document.getElementById('chat-inspector-btn');

//     if (isInspectorActive) {
//         btn.style.textShadow = '0 0 5px #fff'; // Glow effect
//         document.body.style.cursor = 'help';
//         document.addEventListener('mouseover', handleInspectorHover);
//         document.addEventListener('click', handleInspectorClick, { capture: true });
//         addBubble("Inspector ON. Click any element to analyze it.", '#eee', '#333', 'flex-start');
//     } else {
//         disableInspector();
//         addBubble("Inspector OFF.", '#eee', '#333', 'flex-start');
//     }
// }

// function disableInspector() {
//     isInspectorActive = false;
//     document.getElementById('chat-inspector-btn').style.textShadow = 'none';
//     document.body.style.cursor = 'default';
//     if (hoveredElement) hoveredElement.style.outline = 'none';
//     document.removeEventListener('mouseover', handleInspectorHover);
//     document.removeEventListener('click', handleInspectorClick, { capture: true });
// }

// function handleInspectorHover(e) {
//     if (!isInspectorActive || e.target.closest('#educator-chat-window')) return;
//     if (hoveredElement) hoveredElement.style.outline = 'none';
//     hoveredElement = e.target;
//     hoveredElement.style.outline = '3px solid #ff0055'; // Pink outline
// }

// function handleInspectorClick(e) {
//     if (!isInspectorActive || e.target.closest('#educator-chat-window')) return;
//     e.preventDefault(); e.stopPropagation();

//     const el = e.target;
//     const role = getElementRole(el); // Use the Semantic Brain
//     let msg = `That is a <b style="color:#0072ff">${el.tagName}</b>. `;

//     if (role) msg += `<br><b>Function:</b> ${role.text}`;
//     else if (el.tagName === 'IMG') msg += "It is an image content.";
//     else if (el.tagName === 'A') msg += `It links to: <i>${el.href.substring(0, 30)}...</i>`;
//     else msg += `Content: "${el.innerText.substring(0, 50)}..."`;

//     addBubble(msg, '#eee', '#333', 'flex-start'); // Show result in chat
//     disableInspector(); // Auto-off
// }

// /* =================================================================================
//    PART 5: THE AGENT 🕵️‍♂️ (Automation Engine)
//    ================================================================================= */

// function processCommand(cmd) {
//     cmd = cmd.toLowerCase();

//     // COMMAND 1: "Search for..."
//     if (cmd.includes('search for') || cmd.includes('type')) {
//         const query = cmd.replace('search for', '').replace('type', '').trim();
//         addBubble(`🔍 Looking for search bar to type "${query}"...`, '#eee', '#333', 'flex-start');

//         // Find Search Input
//         const inputs = Array.from(document.querySelectorAll('input'));
//         const searchInput = inputs.find(i => i.type === 'search' || i.placeholder.toLowerCase().includes('search') || i.className.includes('search'));

//         if (searchInput) {
//             simulateTyping(searchInput, query);
//             addBubble("✅ Typed it! Pressing Enter...", '#eee', '#333', 'flex-start');
//         } else {
//             addBubble("❌ Could not find a search bar.", '#ffdddd', '#a00', 'flex-start');
//         }
//     }
//     // COMMAND 2: "Go to Login" / "Click Signup"
//     else if (cmd.includes('login') || cmd.includes('sign in') || cmd.includes('click')) {
//         addBubble("👆 Scanning for button...", '#eee', '#333', 'flex-start');

//         const keyword = cmd.includes('login') ? 'login' : (cmd.includes('sign') ? 'sign' : cmd.replace('click', '').trim());
//         const btns = Array.from(document.querySelectorAll('a, button'));
//         const target = btns.find(b => b.innerText.toLowerCase().includes(keyword));

//         if (target) {
//             target.style.border = "3px solid red"; // Highlight before click
//             setTimeout(() => { target.click(); }, 1000); // Click after 1s
//             addBubble(`✅ Clicking "${target.innerText}"...`, '#eee', '#333', 'flex-start');
//         } else {
//             addBubble(`❌ Could not find a button for "${keyword}".`, '#ffdddd', '#a00', 'flex-start');
//         }
//     }
//     // COMMAND 3: Guide
//     else if (cmd.includes('guide')) {
//         lessonSteps = generateSmartSteps();
//         currentStepIndex = 0; showStep(0);
//         addBubble("🚀 Starting tour.", '#eee', '#333', 'flex-start');
//     }
//     else {
//         addBubble("Try: 'Search for laptops' or 'Click Login'", '#eee', '#333', 'flex-start');
//     }
// }

// // HELPER: Simulates human typing
// function simulateTyping(element, text) {
//     element.scrollIntoView({ behavior: "smooth", block: "center" });
//     element.focus();
//     element.value = ""; // Clear first

//     // Type character by character visually (fast)
//     let i = 0;
//     const interval = setInterval(() => {
//         if (i >= text.length) {
//             clearInterval(interval);
//             // Try to trigger Enter key
//             element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', which: 13, bubbles: true }));
//         } else {
//             element.value += text[i];
//             i++;
//         }
//     }, 50); // Speed of typing
// }

// content.js - Version 11.0 (The Contextual Agent)

const ENABLE_VOICE = true; 
let lessonSteps = []; 
let currentStepIndex = 0;
let activeClickListener = null;

/* =================================================================================
   PART 1: THE SEMANTIC BRAIN 🧠 (Dictionary)
   ================================================================================= */

const ROLE_DEFINITIONS = [
    // AUTHENTICATION
    { type: 'login', keywords: ['login', 'sign in', 'log in', 'signin', 'access account'], text: "Click here to Log In." },
    { type: 'signup', keywords: ['sign up', 'register', 'create account', 'join', 'get started'], text: "Click here to Create a New Account." },
    
    // CREATION (Notion/Docs style)
    { type: 'create', keywords: ['new page', 'add page', 'create', 'plus', '+', 'new item', 'compose'], text: "Click here to Create a New Page or Item." },
    
    // COMMERCE
    { type: 'cart', keywords: ['cart', 'basket', 'checkout', 'bag'], text: "View your Shopping Cart." },
    { type: 'pricing', keywords: ['pricing', 'plans', 'cost', 'upgrade', 'subscription'], text: "View Pricing & Plans." },
    
    // UTILITY
    { type: 'search', keywords: ['search', 'find', 'lookup', 'query'], text: "Type here to Search." },
    { type: 'save', keywords: ['save', 'submit', 'confirm', 'done', 'apply'], text: "Save your work." },
    { type: 'settings', keywords: ['settings', 'config', 'preferences', 'profile'], text: "Adjust your Settings here." }
];

function getElementRole(element) {
    const text = (element.innerText || element.placeholder || element.ariaLabel || element.title || "").toLowerCase().trim();
    const id = (element.id || "").toLowerCase();
    const classList = (element.className || "").toLowerCase();
    
    for (let role of ROLE_DEFINITIONS) {
        if (role.keywords.some(k => text.includes(k) || id.includes(k) || classList.includes(k))) {
            return role;
        }
    }
    return null;
}

// === THE SMART FILTER ===
function generateFocusedSteps(targetRoleType = null) {
    const steps = [];
    const scannedElements = new Set();
    const scannedRoleTypes = new Set(); // To avoid repetition in General Tour
    const siteName = document.domain.split('.')[0];

    // 1. WELCOME MESSAGE
    if (!targetRoleType) {
        // GENERAL TOUR WELCOME
        steps.push({
            element: document.querySelector('header') || document.body,
            text: `Welcome to ${siteName}. I'll show you the main features (Login, Search, Tools).`,
            position: 'center', trigger: 'manual'
        });
    } else {
        // SPECIFIC TASK WELCOME
        steps.push({
            element: document.body,
            text: `Okay, focused mode enabled. Looking for "${targetRoleType}" buttons only.`,
            position: 'center', trigger: 'manual'
        });
    }

    // 2. SCAN THE PAGE
    const candidates = document.querySelectorAll('button, a, input, [role="button"], div[role="button"], .btn');
    
    candidates.forEach(el => {
        if (el.offsetParent === null || el.offsetWidth < 10 || scannedElements.has(el)) return;
        
        const role = getElementRole(el);
        
        if (role) {
            // === LOGIC SPLIT ===
            
            // MODE A: SPECIFIC TASK (e.g., "Show me Signup")
            // We ONLY add elements that match the targetRoleType.
            if (targetRoleType && role.type === targetRoleType) {
                steps.push({
                    element: el, text: role.text,
                    trigger: (el.tagName === 'INPUT') ? 'click' : 'manual'
                });
                scannedElements.add(el);
            }

            // MODE B: GENERAL TOUR (e.g., "Guide me")
            // We want VARIETY. We only add one of each type (1 Login, 1 Search, 1 Cart).
            // We do NOT add specific 'create' buttons unless asked, to keep it high-level.
            else if (!targetRoleType && !scannedRoleTypes.has(role.type)) {
                steps.push({
                    element: el, text: role.text,
                    trigger: (el.tagName === 'INPUT') ? 'click' : 'manual'
                });
                scannedElements.add(el);
                scannedRoleTypes.add(role.type); // Mark this type as "shown"
            }
        }
    });

    return steps.slice(0, 10);
}


/* =================================================================================
   PART 2: THE VISUAL UI (Tour Guide)
   ================================================================================= */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "start_highlight") {
    // Default to General Tour if clicked from Popup
    lessonSteps = generateFocusedSteps(null);
    if(lessonSteps.length === 0) { alert("Page empty!"); return; }
    currentStepIndex = 0; showStep(0);
  } else if (request.action === "open_chat") {
    ensureChatbot(); 
    const win = document.getElementById('educator-chat-window');
    const fab = document.getElementById('educator-chat-fab');
    if (win) { win.style.display = 'flex'; fab.style.display = 'none'; }
  }
});

function showStep(index) {
  removeOverlay();
  if (index >= lessonSteps.length) { speak("Guide complete."); return; }
  const step = lessonSteps[index];
  
  if (step.element && (step.element === document.body || step.element.offsetParent !== null)) { 
    if(step.element !== document.body) step.element.scrollIntoView({ behavior: "smooth", block: "center" });
    createOverlay(step.element, step, index);
    if (ENABLE_VOICE) speak(step.text);

    if (step.trigger === 'click' && step.element !== document.body) {
        const handler = () => {
            window.speechSynthesis.cancel();
            setTimeout(() => { currentStepIndex++; showStep(currentStepIndex); }, 500);
        };
        step.element.addEventListener('click', handler, { once: true });
        activeClickListener = { element: step.element, handler: handler };
    }
  } else { showStep(index + 1); }
}

function createOverlay(element, step, index) {
  const rect = (element === document.body) ? {top:0, left:0, width:0, height:0} : element.getBoundingClientRect();
  const overlay = document.createElement("div");
  overlay.className = "educator-highlight-box";
  
  if(element !== document.body) {
      Object.assign(overlay.style, { top: (rect.top + window.scrollY)+"px", left: (rect.left + window.scrollX)+"px", width: rect.width+"px", height: rect.height+"px" });
      document.body.appendChild(overlay);
  }

  const tooltip = document.createElement("div");
  tooltip.className = "educator-tooltip";
  
  let btns = `<button id="edu-close" class="educator-btn btn-close">Close</button>`;
  if (index < lessonSteps.length - 1) btns = `<button id="edu-next" class="educator-btn btn-next">Next</button>` + btns;

  tooltip.innerHTML = `<div style="font-weight:600; margin-bottom:10px;">${step.text}</div><div class="educator-btn-group">${btns}</div>`;

  let top, left;
  if (step.position === 'center' || element === document.body) {
      Object.assign(tooltip.style, { position:'fixed', top:'50%', left:'50%', transform:'translate(-50%, -50%)', zIndex:'100000' });
  } else {
      top = rect.top + window.scrollY;
      left = rect.left + window.scrollX + rect.width + 15;
      if (left + 250 > window.innerWidth) left = rect.left + window.scrollX - 265;
      tooltip.style.top = top + "px"; tooltip.style.left = left + "px";
  }

  document.body.appendChild(tooltip);
  
  const nextBtn = document.getElementById("edu-next");
  if(nextBtn) nextBtn.onclick = () => { window.speechSynthesis.cancel(); showStep(++currentStepIndex); };
  document.getElementById("edu-close").onclick = () => { window.speechSynthesis.cancel(); removeOverlay(); };
}

function removeOverlay() { document.querySelectorAll(".educator-highlight-box, .educator-tooltip").forEach(el => el.remove()); }
function speak(text) { if (ENABLE_VOICE) { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(text)); }}


/* =================================================================================
   PART 3: THE CHATBOT & NLP ENGINE 🕵️‍♂️
   ================================================================================= */

if (window.self === window.top) setInterval(ensureChatbot, 2000);

function ensureChatbot() {
    if (document.getElementById('educator-chat-fab')) return;

    const fab = document.createElement('div');
    fab.id = 'educator-chat-fab';
    fab.innerHTML = '🤖'; 
    Object.assign(fab.style, {
        position:'fixed', bottom:'30px', right:'30px', width:'60px', height:'60px',
        background:'#007bff', borderRadius:'50%', boxShadow:'0 4px 15px rgba(0,0,0,0.3)',
        cursor:'pointer', zIndex:'2147483647', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', color:'white'
    });
    
    const win = document.createElement('div');
    win.id = 'educator-chat-window';
    win.innerHTML = `
        <div style="background:#007bff; color:white; padding:15px; font-weight:bold; display:flex; justify-content:space-between;">
            <span>Web Agent</span><span id="chat-close" style="cursor:pointer;">✕</span>
        </div>
        <div id="chat-msg" style="flex:1; padding:15px; background:#f4f4f4; overflow-y:auto; display:flex; flex-direction:column; gap:10px;">
            <div style="background:#fff; padding:10px; border-radius:8px; align-self:flex-start; font-size:13px; color:#333;">
                Hi! Try: <br>• "Guide me" (Full Tour) <br>• "I want to sign up" (Specific) <br>• "Make a page" (Specific)
            </div>
        </div>
        <div style="padding:10px; background:#fff; display:flex;">
            <input id="chat-in" type="text" placeholder="Type here..." style="flex:1; padding:8px; border:1px solid #ccc;">
            <button id="chat-go" style="margin-left:5px; background:#007bff; color:white; border:none; padding:8px;">Go</button>
        </div>
    `;
    
    Object.assign(win.style, {
        position:'fixed', bottom:'100px', right:'30px', width:'300px', height:'400px',
        background:'white', borderRadius:'12px', boxShadow:'0 10px 40px rgba(0,0,0,0.2)',
        display:'none', flexDirection:'column', zIndex:'2147483647', fontFamily:'sans-serif'
    });

    document.body.appendChild(fab);
    document.body.appendChild(win);

    fab.onclick = () => { win.style.display = 'flex'; fab.style.display = 'none'; };
    document.getElementById('chat-close').onclick = () => { win.style.display = 'none'; fab.style.display = 'flex'; };

    const send = () => {
        const val = document.getElementById('chat-in').value;
        if(!val) return;
        addBubble(val, '#007bff', 'white', 'flex-end');
        document.getElementById('chat-in').value = '';
        processCommand(val); 
    };

    document.getElementById('chat-go').onclick = send;
    document.getElementById('chat-in').onkeypress = (e) => { if(e.key==='Enter') send(); };
}

function addBubble(text, bg, color, align) {
    const d = document.createElement('div');
    d.innerText = text;
    Object.assign(d.style, { background:bg, color:color, padding:'8px 12px', borderRadius:'10px', maxWidth:'80%', alignSelf:align, fontSize:'13px' });
    document.getElementById('chat-msg').appendChild(d);
    document.getElementById('chat-msg').scrollTop = 99999;
}

// === THE STRONG PART: INTENT RECOGNITION ===
function processCommand(cmd) {
    cmd = cmd.toLowerCase();
    let targetRole = null;
    let reply = "";

    // 1. CHECK FOR GENERAL TOUR REQUEST
    if (cmd.includes('guide') || cmd.includes('tour') || cmd.includes('how does this work') || cmd.includes('help')) {
        targetRole = null; // NULL means "Show everything important"
        reply = "Starting the full workspace tour...";
    }
    // 2. CHECK FOR SPECIFIC REQUESTS
    else if (cmd.includes('sign up') || cmd.includes('register')) {
        targetRole = 'signup';
        reply = "Focusing on Sign Up options...";
    }
    else if (cmd.includes('login') || cmd.includes('sign in')) {
        targetRole = 'login';
        reply = "Focusing on Login options...";
    }
    else if (cmd.includes('make a page') || cmd.includes('new page') || cmd.includes('create')) {
        targetRole = 'create';
        reply = "Looking for creation buttons...";
    }
    else if (cmd.includes('cart') || cmd.includes('checkout')) {
        targetRole = 'cart';
        reply = "Finding the cart...";
    }
    else {
        // Fallback to general tour if we don't understand
        targetRole = null;
        reply = "I'll give you a general tour.";
    }

    addBubble(reply, '#eee', '#333', 'flex-start');

    // Execute the appropriate logic
    setTimeout(() => {
        lessonSteps = generateFocusedSteps(targetRole);
        
        if (lessonSteps.length > 0) {
            currentStepIndex = 0; 
            showStep(0);
        } else {
            addBubble(`❌ I couldn't find exactly what you asked for.`, '#ffdddd', '#a00', 'flex-start');
        }
    }, 600);
}