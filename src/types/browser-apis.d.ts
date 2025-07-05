/**
 * Type definitions for Browser APIs used in Melani OS
 */

// Battery API types
interface BatteryManager {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  dispatchEvent(event: Event): boolean;
}

declare global {
  interface Navigator {
    getBattery: () => Promise<BatteryManager>;
  }
}
