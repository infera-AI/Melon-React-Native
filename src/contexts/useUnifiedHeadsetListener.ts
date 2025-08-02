import { useEffect, useRef } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const { HeadsetDetection } = NativeModules;
const headsetEmitter = new NativeEventEmitter(HeadsetDetection);

export function useUnifiedHeadsetListener(onChange: (isConnected: boolean) => void) {
  const wiredStateRef = useRef(false);
  const bluetoothStateRef = useRef(false);
  const lastStateRef = useRef<boolean | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const triggerChange = () => {
      const newState = wiredStateRef.current || bluetoothStateRef.current;
      if (lastStateRef.current !== newState) {
        lastStateRef.current = newState;
        onChange(newState);
      }
    };

    const debouncedUpdate = () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(triggerChange, 100); // 100ms防抖，可调整
    };

    const initWired = headsetEmitter.addListener('onInitialWiredHeadsetState', (state) => {
      wiredStateRef.current = state;
      debouncedUpdate();
    });

    const initBT = headsetEmitter.addListener('onInitialBluetoothHeadsetState', (state) => {
      bluetoothStateRef.current = state;
      debouncedUpdate();
    });

    const wiredListener = headsetEmitter.addListener('onWiredHeadsetStateChanged', (state) => {
      wiredStateRef.current = state;
      debouncedUpdate();
    });

    const btListener = headsetEmitter.addListener('onBluetoothHeadsetStateChanged', (state) => {
      bluetoothStateRef.current = state;
      debouncedUpdate();
    });

    HeadsetDetection.startListening();

    return () => {
      initWired.remove();
      initBT.remove();
      wiredListener.remove();
      btListener.remove();
      HeadsetDetection.stopListening();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
