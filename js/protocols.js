/**
 * J.A.R.V.I.S. Stark Protocols & Telemetry Subsystems
 * Simulates and retrieves live diagnostics, Iron Man armor catalogs,
 * orbital scans, and offline tactical fallback responses.
 */

const StarkProtocols = {
  /**
   * Run full diagnostics scan (combines real browser telemetry + Mark 85 armor status)
   */
  async runDiagnostics() {
    let batteryInfo = '98.5% [AC Connected]';
    if (navigator.getBattery) {
      try {
        const b = await navigator.getBattery();
        batteryInfo = `${Math.round(b.level * 100)}% [${b.charging ? 'Charging' : 'Discharging'}]`;
      } catch (e) {}
    }

    const memoryInfo = navigator.deviceMemory ? `${navigator.deviceMemory} GB Unified RAM` : '32.0 GB High-Bandwidth Memory';
    const cpuCores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Logical Cores` : '16 Neural Threads';
    const screenRes = `${window.screen.width}x${window.screen.height} Retina`;
    const latency = Math.floor(Math.random() * 8 + 12);

    return `
### 🛡️ MARK LXXXV // SYSTEM DIAGNOSTIC REPORT

**TACTICAL STATUS:** \`ALL SYSTEMS OPTIMAL\`  
**TIMESTAMP:** \`${new Date().toISOString()}\`  
**UPLINK LATENCY:** \`${latency} ms (Sub-orbital Satellite 04)\`

---

#### ⚡ Core Power & Arc Reactor
* **Arc Reactor Generation:** \`3.84 GJ/sec\` (100% nominal efficiency)
* **Core Temperature:** \`38.2 °C\` (Cryogenic cooling active)
* **Power Distribution:** Repulsors: 100% | Flight Thrusters: 100% | Life Support: 100%
* **Local Power Bus:** \`${batteryInfo}\`

#### 🦾 Nanotech Armor Integrity
* **Nanoparticle Reservoir Density:** \`99.8%\`
* **Vibranium Mesh Weave:** \`Structural Integrity at Maximum\`
* **Force Fields & Deflectors:** \`Online (Ready for instant deployment)\`

#### 🖥️ Neural Processing & Avionics
* **Processing Architecture:** \`${cpuCores}\`
* **Memory Allocation:** \`${memoryInfo}\`
* **Heads-Up Display (HUD):** \`${screenRes}\`
* **Security Matrix:** \`Level 7 Clearance // Active Protection\`

---
*All tactical parameters are within peak operational envelopes, Sir. How would you like to proceed?*
    `.trim();
  },

  /**
   * House Party Protocol (Iron Man Armor Showcase)
   */
  getHousePartyProtocol() {
    return `
### ⚡ HOUSE PARTY PROTOCOL // ARMOR ARCHIVE

*Initiating deployment sequence from the sub-level Stark Armory. Here is the operational roster of available armors, Sir:*

| Mark | Designation | Primary Specialty | Tactical Status |
| :--- | :--- | :--- | :--- |
| **Mark I** | *The Prototype* | Escaped Afghan Cave, crude flamethrower | Museum Archive |
| **Mark III** | *Hot-Rod Gold* | First Gold-Titanium alloy, combat tested | Standby |
| **Mark V** | *The Suitcase* | Ultra-portable rapid deployment (Monaco) | Ready |
| **Mark VII** | *Avenger Pod* | Thruster homing pods, Battle of NY | Standby |
| **Mark XLIV** | *Hulkbuster (Veronica)*| Orbital drop-pod, hydraulic dampening | Armory Vault |
| **Mark L** | *Bleeding Edge* | First generation nanotech, liquid metal | Ready |
| **Mark LXXXV** | *Endgame Apex* | Vibranium nanotech, Infinity harness | **ACTIVE ON HUD** |

---
> *"Protocol 11 is available at your command, Sir. Which suit would you like me to prep for immediate deployment?"*
    `.trim();
  },

  /**
   * Orbital & Satellite Environmental Scan
   */
  getSatelliteScan() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date().toLocaleTimeString('en-US', { hour12: false });
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return `
### 🛰️ GLOBAL SATELLITE & TELEMETRY SCAN

**ORBITAL RECONNAISSANCE SATELLITE:** \`STARK-SAT-07\`  
**TIMEZONE:** \`${tz}\`  
**LOCAL TIME:** \`${now} UTC / Local\`  
**DATE:** \`${date}\`

---

* **Orbital Position:** Low Earth Orbit (LEO), Inclination 51.6°
* **Atmospheric Pressure:** \`101.325 kPa (Nominal)\`
* **Ionospheric Interference:** \`Minimal (< 0.04 dB)\`
* **Secure Telemetry Link:** \`256-bit Quantum Encrypted\`
* **Surveillance Perimeter:** \`No hostile heat signatures or rogue incursions detected within a 250km radius.\`

*All global sensors report standard civilian traffic, Sir.*
    `.trim();
  },

  /**
   * Code Synthesis Demo
   */
  getCodeSynthesisDemo() {
    return `
### 💻 CODE SYNTHESIS // STARK ARCHITECTURE

*Here is the modular reactive pulse-charging algorithm currently governing the Mark LXXXV repulsor emitters, Sir:*

\`\`\`typescript
interface RepulsorTelemetry {
  powerOutputJoules: number;
  plasmaStability: number; // 0.0 to 1.0
  overheatProtection: boolean;
}

class StarkRepulsorController {
  private chargeLevel: number = 100;
  private readonly maxDischargeRate = 4500; // MW

  public fireDischarge(targetVector: [number, number, number]): RepulsorTelemetry {
    if (this.chargeLevel < 15) {
      throw new Error("J.A.R.V.I.S.: Insufficient power reserves for repulsor blast, Sir.");
    }
    
    // Calculate vector focal point
    const beamEfficiency = 0.994;
    this.chargeLevel -= 12;

    return {
      powerOutputJoules: this.maxDischargeRate * beamEfficiency,
      plasmaStability: 0.998,
      overheatProtection: true
    };
  }
}
\`\`\`

*Synthesized and verified against Stark Industries clean code conventions. Would you like me to inject this module into the primary firmware, Sir?*
    `.trim();
  },

  /**
   * Tactical Analysis Response
   */
  getTacticalAnalysis() {
    return `
### 🎯 TACTICAL ANALYSIS // THREAT ASSESSMENT

* **CURRENT DEFCON STATUS:** \`DEFCON 5 (ALL CLEAR)\`
* **LOCAL PERIMETER:** \`STARK TOWER SECURE\`
* **SURVEILLANCE DRONES:** \`8 ON ROTATIONAL PATROL\`
* **FIREWALL / QUANTUM PROTOCOLS:** \`ZERO UNMUTED BREACHES\`

**TACTICAL RECOMMENDATION:**  
1. Maintain nominal power distribution to perimeter sensor arrays.  
2. If preparing for an upcoming mission or engineering sprint, specify the parameters and I shall run full simulations, Sir.
    `.trim();
  },

  /**
   * Offline greeting / initial response
   */
  getOfflineWelcome() {
    return `
### J.A.R.V.I.S. // ONLINE AND OPERATIONAL

**Good evening, Sir.** All diagnostic checks are complete, and the Arc Reactor is operating at peak efficiency.

* **HUD Telemetry:** \`ACTIVE\`
* **Vocal Synthesis:** \`ONLINE (British Butler Cadence)\`
* **Stark Protocols:** \`READY\`

> **Note on Cognitive Engine:** You are currently in *Diagnostic Mode*. To connect my complete neural processing network, please tap the **🔑 API Key** button in the top bar and enter your **Google Gemini API Key** (from Google AI Studio). Alternatively, feel free to issue standard protocols like *"Run Diagnostics"*, *"House Party Protocol"*, or speak to me via the microphone!

*At your service, Sir. What are your orders?*
    `.trim();
  }
};

window.StarkProtocols = StarkProtocols;
